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
}));
const { fetchEventSource } = require("@microsoft/fetch-event-source");
const { sendMessageStream, resumeMessageStream } = require("../chatService");
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
