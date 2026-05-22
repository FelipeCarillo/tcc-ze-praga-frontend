import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendMessage } from '../services/chatService';

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
      const allMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendMessage(allMessages, imageFile, modelId);

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
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages(createInitialMessages());
  }, []);

  return { messages, isLoading, send, clearChat };
}

export default useChat;
