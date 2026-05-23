import { fetchEventSource } from '@microsoft/fetch-event-source';
import api from './api';
import { mockSendMessage } from './mock/mockChat';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
const TOKEN_KEY = 'ze-praga-auth-token';

function getApiBaseUrl() {
  return process.env.REACT_APP_API_URL || 'http://localhost:8000';
}

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function mapDiagnosis(data) {
  if (!data) return null;
  return {
    id: data.id,
    disease: data.disease_name,
    diseaseId: data.disease_id,
    scientificName: data.scientific_name,
    confidence: data.confidence,
    severity: data.severity,
    description: data.description,
    modelUsed: data.model_used,
    imageUrl: data.image_url,
    imageName: data.image_name,
    top3: (data.top3 || []).map((p) => ({
      disease: p.disease_name,
      diseaseId: p.disease_id,
      scientificName: p.scientific_name,
      confidence: p.confidence,
      severity: p.severity,
    })),
    timestamp: data.created_at,
  };
}

function parseEventData(raw) {
  if (raw == null) return raw;
  try {
    return JSON.parse(raw);
  } catch (_err) {
    return raw;
  }
}

export async function sendMessage(messages, imageFile = null, modelId = 'ensemble') {
  if (USE_MOCK) {
    return mockSendMessage(messages, imageFile, modelId);
  }

  const formData = new FormData();
  formData.append('messages', JSON.stringify(messages));
  formData.append('model', modelId);
  if (imageFile) formData.append('image', imageFile);

  const response = await api.post('/api/v1/chat', formData);
  const { role, content, diagnosis } = response.data;
  const result = { role, content, diagnosis: mapDiagnosis(diagnosis) };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('quota-updated'));
  }

  return result;
}

/**
 * Stream a chat completion from the backend via Server-Sent Events.
 *
 * Backend contract (POST /api/v1/chat/stream, text/event-stream):
 *   event: token        | data: "<chunk>"            — incremental LLM token
 *   event: tool_call    | data: "<tool name>"        — tool invoked
 *   event: tool_result  | data: "<result text>"      — tool returned
 *   event: diagnosis    | data: <DiagnosisResponse>  — persisted diagnosis JSON
 *   event: done         | data: "<session_id>"       — stream finalized
 *
 * Returns a promise that resolves when the stream completes (onDone) and
 * rejects on transport errors.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {File|null} imageFile
 * @param {string} modelId
 * @param {string|null} sessionId
 * @param {{
 *   onToken?: (chunk: string) => void,
 *   onToolCall?: (name: string) => void,
 *   onToolResult?: (result: string) => void,
 *   onDiagnosis?: (diagnosis: object) => void,
 *   onDone?: (sessionId: string) => void,
 *   onError?: (error: Error) => void,
 * }} callbacks
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<void>}
 */
export async function sendMessageStream(
  messages,
  imageFile = null,
  modelId = 'ensemble',
  sessionId = null,
  callbacks = {},
  options = {}
) {
  const {
    onToken,
    onToolCall,
    onToolResult,
    onDiagnosis,
    onInterrupt,
    onDone,
    onError,
  } = callbacks;

  const formData = new FormData();
  formData.append('messages', JSON.stringify(messages));
  formData.append('model', modelId);
  if (imageFile) formData.append('image', imageFile);
  if (sessionId) formData.append('session_id', sessionId);

  return runEventStream(
    `${getApiBaseUrl()}/api/v1/chat/stream`,
    { method: 'POST', body: formData, signal: options.signal },
    {
      onToken,
      onToolCall,
      onToolResult,
      onDiagnosis,
      onInterrupt,
      onDone,
      onError,
    }
  );
}

/**
 * Sync version of resume — retoma uma sessao interrompida.
 * POST /api/v1/chat/resume {thread_id, response}
 */
export async function resumeChat(threadId, response) {
  if (USE_MOCK) {
    return { role: 'assistant', content: 'Mock resume', diagnosis: null };
  }
  const res = await api.post('/api/v1/chat/resume', {
    thread_id: threadId,
    response,
  });
  const { role, content, diagnosis, interrupt, session_id } = res.data;
  const result = {
    role,
    content,
    diagnosis: mapDiagnosis(diagnosis),
    interrupt: interrupt || null,
    sessionId: session_id,
  };
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('quota-updated'));
  }
  return result;
}

/**
 * Streaming version of resume — same SSE contract as sendMessageStream.
 * POST /api/v1/chat/resume/stream {thread_id, response}
 */
export async function resumeChatStream(threadId, response, callbacks = {}, options = {}) {
  const token = getAuthToken();
  const headers = {
    Accept: 'text/event-stream',
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  return runEventStream(
    `${getApiBaseUrl()}/api/v1/chat/resume/stream`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ thread_id: threadId, response }),
      signal: options.signal,
    },
    callbacks
  );
}

/**
 * List threads with a pending interrupt for the current user.
 * GET /api/v1/chat/interrupts
 */
export async function listPendingInterrupts() {
  if (USE_MOCK) return [];
  const res = await api.get('/api/v1/chat/interrupts');
  return res.data || [];
}

/**
 * Shared SSE runner used by sendMessageStream and resumeChatStream — emits
 * the same set of callbacks (token / tool_call / tool_result / diagnosis /
 * interrupt / done / error).
 */
function runEventStream(url, fetchOpts, callbacks) {
  const {
    onToken,
    onToolCall,
    onToolResult,
    onDiagnosis,
    onInterrupt,
    onDone,
    onError,
  } = callbacks;

  const token = getAuthToken();
  const headers = { Accept: 'text/event-stream', ...(fetchOpts.headers || {}) };
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (kind, value) => {
      if (settled) return;
      settled = true;
      if (kind === 'resolve') resolve(value);
      else reject(value);
    };

    fetchEventSource(url, {
      ...fetchOpts,
      headers,
      openWhenHidden: true,
      async onopen(response) {
        if (
          response.ok &&
          response.headers.get('content-type')?.includes('text/event-stream')
        ) {
          return;
        }
        const err = new Error(`Stream failed to open (status ${response.status})`);
        err.response = { status: response.status };
        throw err;
      },
      onmessage(ev) {
        const data = parseEventData(ev.data);
        switch (ev.event) {
          case 'token':
            if (onToken) onToken(typeof data === 'string' ? data : String(data ?? ''));
            break;
          case 'tool_call':
            if (onToolCall) onToolCall(typeof data === 'string' ? data : String(data ?? ''));
            break;
          case 'tool_result':
            if (onToolResult) onToolResult(typeof data === 'string' ? data : String(data ?? ''));
            break;
          case 'diagnosis':
            if (onDiagnosis) onDiagnosis(mapDiagnosis(data));
            break;
          case 'interrupt':
            if (onInterrupt && data && typeof data === 'object') onInterrupt(data);
            break;
          case 'done':
            if (onDone) onDone(typeof data === 'string' ? data : null);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('quota-updated'));
            }
            finish('resolve');
            break;
          default:
            break;
        }
      },
      onclose() {
        finish('resolve');
      },
      onerror(err) {
        if (onError) onError(err);
        finish('reject', err);
        throw err;
      },
    }).catch((err) => {
      if (!settled) finish('reject', err);
    });
  });
}
