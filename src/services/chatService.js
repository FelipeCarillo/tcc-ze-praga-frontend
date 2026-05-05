import api from './api';
import { mockSendMessage } from './mock/mockChat';

export async function sendMessage(messages, imageFile = null, modelId = 'ensemble') {
  const formData = new FormData();
  formData.append('messages', JSON.stringify(messages));
  formData.append('model', modelId);
  if (imageFile) formData.append('image', imageFile);

  try {
    const response = await api.post('/api/v1/chat', formData);
    return response.data;
  } catch {
    return mockSendMessage(messages, imageFile, modelId);
  }
}
