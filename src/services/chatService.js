import { mockSendMessage } from './mock/mockChat';

export async function sendMessage(messages, imageFile = null) {
  // Quando o backend real existir:
  // const formData = new FormData();
  // formData.append('messages', JSON.stringify(messages));
  // if (imageFile) formData.append('image', imageFile);
  // const response = await api.post('/chat', formData);
  // return response.data;

  return mockSendMessage(messages, imageFile);
}
