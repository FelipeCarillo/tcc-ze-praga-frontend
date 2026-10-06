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

const { mockResumeStream, mockSendMessageStream } = require("../mock/mockChatStream");
const { createLocalTalhao, readTalhoes } = require("../localFarmStore");

beforeEach(() => localStorage.clear());

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
      onInterrupt: (i) => events.push(["interrupt", i]),
      onTalhao: (t) => events.push(["talhao", t]),
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

    const sede = createLocalTalhao({ nome: "Talhão 3", apelido: "Sede" });
    await mockSendMessageStream([], file, "ensemble", null, c.callbacks, { talhaoId: sede.id });

    const toolCalls = c.events
      .filter((e) => e[0] === "tool_call")
      .map((e) => e[1]);
    // A ordem importa: analyze_image só depois do gate confirmar que é planta.
    expect(toolCalls).toEqual(["inspect_image", "analyze_image", "get_action_plan"]);

    const diagnosis = c.events.find((e) => e[0] === "diagnosis");
    expect(diagnosis[1].disease).toBeTruthy();
    expect(diagnosis[1].top3).toHaveLength(3);
    expect(diagnosis[1].talhaoId).toBe(sede.id);
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

const tools = (events) => events.filter((e) => e[0] === "tool_call").map((e) => e[1]);
const photo = () => new File(["x"], "folha.jpg", { type: "image/jpeg" });

describe("agente simulado — talhão (TCC-098)", () => {
  it("sem talhão escolhido, pergunta antes de analisar", async () => {
    createLocalTalhao({ nome: "Talhão 3", apelido: "Sede" });
    const c = collector();
    await mockSendMessageStream([], photo(), "ensemble", null, c.callbacks, { sessionId: "s1" });
    const ask = c.events.find((e) => e[0] === "interrupt")[1];
    expect(ask.question).toMatch(/em qual talhão/);
    expect(ask.options).toEqual(["Talhão 3 · Sede", "Novo talhão", "Pular"]);
    expect(tools(c.events)).toEqual(["list_my_talhoes"]);
    expect(kinds(c.events)).not.toContain("diagnosis");
  });

  it("escolher um talhão existente liga o laudo a ele", async () => {
    const sede = createLocalTalhao({ nome: "Talhão 3", apelido: "Sede" });
    await mockSendMessageStream([], photo(), "ensemble", null, collector().callbacks, { sessionId: "s2" });
    const c = collector();
    await mockResumeStream("s2", "Talhão 3 · Sede", c.callbacks);
    expect(tools(c.events)).toEqual(["use_talhao", "inspect_image", "analyze_image", "get_action_plan"]);
    expect(c.events.find((e) => e[0] === "talhao")[1]).toMatchObject({ id: sede.id, created: false });
    expect(c.events.find((e) => e[0] === "diagnosis")[1].talhaoId).toBe(sede.id);
  });

  it("'Novo talhão' pede a descrição e cadastra antes de analisar", async () => {
    await mockSendMessageStream([], photo(), "ensemble", null, collector().callbacks, { sessionId: "s3" });
    const c1 = collector();
    await mockResumeStream("s3", "Novo talhão", c1.callbacks);
    expect(c1.events.find((e) => e[0] === "interrupt")[1].response_kind).toBe("text");
    const c2 = collector();
    await mockResumeStream("s3", "É novo. Talhão 9, do Rio, uns 40 hectares. Plantei dia 12 de setembro.", c2.callbacks);
    const talhao = c2.events.find((e) => e[0] === "talhao")[1];
    expect(talhao).toMatchObject({ nome: "Talhão 9", apelido: "Rio", hectares: 40, created: true, fazendaNome: "Minha fazenda" });
    expect(talhao.dataSemeadura).toMatch(/-09-12$/);
    expect(readTalhoes().map((t) => t.nome)).toContain("Talhão 9");
    expect(c2.events.find((e) => e[0] === "diagnosis")[1].talhaoId).toBe(talhao.id);
  });

  it("'Pular' analisa sem talhão", async () => {
    await mockSendMessageStream([], photo(), "ensemble", null, collector().callbacks, { sessionId: "s4" });
    const c = collector();
    await mockResumeStream("s4", "Pular", c.callbacks);
    expect(kinds(c.events)).not.toContain("talhao");
    expect(c.events.find((e) => e[0] === "diagnosis")[1].talhaoId).toBeNull();
  });

  it("cadastra talhão pedido na conversa", async () => {
    const c = collector();
    await mockSendMessageStream([{ role: "user", content: "cria o talhão 9 do Rio, 40 hectares" }], null, "ensemble", null, c.callbacks);
    expect(tools(c.events)).toEqual(["register_talhao"]);
    expect(c.events.find((e) => e[0] === "talhao")[1]).toMatchObject({ nome: "Talhão 9", apelido: "Rio", hectares: 40 });
  });

  it("resume sem pergunta pendente responde sem quebrar", async () => {
    const c = collector();
    await mockResumeStream("nada", "oi", c.callbacks);
    expect(kinds(c.events)).toContain("token");
    expect(kinds(c.events).pop()).toBe("done");
  });
});
