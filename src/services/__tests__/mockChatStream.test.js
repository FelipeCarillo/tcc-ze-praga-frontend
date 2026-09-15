jest.mock("../mock/imagePreview", () => ({
  demoImagePreview: async () => "data:image/jpeg;base64,dGVzdA==",
}));
/**
 * O modo mock precisa cobrir o STREAMING, não só o `sendMessage`.
 *
 * `REACT_APP_USE_MOCK=true` é documentado como "navega a UI sem backend", mas a
 * ChatPage usa `sendStreaming` — que não tinha caminho mock. O recurso
 * principal do produto era justamente o que não funcionava sem backend.
 */

jest.mock("../mock/delay", () => ({ delay: () => Promise.resolve() }));

// `uuid` v9 é ESM puro e o transform default do CRA não o cobre — mesmo
// tratamento que o teste do useChat já usa.
jest.mock("uuid", () => {
  let n = 0;
  return { v4: () => `uuid-${++n}` };
});

if (typeof URL.createObjectURL === "undefined") {
  Object.defineProperty(URL, "createObjectURL", { value: () => "blob:fake" });
}

const { mockSendMessageStream } = require("../mock/mockChatStream");

function collector() {
  const events = [];
  return {
    events,
    callbacks: {
      onTranscript: (t) => events.push(["transcript", t]),
      onToken: (t) => events.push(["token", t]),
      onToolCall: (n) => events.push(["tool_call", n]),
      onToolResult: () => events.push(["tool_result"]),
      onDiagnosis: (d) => events.push(["diagnosis", d]),
      onDone: (s) => events.push(["done", s]),
    },
  };
}

const kinds = (events) => events.map((e) => e[0]);

describe("mockSendMessageStream", () => {
  it("mensagem de texto emite tokens e finaliza", async () => {
    const c = collector();

    await mockSendMessageStream(
      [{ role: "user", content: "oi" }],
      null,
      "ensemble",
      null,
      c.callbacks,
    );

    expect(kinds(c.events)).toContain("token");
    expect(kinds(c.events)[kinds(c.events).length - 1]).toBe("done");
  });

  it("com imagem reproduz gate de visão, diagnóstico e card", async () => {
    const c = collector();
    const file = new File(["x"], "folha.jpg", { type: "image/jpeg" });

    await mockSendMessageStream([], file, "ensemble", null, c.callbacks);

    const toolCalls = c.events
      .filter((e) => e[0] === "tool_call")
      .map((e) => e[1]);
    // A ordem importa: analyze_image só depois do gate confirmar que é planta.
    expect(toolCalls).toEqual(["inspect_image", "analyze_image"]);

    const diagnosis = c.events.find((e) => e[0] === "diagnosis");
    expect(diagnosis[1].disease).toBeTruthy();
    expect(diagnosis[1].top3).toHaveLength(3);
  });

  it("áudio emite a transcrição antes dos tokens", async () => {
    const c = collector();
    const audio = new File(["x"], "voice.webm", { type: "audio/webm" });

    await mockSendMessageStream([], null, "ensemble", audio, c.callbacks);

    const order = kinds(c.events);
    expect(order[0]).toBe("transcript");
    expect(order.indexOf("transcript")).toBeLessThan(order.indexOf("token"));
  });

  it("devolve um session_id para o hook guardar", async () => {
    const c = collector();

    await mockSendMessageStream(
      [{ role: "user", content: "oi" }],
      null,
      "ensemble",
      null,
      c.callbacks,
    );

    const done = c.events.find((e) => e[0] === "done");
    expect(done[1]).toBeTruthy();
  });
});
