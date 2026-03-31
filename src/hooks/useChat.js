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
    } catch {
      const errorMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
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
