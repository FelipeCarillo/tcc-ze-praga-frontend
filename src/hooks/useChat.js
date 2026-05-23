import { useCallback, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  resumeChat,
  resumeChatStream,
  sendMessage,
  sendMessageStream,
} from '../services/chatService';

const INITIAL_ASSISTANT_MESSAGE = {
  role: 'assistant',
  content:
    'Olá! Sou o Zé Praga, seu assistente de diagnóstico fitossanitário. Envie uma foto da folha de soja para que eu possa analisar, ou pergunte sobre pragas e doenças da cultura.',
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
  // TCC-060: estado HITL — quando backend pausa via ask_user, guardamos o
  // payload do interrupt e o thread_id pra acionar resume.
  const [pendingInterrupt, setPendingInterrupt] = useState(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const send = useCallback(async (text, imageFile = null, modelId = 'ensemble') => {
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: text || (imageFile ? 'Imagem enviada para análise' : ''),
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : null,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const allMessages = [...messagesRef.current, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendMessage(allMessages, imageFile, modelId);

      if (response.session_id) setSessionId(response.session_id);

      // Quando backend pausa em ask_user, response.interrupt vem populado.
      if (response.interrupt && response.session_id) {
        setPendingInterrupt({
          ...response.interrupt,
          threadId: response.session_id,
        });
      }

      if (response.content) {
        const assistantMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response.content,
          diagnosis: response.diagnosis || null,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
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
    async (text, imageFile = null, modelId = 'ensemble') => {
      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content: text || (imageFile ? 'Imagem enviada para análise' : ''),
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

      const allMessages = [...messagesRef.current, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const updatePlaceholder = (updater) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === placeholderId ? { ...m, ...updater(m) } : m))
        );
      };

      let interruptPayload = null;
      try {
        await sendMessageStream(
          allMessages,
          imageFile,
          modelId,
          sessionId,
          {
            onToken: (chunk) => {
              updatePlaceholder((m) => ({ content: (m.content || '') + chunk }));
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
            onInterrupt: (payload) => {
              // Marca placeholder como aguardando interrupt — o threadId
              // sera resolvido no onDone (que sempre vem por ultimo no SSE)
              // ou cai no sessionId atual quando ja existe.
              interruptPayload = payload;
              updatePlaceholder(() => ({
                isStreaming: false,
                toolCall: null,
                interrupt: payload,
              }));
            },
            onDone: (sid) => {
              updatePlaceholder(() => ({ isStreaming: false, toolCall: null }));
              const effectiveTid = sid || sessionIdRef.current || sessionId;
              if (sid) {
                setSessionId(sid);
                sessionIdRef.current = sid;
              }
              if (interruptPayload && effectiveTid) {
                setPendingInterrupt({
                  ...interruptPayload,
                  threadId: effectiveTid,
                });
              }
            },
          }
        );
      } catch (error) {
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
    setPendingInterrupt(null);
  }, []);

  /**
   * Retoma uma sessao interrompida (HITL) — chama POST /chat/resume e
   * anexa a resposta + saida do agente como mensagens novas.
   *
   * Quando o agente encadeia outro interrupt, `pendingInterrupt` eh
   * atualizado pra disparar o dialog novamente.
   */
  const resumeInterrupt = useCallback(
    async (response, threadId = null, { stream = true } = {}) => {
      const tid = threadId || pendingInterrupt?.threadId || sessionIdRef.current;
      if (!tid) return;

      // Persiste a resposta do usuario como mensagem visivel.
      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content: response,
      };
      setMessages((prev) => [...prev, userMessage]);
      setPendingInterrupt(null);
      setIsLoading(true);

      if (stream) {
        const placeholderId = uuidv4();
        const placeholder = {
          id: placeholderId,
          role: 'assistant',
          content: '',
          diagnosis: null,
          isStreaming: true,
          toolCall: null,
        };
        setMessages((prev) => [...prev, placeholder]);

        const updatePlaceholder = (updater) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === placeholderId ? { ...m, ...updater(m) } : m))
          );
        };

        try {
          await resumeChatStream(tid, response, {
            onToken: (chunk) => {
              updatePlaceholder((m) => ({ content: (m.content || '') + chunk }));
            },
            onToolCall: (name) => {
              updatePlaceholder(() => ({ toolCall: name }));
            },
            onToolResult: () => {
              updatePlaceholder(() => ({ toolCall: null }));
            },
            onDiagnosis: (diag) => {
              updatePlaceholder(() => ({ diagnosis: diag }));
            },
            onInterrupt: (payload) => {
              updatePlaceholder(() => ({
                isStreaming: false,
                toolCall: null,
                interrupt: payload,
              }));
              setPendingInterrupt({ ...payload, threadId: tid });
            },
            onDone: () => {
              updatePlaceholder(() => ({ isStreaming: false, toolCall: null }));
            },
          });
        } catch (error) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === placeholderId
                ? {
                    id: placeholderId,
                    role: 'assistant',
                    content: describeChatError(error),
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
      } else {
        try {
          const result = await resumeChat(tid, response);
          if (result.interrupt) {
            setPendingInterrupt({ ...result.interrupt, threadId: tid });
          }
          if (result.content) {
            setMessages((prev) => [
              ...prev,
              {
                id: uuidv4(),
                role: 'assistant',
                content: result.content,
                diagnosis: result.diagnosis || null,
              },
            ]);
          }
        } catch (error) {
          setMessages((prev) => [
            ...prev,
            {
              id: uuidv4(),
              role: 'assistant',
              content: describeChatError(error),
              diagnosis: null,
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [pendingInterrupt]
  );

  const dismissInterrupt = useCallback(() => {
    setPendingInterrupt(null);
  }, []);

  return {
    messages,
    isLoading,
    sessionId,
    pendingInterrupt,
    send,
    sendStreaming,
    resumeInterrupt,
    dismissInterrupt,
    clearChat,
  };
}

export default useChat;
