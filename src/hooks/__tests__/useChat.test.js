import { renderHook, act, waitFor } from '@testing-library/react';

jest.mock('../../services/chatService', () => ({
  sendMessage: jest.fn(),
  sendMessageStream: jest.fn(),
}));

jest.mock('uuid', () => {
  let counter = 0;
  return { v4: () => `uuid-${++counter}` };
});

// URL.createObjectURL doesn't exist in jsdom — stub it.
if (typeof URL.createObjectURL === 'undefined') {
  Object.defineProperty(URL, 'createObjectURL', { value: () => 'blob:fake' });
}

const { sendMessage, sendMessageStream } = require('../../services/chatService');
const useChat = require('../useChat').default;

describe('useChat error handling', () => {
  beforeEach(() => {
    sendMessage.mockReset();
    sendMessageStream.mockReset();
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

describe('useChat streaming (sendStreaming)', () => {
  beforeEach(() => {
    sendMessage.mockReset();
    sendMessageStream.mockReset();
  });

  it('accumulates tokens into a single assistant placeholder and finalizes on done', async () => {
    // Capture callbacks so we can drive them manually.
    let captured = null;
    sendMessageStream.mockImplementation(
      (msgs, img, model, sid, audio, callbacks) =>
        new Promise((resolve) => {
          captured = { callbacks, resolve };
        })
    );

    const { result } = renderHook(() => useChat());

    let streamPromise;
    await act(async () => {
      streamPromise = result.current.sendStreaming('oi');
    });

    // After starting: user message + placeholder, isStreaming on placeholder.
    expect(result.current.isLoading).toBe(true);
    let placeholder = result.current.messages[result.current.messages.length - 1];
    expect(placeholder.role).toBe('assistant');
    expect(placeholder.content).toBe('');
    expect(placeholder.isStreaming).toBe(true);

    // Drive incremental tokens.
    await act(async () => {
      captured.callbacks.onToken('Olá');
    });
    await act(async () => {
      captured.callbacks.onToken(', ');
    });
    await act(async () => {
      captured.callbacks.onToken('mundo!');
    });

    // Typewriter revela progressivamente — espera alcançar o buffer.
    await waitFor(() => {
      const p = result.current.messages[result.current.messages.length - 1];
      expect(p.content).toBe('Olá, mundo!');
    });
    placeholder = result.current.messages[result.current.messages.length - 1];
    expect(placeholder.isStreaming).toBe(true);

    // Tool call -> badge appears, then result -> badge cleared.
    await act(async () => {
      captured.callbacks.onToolCall('analyze_image');
    });
    placeholder = result.current.messages[result.current.messages.length - 1];
    expect(placeholder.toolCall).toBe('analyze_image');

    await act(async () => {
      captured.callbacks.onToolResult('done');
    });
    placeholder = result.current.messages[result.current.messages.length - 1];
    expect(placeholder.toolCall).toBeNull();

    // Diagnosis attaches to placeholder.
    const diag = { id: 'd1', disease: 'Ferrugem' };
    await act(async () => {
      captured.callbacks.onDiagnosis(diag);
    });
    placeholder = result.current.messages[result.current.messages.length - 1];
    expect(placeholder.diagnosis).toEqual(diag);

    // Done -> finalize: stop streaming, persist session id, resolve loading.
    await act(async () => {
      captured.callbacks.onDone('session-xyz');
      captured.resolve();
      await streamPromise;
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    placeholder = result.current.messages[result.current.messages.length - 1];
    expect(placeholder.isStreaming).toBe(false);
    expect(placeholder.content).toBe('Olá, mundo!');
    expect(result.current.sessionId).toBe('session-xyz');
  });

  it('replaces placeholder with an error message when stream rejects', async () => {
    sendMessageStream.mockImplementation((msgs, img, model, sid, audio, callbacks) => {
      // Drive a token first, then reject.
      callbacks.onToken('parcial');
      return Promise.reject({ response: { status: 429, data: {} } });
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendStreaming('oi');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const last = result.current.messages[result.current.messages.length - 1];
    expect(last.role).toBe('assistant');
    expect(last.content).toMatch(/limite de uso/i);
    expect(last.isStreaming).toBe(false);
    expect(last.diagnosis).toBeNull();
  });

  it('passes only the current turn (not full history) and image to the stream service', async () => {
    sendMessageStream.mockImplementation((msgs, img, model, sid, audio, callbacks) => {
      callbacks.onDone('s1');
      return Promise.resolve();
    });

    const fakeFile = new Blob(['x'], { type: 'image/jpeg' });
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendStreaming('analisa essa folha', fakeFile, 'vit');
    });

    expect(sendMessageStream).toHaveBeenCalledTimes(1);
    const [msgs, img, model, sid] = sendMessageStream.mock.calls[0];
    expect(Array.isArray(msgs)).toBe(true);
    // Backend reads only the last message + keeps history server-side via
    // session_id, so we send just the current turn — not the greeting/history.
    expect(msgs).toEqual([{ role: 'user', content: 'analisa essa folha' }]);
    expect(img).toBe(fakeFile);
    expect(model).toBe('vit');
    expect(sid).toBeNull(); // no prior session yet
  });

  it('clearChat resets sessionId after a successful stream', async () => {
    sendMessageStream.mockImplementation((msgs, img, model, sid, audio, callbacks) => {
      callbacks.onDone('s-keep');
      return Promise.resolve();
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendStreaming('oi');
    });

    await waitFor(() => expect(result.current.sessionId).toBe('s-keep'));

    act(() => {
      result.current.clearChat();
    });

    expect(result.current.sessionId).toBeNull();
  });
});
