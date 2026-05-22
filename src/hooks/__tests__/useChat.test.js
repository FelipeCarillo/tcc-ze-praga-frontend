import { renderHook, act, waitFor } from '@testing-library/react';

jest.mock('../../services/chatService', () => ({
  sendMessage: jest.fn(),
}));

jest.mock('uuid', () => {
  let counter = 0;
  return { v4: () => `uuid-${++counter}` };
});

// URL.createObjectURL doesn't exist in jsdom — stub it.
if (typeof URL.createObjectURL === 'undefined') {
  Object.defineProperty(URL, 'createObjectURL', { value: () => 'blob:fake' });
}

const { sendMessage } = require('../../services/chatService');
const useChat = require('../useChat').default;

describe('useChat error handling', () => {
  beforeEach(() => {
    sendMessage.mockReset();
  });

  it('appends an assistant error message when chatService rejects with 429', async () => {
    sendMessage.mockRejectedValueOnce({
      response: { status: 429, data: { detail: 'limit reached' } },
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.send('teste', null);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const last = result.current.messages[result.current.messages.length - 1];
    expect(last.role).toBe('assistant');
    expect(last.content).toMatch(/limite de uso/i);
    expect(last.diagnosis).toBeNull();
  });

  it('appends a server-instability message when chatService rejects with 500', async () => {
    sendMessage.mockRejectedValueOnce({
      response: { status: 503, data: {} },
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.send('oi');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const last = result.current.messages[result.current.messages.length - 1];
    expect(last.content).toMatch(/instabilidade/i);
  });

  it('appends a generic-fallback message when error has no shape', async () => {
    sendMessage.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.send('oi');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const last = result.current.messages[result.current.messages.length - 1];
    expect(last.role).toBe('assistant');
    expect(last.content).toMatch(/Não foi possível processar|erro ao processar/i);
  });

  it('appends successful response when chatService resolves', async () => {
    sendMessage.mockResolvedValueOnce({
      role: 'assistant',
      content: 'olá',
      diagnosis: null,
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.send('oi');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const last = result.current.messages[result.current.messages.length - 1];
    expect(last.content).toBe('olá');
  });
});
