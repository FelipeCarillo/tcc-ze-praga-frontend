import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import {
  sendMessage,
  sendMessageStream,
  resumeMessageStream,
} from "../services/chatService";
import {
  getSessionMessages,
  closeSession,
  getPendingInterrupt,
} from "../services/sessionsService";
import { getDiagnosisById } from "../services/historyService";
const initial = () => [
  {
    id: uuid(),
    role: "assistant",
    content:
      "Oi! Envie uma foto da folha de soja ou conte o que você observou. Vamos olhar os sinais juntos.",
    diagnosis: null,
    timestamp: new Date().toISOString(),
  },
];
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
export default function useChat() {
  const [messages, setMessages] = useState(initial),
    [isLoading, setLoading] = useState(false),
    [sessionId, setSessionId] = useState(null),
    [pendingInterrupt, setInterrupt] = useState(null);
  const generation = useRef(0),
    controller = useRef(null),
    busy = useRef(false),
    urls = useRef([]),
    messagesRef = useRef(messages);
  messagesRef.current = messages;
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
      const imageUrl = imageFile ? URL.createObjectURL(imageFile) : null;
      if (imageUrl) urls.current.push(imageUrl);
      const user = {
        id: uuid(),
        role: "user",
        content:
          text ||
          (imageFile
            ? "Imagem enviada para análise"
            : audioFile
              ? "🎤 Mensagem de voz"
              : ""),
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
      const callbacks = {
        onToken: (chunk) => update((m) => ({ content: m.content + chunk })),
        onToolCall: (name) => update({ toolCall: name }),
        onToolResult: () => update({ toolCall: null }),
        onDiagnosis: (diagnosis) =>
          update({ diagnosis, diagnosisId: diagnosis?.id }),
        onTranscript: (content) => {
          if (valid() && content)
            setMessages((prev) =>
              prev.map((m) =>
                m.id === user.id ? { ...m, content, isTranscript: true } : m,
              ),
            );
        },
        onInterrupt: (info) => {
          if (valid() && info)
            setInterrupt({
              ...info,
              sessionId: currentInterrupt?.sessionId || sessionId,
            });
        },
        onDone: (sid) => {
          if (valid() && sid) {
            setSessionId(sid);
            setInterrupt((cur) => (cur ? { ...cur, sessionId: sid } : null));
          }
        },
      };
      try {
        if (mode === "resume")
          await resumeMessageStream(
            currentInterrupt.sessionId || sessionId,
            text,
            callbacks,
            { signal: ctrl.signal },
          );
        else if (mode === "sync") {
          const result = await sendMessage(
            [...messagesRef.current, user].map(({ role, content }) => ({
              role,
              content,
            })),
            imageFile,
            modelId,
            audioFile,
          );
          update({
            content: result.content,
            diagnosis: result.diagnosis || null,
          });
        } else
          await sendMessageStream(
            [{ role: "user", content: user.content }],
            imageFile,
            modelId,
            sessionId,
            audioFile,
            callbacks,
            { signal: ctrl.signal },
          );
        update({ isStreaming: false, toolCall: null });
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
  const send = useCallback(
    (text, file = null, model = "ensemble", audio = null) =>
      run(text, file, model, audio, "sync"),
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
        setInterrupt(interrupt ? { ...interrupt, sessionId: id } : null);
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
