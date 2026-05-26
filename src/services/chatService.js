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

export async function sendMessage(messages, imageFile = null, modelId = 'ensemble', audioFile = null) {
  if (USE_MOCK) {
    return mockSendMessage(messages, imageFile, modelId);
  }

  const formData = new FormData();
  formData.append('messages', JSON.stringify(messages));
  formData.append('model', modelId);
  if (imageFile) formData.append('image', imageFile);
  if (audioFile) formData.append('audio', audioFile, 'voice.webm');

  // Sem este header, a instância `api` (default Content-Type: application/json)
  // faz o axios serializar o FormData como JSON e o backend (campos `Form(...)`)
  // recebe o corpo vazio → 422. Forçar multipart deixa o browser pôr o boundary.
  const response = await api.post('/api/v1/chat', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
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
  audioFile = null,
  callbacks = {},
  options = {}
) {
  const {
    onToken,
    onToolCall,
    onToolResult,
    onDiagnosis,
    onDone,
    onError,
  } = callbacks;

  const formData = new FormData();
  formData.append('messages', JSON.stringify(messages));
  formData.append('model', modelId);
  if (imageFile) formData.append('image', imageFile);
  if (audioFile) formData.append('audio', audioFile, 'voice.webm');
  if (sessionId) formData.append('session_id', sessionId);

  const token = getAuthToken();
  const headers = { Accept: 'text/event-stream' };
  if (token) headers.Authorization = `Bearer ${token}`;

  // fetchEventSource throws inside onerror when we want to surface to the
  // caller; we wrap it so callers can `await sendMessageStream(...)`.
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (kind, value) => {
      if (settled) return;
      settled = true;
      if (kind === 'resolve') resolve(value);
      else reject(value);
    };

    fetchEventSource(`${getApiBaseUrl()}/api/v1/chat/stream`, {
      method: 'POST',
      headers,
      body: formData,
      signal: options.signal,
      // Don't auto-reconnect on tab visibility changes — chat streams are
      // one-shot, not long-lived connections.
      openWhenHidden: true,
      async onopen(response) {
        if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
          return; // good
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
          case 'done':
            if (onDone) onDone(typeof data === 'string' ? data : null);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('quota-updated'));
            }
            finish('resolve');
            break;
          default:
            // Unknown event type — ignore silently to stay forward-compatible.
            break;
        }
      },
      onclose() {
        // Server closed without a `done` event — treat as completion so we
        // don't leave the caller hanging, but skip side-effects.
        finish('resolve');
      },
      onerror(err) {
        if (onError) onError(err);
        finish('reject', err);
        // Throwing prevents fetchEventSource from retrying automatically.
        throw err;
      },
    }).catch((err) => {
      // Swallow — already surfaced via onerror/finish above.
      if (!settled) finish('reject', err);
    });
  });
}
