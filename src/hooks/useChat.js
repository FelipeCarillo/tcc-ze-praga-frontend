import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import {
  sendMessage,
  sendMessageStream,
  resumeMessage,
  resumeMessageStream,
} from "../services/chatService";
import { CHAT_STREAMING } from "../config/runtime";
import {
  getSessionMessages,
  closeSession,
  getPendingInterrupt,
} from "../services/sessionsService";
import { getDiagnosisById } from "../services/historyService";
import { getActiveTalhao, setActiveTalhao } from "../services/activeTalhao";
import { setActiveFazendaId } from "../services/activeFazenda";
// TCC-093: o laudo nasce no talhão escolhido na tela do chat.
function talhaoOptions() {
  const talhao = getActiveTalhao();
  return talhao ? { talhaoId: talhao.id, talhaoNome: talhao.nome } : {};
}
// A conversa começa vazia: a saudação do Zé é a tela vazia do chat
// (m-Chat-Vazio), não uma mensagem que fica no topo da conversa.
const initial = () => [];
function describe(error) {
  const status = error?.response?.status;
  if (status === 401)
    return "Sua sessão expirou. Entre novamente para continuar.";
  if (status === 429)
    return "Você atingiu o limite de uso. Confira sua cota e os planos disponíveis.";
  if (status === 413)
    return "A foto é grande demais. Escolha uma imagem de até 10 MB.";
  if (status >= 500)
    return "O servidor está com instabilidade. Tente novamente em instantes.";
  return "Não foi possível processar sua mensagem. Confira a conexão e tente novamente.";
}
/**
 * Sem streaming o servidor só responde no fim do turno. Para a espera não
 * parecer travada, o indicador avança pelas etapas que o agente percorre (o
 * system prompt fixa a ordem com foto: inspect_image → analyze_image → plano
 * de ação). São rótulos de `copy.chat.tools`; os tempos são estimativas.
 */
