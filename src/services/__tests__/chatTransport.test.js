jest.mock("@microsoft/fetch-event-source", () => ({
  fetchEventSource: jest.fn(),
}));
jest.mock("../api", () => ({ __esModule: true, default: { post: jest.fn() } }));
jest.mock("../authService", () => ({
  getAuthToken: () => "token",
  getAuthHeaders: () => ({}),
  getCurrentUserId: () => "test",
}));
jest.mock("../mock/mockChat", () => ({ mockSendMessage: jest.fn() }));
jest.mock("../mock/mockChatStream", () => ({
  mockSendMessageStream: jest.fn(),
}));
jest.mock("../../config/runtime", () => ({
  IS_DEMO: false,
  API_ORIGIN: "http://127.0.0.1:8000",
  CHAT_TIMEOUT_MS: 120000,
}));
const { fetchEventSource } = require("@microsoft/fetch-event-source");
const {
  sendMessage,
  sendMessageStream,
  resumeMessage,
  resumeMessageStream,
} = require("../chatService");
const api = require("../api").default;
beforeEach(() => {
  jest.clearAllMocks();
  fetchEventSource.mockImplementation(() => new Promise(() => {}));
});
test("abortar encerra a promise e o transporte sem reconexão", async () => {
  const ctrl = new AbortController();
  const promise = sendMessageStream(
    [{ role: "user", content: "oi" }],
    null,
    "resnet50",
    null,
    null,
    {},
    { signal: ctrl.signal },
  );
  ctrl.abort();
  await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  expect(fetchEventSource.mock.calls[0][1].signal.aborted).toBe(true);
});
test("fechamento sem done é falha, não sucesso", async () => {
  const promise = sendMessageStream([]);
  fetchEventSource.mock.calls[0][1].onclose();
  await expect(promise).rejects.toThrow("interrompida");
});
test("done encerra conexão e preserva pergunta HITL normalizada", async () => {
  const onInterrupt = jest.fn(),
    onDone = jest.fn();
  const promise = sendMessageStream([], null, "resnet50", null, null, {
    onInterrupt,
    onDone,
  });
  const options = fetchEventSource.mock.calls[0][1];
  options.onmessage({
    event: "interrupt",
    data: JSON.stringify({
      question: "Qual cultura?",
      response_kind: "choice",
      options: ["Soja"],
    }),
  });
  options.onmessage({ event: "done", data: JSON.stringify("session-1") });
  await promise;
  expect(onInterrupt).toHaveBeenCalledWith(
    expect.objectContaining({ responseKind: "choice" }),
  );
  expect(onDone).toHaveBeenCalledWith("session-1");
  expect(options.signal.aborted).toBe(true);
});
test("resume envia contrato correto e aceita cancelamento", async () => {
  const ctrl = new AbortController();
  const promise = resumeMessageStream(
    "session-1",
    "Soja",
    {},
    { signal: ctrl.signal },
  );
  expect(fetchEventSource.mock.calls[0][0]).toMatch("/chat/resume/stream");
  expect(JSON.parse(fetchEventSource.mock.calls[0][1].body)).toEqual({
    thread_id: "session-1",
    response: "Soja",
  });
  ctrl.abort();
  await expect(promise).rejects.toMatchObject({ name: "AbortError" });
});
test("chat síncrono manda sessão, timeout longo e normaliza a resposta", async () => {
  api.post.mockResolvedValueOnce({
    data: {
      content: "Oi",
      session_id: "s-1",
      transcript: "falado",
      diagnosis: null,
      interrupt: { question: "Soja?", response_kind: "boolean" },
    },
  });
  const ctrl = new AbortController();
  const result = await sendMessage(
    [{ role: "user", content: "oi" }],
    null,
    "ensemble",
    null,
    "s-1",
    { signal: ctrl.signal },
  );
  const [url, body, config] = api.post.mock.calls[0];
  expect(url).toBe("/api/v1/chat");
  expect(body.get("session_id")).toBe("s-1");
  expect(config).toMatchObject({ timeout: 120000, signal: ctrl.signal });
  expect(result).toMatchObject({
    content: "Oi",
    sessionId: "s-1",
    transcript: "falado",
    interrupt: { question: "Soja?", responseKind: "boolean" },
  });
});
test("resume síncrono usa POST /chat/resume", async () => {
  api.post.mockResolvedValueOnce({ data: { content: "ok", session_id: "s-1" } });
  const result = await resumeMessage("s-1", "Soja");
  expect(api.post.mock.calls[0][0]).toBe("/api/v1/chat/resume");
  expect(api.post.mock.calls[0][1]).toEqual({ thread_id: "s-1", response: "Soja" });
  expect(result).toMatchObject({ content: "ok", sessionId: "s-1", interrupt: null });
});
