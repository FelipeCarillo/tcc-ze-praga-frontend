import { fetchEventSource } from "@microsoft/fetch-event-source";
import api from "./api";
import { IS_DEMO, API_ORIGIN } from "../config/runtime";
import { mockSendMessage } from "./mock/mockChat";
import { mockSendMessageStream } from "./mock/mockChatStream";
import { mapDiagnosis, saveDiagnosis } from "./historyService";
import { getAuthToken, getCurrentUserId } from "./authService";
import { appendDemoTurn } from "./mock/mockSessions";
export function mapInterrupt(data) {
  if (!data || typeof data !== "object") return null;
  return {
    kind: data.kind || "ask_user",
    question: data.question || "",
    responseKind: data.response_kind || data.responseKind || "text",
    options: data.options || null,
    askedAt: data.asked_at || null,
  };
}
function parse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
function abortError() {
  return new DOMException("Envio interrompido.", "AbortError");
}
function streamRequest(path, body, callbacks, options = {}, json = false) {
  const ctrl = new AbortController(),
    headers = { Accept: "text/event-stream" };
  const token = getAuthToken();
  if (token) headers.Authorization = "Bearer " + token;
  if (json) headers["Content-Type"] = "application/json";
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(
      () =>
        finish(
          new Error("A resposta demorou mais que o esperado. Tente novamente."),
        ),
      180000,
    );
    const abort = () => finish(abortError());
    function finish(error) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      options.signal?.removeEventListener("abort", abort);
      ctrl.abort();
      if (error) {
        callbacks.onError?.(error);
        reject(error);
      } else resolve();
    }
    if (options.signal?.aborted) {
      abort();
      return;
    }
    options.signal?.addEventListener("abort", abort, { once: true });
    fetchEventSource(API_ORIGIN + path, {
      method: "POST",
      headers,
      body,
      signal: ctrl.signal,
      openWhenHidden: true,
      async onopen(res) {
        if (
          res.ok &&
          res.headers.get("content-type")?.includes("text/event-stream")
        )
          return;
        let data;
        try {
          data = await res.json();
        } catch {
          data = null;
        }
        if (res.status === 401) {
          [
            "ze-praga-auth-token",
            "ze-praga-auth-user",
            "ze-praga-auth-expires-at",
          ].forEach((k) => localStorage.removeItem(k));
          window.dispatchEvent(new CustomEvent("auth-expired"));
        }
        if (res.status === 429)
          window.dispatchEvent(
            new CustomEvent("quota-exceeded", { detail: data }),
          );
        const error = new Error("Não foi possível iniciar a resposta.");
        error.response = { status: res.status, data };
        throw error;
      },
      onmessage(ev) {
        if (settled) return;
        const data = parse(ev.data);
        switch (ev.event) {
          case "token":
            callbacks.onToken?.(String(data ?? ""));
            break;
          case "transcript":
            callbacks.onTranscript?.(String(data ?? ""));
            break;
          case "tool_call":
            callbacks.onToolCall?.(String(data ?? ""));
            break;
          case "tool_result":
            callbacks.onToolResult?.(data);
            break;
          case "diagnosis":
            callbacks.onDiagnosis?.(mapDiagnosis(data));
            break;
          case "interrupt":
            callbacks.onInterrupt?.(mapInterrupt(data));
            break;
          case "error":
            finish(
              new Error(
                typeof data === "string" ? data : "Erro ao gerar a resposta.",
              ),
            );
            break;
          case "done":
            callbacks.onDone?.(typeof data === "string" ? data : null);
            window.dispatchEvent(new CustomEvent("quota-updated"));
            finish();
            break;
          default:
            break;
        }
      },
      onclose() {
        if (!settled)
          finish(
            new Error(
              "A conexão foi interrompida antes de concluir a resposta.",
            ),
          );
      },
      onerror(error) {
        finish(error);
        throw error;
      },
    }).catch((error) => finish(error));
  });
}
export async function sendMessage(
  messages,
  imageFile = null,
  modelId = "ensemble",
  audioFile = null,
) {
  if (IS_DEMO) return mockSendMessage(messages, imageFile, modelId);
  const body = new FormData();
  body.append("messages", JSON.stringify(messages));
  body.append("model", modelId);
  if (imageFile) body.append("image", imageFile);
  if (audioFile)
    body.append("audio", audioFile, audioFile.name || "voice.webm");
  const { data } = await api.post("/api/v1/chat", body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  window.dispatchEvent(new CustomEvent("quota-updated"));
  return { ...data, diagnosis: mapDiagnosis(data.diagnosis) };
}
export async function sendMessageStream(
  messages,
  imageFile = null,
  modelId = "ensemble",
  sessionId = null,
  audioFile = null,
  callbacks = {},
  options = {},
) {
  if (IS_DEMO) {
    if (options.signal?.aborted) throw abortError();
    let content = "",
      diagnosis = null;
    const sid =
      sessionId ||
      "demo-" + Date.now() + "-" + Math.random().toString(36).slice(2);
    const guarded = {};
    for (const [key, fn] of Object.entries(callbacks))
      guarded[key] = (...args) => {
        if (!options.signal?.aborted) fn(...args);
      };
    await mockSendMessageStream(messages, imageFile, modelId, audioFile, {
      ...guarded,
      onToken: (chunk) => {
        content += chunk;
        guarded.onToken?.(chunk);
      },
      onDiagnosis: (value) => {
        diagnosis = value;
        guarded.onDiagnosis?.(value);
      },
      onDone: () => {},
    });
    if (options.signal?.aborted) throw abortError();
    if (diagnosis) await saveDiagnosis(diagnosis);
    appendDemoTurn(getCurrentUserId(), sid, messages[messages.length - 1], {
      role: "assistant",
      content,
      diagnosis,
      diagnosisId: diagnosis?.id,
    });
    guarded.onDone?.(sid);
    window.dispatchEvent(new CustomEvent("diagnosis-saved"));
    return;
  }
  const body = new FormData();
  body.append("messages", JSON.stringify(messages));
  body.append("model", modelId);
  if (imageFile) body.append("image", imageFile);
  if (audioFile)
    body.append("audio", audioFile, audioFile.name || "voice.webm");
  if (sessionId) body.append("session_id", sessionId);
  return streamRequest("/api/v1/chat/stream", body, callbacks, options);
}
export function resumeMessageStream(
  threadId,
  response,
  callbacks = {},
  options = {},
) {
  return streamRequest(
    "/api/v1/chat/resume/stream",
    JSON.stringify({ thread_id: threadId, response }),
    callbacks,
    options,
    true,
  );
}
