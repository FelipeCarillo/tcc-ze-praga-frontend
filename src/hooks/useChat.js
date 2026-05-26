import { useCallback, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendMessage, sendMessageStream } from '../services/chatService';

const INITIAL_ASSISTANT_MESSAGE = {
  role: 'assistant',
  content:
    'Oi, compadre! Manda uma foto da folha aí que eu dou uma olhada. Em 5 segundos te digo o que é.',
  diagnosis: null,
};

function createInitialMessages() {
  return [{ ...INITIAL_ASSISTANT_MESSAGE, id: uuidv4() }];
}

function describeChatError(error) {
  const status = error?.response?.status;
  if (status === 401) {
    return 'Sua sessão expirou. Faça login novamente para continuar.';
  }
  if (status === 429) {
    return 'Você atingiu o limite de uso do chat. Veja os planos disponíveis para ampliar sua cota.';
  }
  if (status === 413) {
    return 'A imagem enviada é grande demais. Tente uma menor.';
  }
  if (typeof status === 'number' && status >= 500) {
    return 'O servidor está com instabilidade no momento. Tente novamente em instantes.';
  }
  const message =
    error?.response?.data?.detail || error?.response?.data?.message || error?.message;
  if (message && typeof message === 'string') {
    return `Não foi possível processar a mensagem: ${message}`;
  }
  return 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.';
}

function useChat() {
  const [messages, setMessages] = useState(createInitialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const send = useCallback(async (text, imageFile = null, modelId = 'ensemble', audioFile = null) => {
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: text || (imageFile ? 'Imagem enviada para análise' : audioFile ? '🎤 Mensagem de voz' : ''),
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : null,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const allMessages = [...messagesRef.current, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendMessage(allMessages, imageFile, modelId, audioFile);

      const assistantMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.content,
        diagnosis: response.diagnosis || null,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: describeChatError(error),
        diagnosis: null,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Streaming variant of `send`: opens an SSE connection and appends tokens
   * incrementally to an assistant placeholder message. Resolves when the
   * server emits `done` or rejects on transport error (placeholder is
   * replaced by an error message in that case).
   */
  const sendStreaming = useCallback(
    async (text, imageFile = null, modelId = 'ensemble', audioFile = null) => {
      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content: text || (imageFile ? 'Imagem enviada para análise' : audioFile ? '🎤 Mensagem de voz' : ''),
        imageUrl: imageFile ? URL.createObjectURL(imageFile) : null,
      };

      const placeholderId = uuidv4();
      const placeholder = {
        id: placeholderId,
        role: 'assistant',
        content: '',
        diagnosis: null,
        isStreaming: true,
        toolCall: null,
      };

      setMessages((prev) => [...prev, userMessage, placeholder]);
      setIsLoading(true);

      // O backend lê só a última mensagem (router._extract_last_message) e
      // mantém o histórico server-side via session_id — então mandamos apenas
      // o turno atual, não o histórico inteiro.
      const outgoing = [{ role: 'user', content: userMessage.content }];

      const updatePlaceholder = (updater) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === placeholderId ? { ...m, ...updater(m) } : m))
        );
      };

      // Typewriter: os tokens chegam em rajadas (o LLM streama rápido). Em vez
      // de despejar cada chunk no balão de uma vez, acumulamos em `target` e
      // revelamos poucos caracteres por tick — escrita visível e suave. Se o
      // buffer cresce muito, acelera pra não atrasar demais o fim.
      let target = '';
      let shown = 0;
      const TICK_MS = 18;
      const revealTimer = setInterval(() => {
        if (shown >= target.length) return;
        const remaining = target.length - shown;
        const step = remaining > 160 ? Math.ceil(remaining / 30) : 1;
        shown = Math.min(target.length, shown + step);
        const slice = target.slice(0, shown);
        updatePlaceholder(() => ({ content: slice }));
      }, TICK_MS);

      // Espera a animação alcançar todo o texto recebido antes de encerrar.
      const drainTypewriter = () =>
        new Promise((resolve) => {
          const check = () =>
            shown >= target.length ? resolve() : setTimeout(check, TICK_MS);
          check();
        });

      try {
        await sendMessageStream(
          outgoing,
          imageFile,
          modelId,
          sessionId,
          audioFile,
          {
            onToken: (chunk) => {
              target += chunk;
            },
            onToolCall: (name) => {
              updatePlaceholder(() => ({ toolCall: name }));
            },
            onToolResult: () => {
              // Clear tool badge once result arrives — token stream continues.
              updatePlaceholder(() => ({ toolCall: null }));
            },
            onDiagnosis: (diag) => {
              updatePlaceholder(() => ({ diagnosis: diag }));
            },
            onDone: (sid) => {
              if (sid) setSessionId(sid);
            },
          }
        );
        // Deixa o typewriter terminar de escrever o buffer e então finaliza o
        // balão (cobre também o caso de fechar sem `done`).
        await drainTypewriter();
        clearInterval(revealTimer);
        updatePlaceholder(() => ({
          content: target,
          isStreaming: false,
          toolCall: null,
        }));
      } catch (error) {
        clearInterval(revealTimer);
        const message = describeChatError(error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? {
                  id: placeholderId,
                  role: 'assistant',
                  content: message,
                  diagnosis: null,
                  isStreaming: false,
                  toolCall: null,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  const clearChat = useCallback(() => {
    setMessages(createInitialMessages());
    setSessionId(null);
  }, []);

  return { messages, isLoading, sessionId, send, sendStreaming, clearChat };
}

export default useChat;