function doneSteps(steps) {
  return (steps || []).map((s) => ({ ...s, done: true }));
}
export function progressSteps({ hasImage = false, hasAudio = false } = {}) {
  const offset = hasAudio ? 2500 : 0;
  const steps = hasAudio ? [["_listening", 0]] : [];
  if (hasImage)
    return steps.concat([
      ["inspect_image", offset],
      ["analyze_image", offset + 3500],
      ["get_action_plan", offset + 9000],
      ["_writing", offset + 15000],
    ]);
  return steps.concat([
    [null, offset],
    ["_writing", offset + 6000],
  ]);
}
export default function useChat() {
  const [messages, setMessages] = useState(initial),
    [isLoading, setLoading] = useState(false),
    [sessionId, setSessionId] = useState(null),
    [pendingInterrupt, setInterrupt] = useState(null);
  const generation = useRef(0),
    controller = useRef(null),
    busy = useRef(false),
    urls = useRef([]);
  const cancel = useCallback(() => {
    generation.current++;
    controller.current?.abort();
    controller.current = null;
    busy.current = false;
    setLoading(false);
  }, []);
  useEffect(
    () => () => {
      generation.current++;
      controller.current?.abort();
      urls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );
  const run = useCallback(
    async (
      text,
      imageFile,
      modelId,
      audioFile,
      mode,
      currentInterrupt = null,
    ) => {
      if (busy.current || (!currentInterrupt && pendingInterrupt)) return false;
      busy.current = true;
      setLoading(true);
      const gen = ++generation.current;
      const ctrl = new AbortController();
      controller.current = ctrl;
      const valid = () => generation.current === gen && !ctrl.signal.aborted;
      // Resposta a uma pergunta segue o transporte do turno que a fez.
      const streaming =
        mode === "resume" ? currentInterrupt?.via !== "sync" : mode === "stream";
      const imageUrl = imageFile ? URL.createObjectURL(imageFile) : null;
      if (imageUrl) urls.current.push(imageUrl);
      // A foto sozinha já é a mensagem (m-Chat-Analisando): sem texto de
      // preenchimento no balão.
      const user = {
        id: uuid(),
        role: "user",
        content: text || (audioFile ? "Mensagem de voz" : ""),
        isVoice: Boolean(audioFile && !text),
        imageUrl,
        timestamp: new Date().toISOString(),
      };
      const id = uuid();
      const placeholder = {
        id,
        role: "assistant",
        content: "",
        diagnosis: null,
        isStreaming: true,
        // Turno com foto: a UI mostra a varredura e os passos da análise.
        hasImage: Boolean(imageFile),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, user, placeholder]);
      if (currentInterrupt) setInterrupt(null);
      const update = (change) => {
        if (valid())
          setMessages((prev) =>
            prev.map((m) =>
              m.id === id
                ? {
                    ...m,
                    ...(typeof change === "function" ? change(m) : change),
                  }
                : m,
            ),
          );
      };
      const step = (name) =>
        update((m) => {
          const steps = doneSteps(m.steps);
          const last = steps[steps.length - 1];
          if (last && last.name === name) last.done = false;
          else steps.push({ name, done: false });
          return { steps, toolCall: name };
        });
      const callbacks = {
        onToken: (chunk) => update((m) => ({ content: m.content + chunk })),
        // Passos do agente (m-Chat): cada ferramenta entra como passo em
        // andamento e vira "feito" quando a próxima começa ou o resultado chega.
        onToolCall: (name) => step(name),
        onToolResult: () =>
          update((m) => ({ toolCall: null, steps: doneSteps(m.steps) })),
        onDiagnosis: (diagnosis) =>
          update({ diagnosis, diagnosisId: diagnosis?.id }),
        // TCC-098: o Zé escolheu ou cadastrou o talhão — vira o ativo, e o
        // cartão "Talhão criado" aparece na resposta.
        onTalhao: (talhao) => {
          if (!valid() || !talhao) return;
          update({ talhao });
          setActiveTalhao({ id: talhao.id, nome: talhao.nome });
          if (talhao.fazendaId) setActiveFazendaId(talhao.fazendaId);
        },
        onTranscript: (content) => {
          if (valid() && content)
            setMessages((prev) =>
              prev.map((m) =>
                m.id === user.id ? { ...m, content, isTranscript: true } : m,
              ),
            );
        },
        onInterrupt: (info) => {
          // `via` guarda o transporte do turno: a resposta à pergunta segue
          // pelo mesmo caminho (SSE ou síncrono).
          // A pergunta fica na conversa como fala do Zé depois de respondida.
          if (valid() && info?.question) update({ question: info.question });
          if (valid() && info)
            setInterrupt({
              ...info,
              sessionId: currentInterrupt?.sessionId || sessionId,
              via: streaming ? "stream" : "sync",
            });
        },
        onDone: (sid) => {
          if (valid() && sid) {
            setSessionId(sid);
            setInterrupt((cur) => (cur ? { ...cur, sessionId: sid } : null));
          }
        },
      };
      const timers = streaming
        ? []
        : progressSteps({
            hasImage: Boolean(imageFile),
            hasAudio: Boolean(audioFile),
          }).map(([toolCall, ms]) =>
            setTimeout(() => (toolCall ? step(toolCall) : null), ms),
          );
      // Aplica a resposta completa de POST /chat ou /chat/resume.
      const apply = (result) => {
        if (!valid()) return;
        if (result.transcript) callbacks.onTranscript(result.transcript);
        if (result.interrupt) callbacks.onInterrupt(result.interrupt);
        if (result.talhao) callbacks.onTalhao(result.talhao);
        update({
          content: result.content || "",
          diagnosis: result.diagnosis || null,
          diagnosisId: result.diagnosis?.id,
          // Sem streaming, os passos exibidos na espera eram estimativas de
          // tempo. No fim só fica o que dá para afirmar: se veio laudo, o
          // diagnóstico rodou.
          steps: [
            ...(result.talhao ? [{ name: result.talhao.created ? "register_talhao" : "use_talhao", done: true }] : []),
            ...(result.diagnosis ? [{ name: "analyze_image", done: true }] : []),
          ],
        });
        callbacks.onDone(result.sessionId);
      };
      const threadId = currentInterrupt?.sessionId || sessionId;
      try {
        if (mode === "resume" && streaming)
          await resumeMessageStream(threadId, text, callbacks, {
            signal: ctrl.signal,
          });
        else if (mode === "resume")
          apply(await resumeMessage(threadId, text, { signal: ctrl.signal }));
        else if (mode === "sync")
          apply(
            await sendMessage(
              [{ role: "user", content: user.content }],
              imageFile,
              modelId,
              audioFile,
              sessionId,
              { signal: ctrl.signal, ...talhaoOptions() },
            ),
          );
        else
          await sendMessageStream(
            [{ role: "user", content: user.content }],
            imageFile,
            modelId,
            sessionId,
            audioFile,
            callbacks,
            { signal: ctrl.signal, ...talhaoOptions() },
          );
        update((m) => ({
          isStreaming: false,
          toolCall: null,
          steps: doneSteps(m.steps),
        }));
        return valid();
      } catch (error) {
        if (valid()) {
          update({
            content: describe(error),
            isError: true,
            isStreaming: false,
            toolCall: null,
          });
          if (currentInterrupt) setInterrupt(currentInterrupt);
        }
        return false;
      } finally {
        timers.forEach(clearTimeout);
        if (valid()) {
          busy.current = false;
          setLoading(false);
          controller.current = null;
        }
      }
    },
    [sessionId, pendingInterrupt],
  );
  const sendStreaming = useCallback(
    (text, file = null, model = "ensemble", audio = null) =>
      run(text, file, model, audio, "stream"),
    [run],
  );
  // Transporte padrão da UI: síncrono, a menos que REACT_APP_CHAT_STREAMING=true.
  const send = useCallback(
    (text, file = null, model = "ensemble", audio = null) =>
      run(text, file, model, audio, CHAT_STREAMING ? "stream" : "sync"),
    [run],
  );
  const answerInterrupt = useCallback(
    (answer) => {
      if (!pendingInterrupt || !(pendingInterrupt.sessionId || sessionId))
        return;
      return run(answer, null, null, null, "resume", pendingInterrupt);
    },
    [run, pendingInterrupt, sessionId],
  );
  const loadSession = useCallback(
    async (id) => {
      if (!id) return;
      cancel();
      const gen = ++generation.current;
      busy.current = true;
      setLoading(true);
      try {
        const [history, interrupt] = await Promise.all([
          getSessionMessages(id),
          getPendingInterrupt(id),
        ]);
        const hydrated = await Promise.all(
          history.map(async (m) => {
            if (!m.diagnosis && m.diagnosisId) {
              try {
                return {
                  ...m,
                  diagnosis: await getDiagnosisById(m.diagnosisId),
                };
              } catch {
                return { ...m, diagnosisUnavailable: true };
              }
            }
            return m;
          }),
        );
        if (generation.current !== gen) return;
        setSessionId(id);
        setMessages(hydrated.length ? hydrated : initial());
        setInterrupt(
          interrupt
            ? {
                ...interrupt,
                sessionId: id,
                via: CHAT_STREAMING ? "stream" : "sync",
              }
            : null,
        );
      } catch {
        if (generation.current === gen)
          setMessages((prev) => [
            ...prev,
            {
              id: uuid(),
              role: "assistant",
              content: "Não consegui abrir essa conversa. Tente novamente.",
              isError: true,
            },
          ]);
      } finally {
        if (generation.current === gen) {
          busy.current = false;
          setLoading(false);
        }
      }
    },
    [cancel],
  );
  const clearChat = useCallback(() => {
    cancel();
    if (sessionId) closeSession(sessionId);
    urls.current.forEach((url) => URL.revokeObjectURL(url));
    urls.current = [];
    setMessages(initial());
    setSessionId(null);
    setInterrupt(null);
  }, [cancel, sessionId]);
  const stop = useCallback(() => {
    cancel();
    setMessages((prev) =>
      prev.map((m) =>
        m.isStreaming
          ? {
              ...m,
              isStreaming: false,
              toolCall: null,
              content:
                (m.content ? m.content + "\n\n" : "") +
                "Resposta interrompida por você.",
            }
          : m,
      ),
    );
  }, [cancel]);
  return {
    messages,
    isLoading,
    sessionId,
    pendingInterrupt,
    send,
    sendStreaming,
    answerInterrupt,
    loadSession,
    clearChat,
    stop,
  };
}
