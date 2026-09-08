import { renderHook, act, waitFor } from "@testing-library/react";

jest.mock("../../services/chatService", () => ({
  sendMessage: jest.fn(),
  sendMessageStream: jest.fn(),
  resumeMessageStream: jest.fn(),
}));

// `clearChat` fecha a sessão no backend (é o que dispara o resumo + índice no
// Store). Sem mockar, o teste dispara um axios real e o worker do jest fica
// pendurado no request.
jest.mock("../../services/sessionsService", () => ({
  getSessionMessages: jest.fn().mockResolvedValue([]),
  closeSession: jest.fn().mockResolvedValue(null),
  listSessions: jest.fn().mockResolvedValue([]),
  getPendingInterrupt: jest.fn().mockResolvedValue(null),
}));

jest.mock("uuid", () => {
  let counter = 0;
  return { v4: () => `uuid-${++counter}` };
});

// URL.createObjectURL doesn't exist in jsdom — stub it.
if (typeof URL.createObjectURL === "undefined") {
  Object.defineProperty(URL, "createObjectURL", { value: () => "blob:fake" });
}

const {
  sendMessage,
  sendMessageStream,
  resumeMessageStream,
} = require("../../services/chatService");
const {
  getSessionMessages,
  closeSession,
} = require("../../services/sessionsService");
const useChat = require("../useChat").default;

describe("useChat error handling", () => {
  beforeEach(() => {
    sendMessage.mockReset();
    sendMessageStream.mockReset();
  });

  it("appends an assistant error message when chatService rejects with 429", async () => {
    sendMessage.mockRejectedValueOnce({
      response: { status: 429, data: { detail: "limit reached" } },
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.send("teste", null);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const last = result.current.messages[result.current.messages.length - 1];
    expect(last.role).toBe("assistant");
    expect(last.content).toMatch(/limite de uso/i);
    expect(last.diagnosis).toBeNull();
  });

  it("appends a server-instability message when chatService rejects with 500", async () => {
    sendMessage.mockRejectedValueOnce({
      response: { status: 503, data: {} },
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.send("oi");
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const last = result.current.messages[result.current.messages.length - 1];
    expect(last.content).toMatch(/instabilidade/i);
  });

  it("appends a generic-fallback message when error has no shape", async () => {
    sendMessage.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.send("oi");
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const last = result.current.messages[result.current.messages.length - 1];
    expect(last.role).toBe("assistant");
    expect(last.content).toMatch(
      /Não foi possível processar|erro ao processar/i,
    );
  });

  it("appends successful response when chatService resolves", async () => {
    sendMessage.mockResolvedValueOnce({
      role: "assistant",
      content: "olá",
      diagnosis: null,
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.send("oi");
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const last = result.current.messages[result.current.messages.length - 1];
    expect(last.content).toBe("olá");
  });
});

describe("useChat streaming (sendStreaming)", () => {
  beforeEach(() => {
    sendMessage.mockReset();
    sendMessageStream.mockReset();
  });

  it("accumulates tokens into a single assistant placeholder and finalizes on done", async () => {
    // Capture callbacks so we can drive them manually.
    let captured = null;
    sendMessageStream.mockImplementation(
      (msgs, img, model, sid, audio, callbacks) =>
        new Promise((resolve) => {
          captured = { callbacks, resolve };
        }),
    );

    const { result } = renderHook(() => useChat());

    let streamPromise;
    await act(async () => {
      streamPromise = result.current.sendStreaming("oi");
    });

    // After starting: user message + placeholder, isStreaming on placeholder.
    expect(result.current.isLoading).toBe(true);
    let placeholder =
      result.current.messages[result.current.messages.length - 1];
    expect(placeholder.role).toBe("assistant");
    expect(placeholder.content).toBe("");
    expect(placeholder.isStreaming).toBe(true);

    // Drive incremental tokens.
    await act(async () => {
      captured.callbacks.onToken("Olá");
    });
    await act(async () => {
      captured.callbacks.onToken(", ");
    });
    await act(async () => {
      captured.callbacks.onToken("mundo!");
    });

    // Os tokens recebidos aparecem sem atraso artificial.
    await waitFor(() => {
      const p = result.current.messages[result.current.messages.length - 1];
      expect(p.content).toBe("Olá, mundo!");
    });
    placeholder = result.current.messages[result.current.messages.length - 1];
    expect(placeholder.isStreaming).toBe(true);

    // Tool call -> badge appears, then result -> badge cleared.
    await act(async () => {
      captured.callbacks.onToolCall("analyze_image");
    });
    placeholder = result.current.messages[result.current.messages.length - 1];
    expect(placeholder.toolCall).toBe("analyze_image");

    await act(async () => {
      captured.callbacks.onToolResult("done");
    });
    placeholder = result.current.messages[result.current.messages.length - 1];
    expect(placeholder.toolCall).toBeNull();

    // Diagnosis attaches to placeholder.
    const diag = { id: "d1", disease: "Ferrugem" };
    await act(async () => {
      captured.callbacks.onDiagnosis(diag);
    });
    placeholder = result.current.messages[result.current.messages.length - 1];
    expect(placeholder.diagnosis).toEqual(diag);

    // Done -> finalize: stop streaming, persist session id, resolve loading.
    await act(async () => {
      captured.callbacks.onDone("session-xyz");
      captured.resolve();
      await streamPromise;
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    placeholder = result.current.messages[result.current.messages.length - 1];
    expect(placeholder.isStreaming).toBe(false);
    expect(placeholder.content).toBe("Olá, mundo!");
    expect(result.current.sessionId).toBe("session-xyz");
  });

  it("replaces placeholder with an error message when stream rejects", async () => {
    sendMessageStream.mockImplementation(
      (msgs, img, model, sid, audio, callbacks) => {
        // Drive a token first, then reject.
        callbacks.onToken("parcial");
        return Promise.reject({ response: { status: 429, data: {} } });
      },
    );

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendStreaming("oi");
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const last = result.current.messages[result.current.messages.length - 1];
    expect(last.role).toBe("assistant");
    expect(last.content).toMatch(/limite de uso/i);
    expect(last.isStreaming).toBe(false);
    expect(last.diagnosis).toBeNull();
  });

  it("passes only the current turn (not full history) and image to the stream service", async () => {
    sendMessageStream.mockImplementation(
      (msgs, img, model, sid, audio, callbacks) => {
        callbacks.onDone("s1");
        return Promise.resolve();
      },
    );

    const fakeFile = new Blob(["x"], { type: "image/jpeg" });
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendStreaming("analisa essa folha", fakeFile, "vit");
    });

    expect(sendMessageStream).toHaveBeenCalledTimes(1);
    const [msgs, img, model, sid] = sendMessageStream.mock.calls[0];
    expect(Array.isArray(msgs)).toBe(true);
    // Backend reads only the last message + keeps history server-side via
    // session_id, so we send just the current turn — not the greeting/history.
    expect(msgs).toEqual([{ role: "user", content: "analisa essa folha" }]);
    expect(img).toBe(fakeFile);
    expect(model).toBe("vit");
    expect(sid).toBeNull(); // no prior session yet
  });

  it("clearChat resets sessionId after a successful stream", async () => {
    sendMessageStream.mockImplementation(
      (msgs, img, model, sid, audio, callbacks) => {
        callbacks.onDone("s-keep");
        return Promise.resolve();
      },
    );

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendStreaming("oi");
    });

    await waitFor(() => expect(result.current.sessionId).toBe("s-keep"));

    act(() => {
      result.current.clearChat();
    });

    expect(result.current.sessionId).toBeNull();
  });
});

describe("useChat — isolamento de operações", () => {
  beforeEach(() => {
    sendMessageStream.mockReset();
    getSessionMessages.mockReset();
    closeSession.mockResolvedValue(null);
  });

  it("aborta ao limpar e ignora eventos atrasados da conversa anterior", async () => {
    let transport;
    sendMessageStream.mockImplementation((messages, file, model, session, audio, callbacks, options) =>
      new Promise((resolve) => { transport = { callbacks, options, resolve }; }));
    const { result } = renderHook(() => useChat());
    let request;
    act(() => { request = result.current.sendStreaming("primeiro turno"); });
    act(() => { result.current.clearChat(); });
    expect(transport.options.signal.aborted).toBe(true);
    await act(async () => {
      transport.callbacks.onToken("resposta antiga");
      transport.callbacks.onDone("sessao-antiga");
      transport.resolve();
      await request;
    });
    expect(result.current.sessionId).toBeNull();
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).not.toContain("resposta antiga");
    expect(result.current.isLoading).toBe(false);
  });

  it("impede envio duplo antes de React atualizar a tela", async () => {
    let finish;
    sendMessageStream.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    const { result } = renderHook(() => useChat());
    let first;
    let second;
    act(() => {
      first = result.current.sendStreaming("mensagem");
      second = result.current.sendStreaming("mensagem");
    });
    expect(await second).toBe(false);
    expect(sendMessageStream).toHaveBeenCalledTimes(1);
    await act(async () => { finish(); await first; });
  });

  it("mantém a sessão escolhida por último quando a anterior chega depois", async () => {
    let oldResponse;
    getSessionMessages.mockImplementation((id) => id === "antiga"
      ? new Promise((resolve) => { oldResponse = resolve; })
      : Promise.resolve([{ id: "nova-1", role: "user", content: "conversa atual" }]));
    const { result } = renderHook(() => useChat());
    let oldRequest;
    act(() => { oldRequest = result.current.loadSession("antiga"); });
    await act(async () => { await result.current.loadSession("nova"); });
    await act(async () => {
      oldResponse([{ id: "antiga-1", role: "user", content: "conversa antiga" }]);
      await oldRequest;
    });
    expect(result.current.sessionId).toBe("nova");
    expect(result.current.messages[0].content).toBe("conversa atual");
    expect(result.current.isLoading).toBe(false);
  });
});

describe("useChat — transcrição de voz", () => {
  beforeEach(() => {
    sendMessage.mockReset();
    sendMessageStream.mockReset();
  });

  it("substitui o balão do usuário pelo texto transcrito", async () => {
    // O backend emite `transcript` antes dos tokens quando o turno veio por
    // áudio. Antes o evento caía no `default` do switch e o usuário ficava só
    // com "🎤 Mensagem de voz" — sem conferir o que o Whisper entendeu.
    let captured = null;
    sendMessageStream.mockImplementation(
      (msgs, img, model, sid, audio, callbacks) =>
        new Promise((resolve) => {
          captured = { callbacks, resolve };
        }),
    );

    const { result } = renderHook(() => useChat());
    const audio = new File(["x"], "voice.webm", { type: "audio/webm" });

    let streamPromise;
    await act(async () => {
      streamPromise = result.current.sendStreaming("", null, "ensemble", audio);
    });

    const userMsg = () =>
      result.current.messages.filter((m) => m.role === "user").pop();

    expect(userMsg().content).toBe("🎤 Mensagem de voz");

    await act(async () => {
      captured.callbacks.onTranscript("a folha tá com manchas amareladas");
    });

    expect(userMsg().content).toBe("a folha tá com manchas amareladas");
    expect(userMsg().isTranscript).toBe(true);

    await act(async () => {
      captured.callbacks.onDone("s-1");
      captured.resolve();
      await streamPromise;
    });
  });

  it("ignora transcrição vazia em vez de apagar o balão", async () => {
    let captured = null;
    sendMessageStream.mockImplementation(
      (msgs, img, model, sid, audio, callbacks) =>
        new Promise((resolve) => {
          captured = { callbacks, resolve };
        }),
    );

    const { result } = renderHook(() => useChat());
    const audio = new File(["x"], "voice.webm", { type: "audio/webm" });

    let streamPromise;
    await act(async () => {
      streamPromise = result.current.sendStreaming("", null, "ensemble", audio);
    });

    await act(async () => {
      captured.callbacks.onTranscript("");
    });

    const userMsg = result.current.messages
      .filter((m) => m.role === "user")
      .pop();
    expect(userMsg.content).toBe("🎤 Mensagem de voz");

    await act(async () => {
      captured.callbacks.onDone("s-1");
      captured.resolve();
      await streamPromise;
    });
  });
});

describe("useChat — human-in-the-loop (ask_user)", () => {
  beforeEach(() => {
    sendMessage.mockReset();
    sendMessageStream.mockReset();
    resumeMessageStream.mockReset();
  });

  function driveStream() {
    let captured = null;
    sendMessageStream.mockImplementation(
      (msgs, img, model, sid, audio, callbacks) =>
        new Promise((resolve) => {
          captured = { callbacks, resolve };
        }),
    );
    return () => captured;
  }

  it("expõe a pergunta do agente e pausa a conversa", async () => {
    const get = driveStream();
    const { result } = renderHook(() => useChat());

    let streamPromise;
    await act(async () => {
      streamPromise = result.current.sendStreaming("analisa isso");
    });

    expect(result.current.pendingInterrupt).toBeNull();

    await act(async () => {
      get().callbacks.onInterrupt({
        kind: "ask_user",
        question: "É soja ou milho?",
        responseKind: "choice",
        options: ["Soja", "Milho"],
      });
      get().callbacks.onDone("sess-1");
      get().resolve();
      await streamPromise;
    });

    expect(result.current.pendingInterrupt.question).toBe("É soja ou milho?");
    expect(result.current.pendingInterrupt.options).toEqual(["Soja", "Milho"]);
    // O session_id chega no `done`, depois do interrupt — sem ele o resume não
    // saberia qual thread retomar.
    expect(result.current.pendingInterrupt.sessionId).toBe("sess-1");
  });

  it("answerInterrupt retoma o turno e limpa a pergunta", async () => {
    const get = driveStream();
    resumeMessageStream.mockImplementation((threadId, answer, callbacks) => {
      callbacks.onToken("Beleza, soja então.");
      return Promise.resolve();
    });

    const { result } = renderHook(() => useChat());

    let streamPromise;
    await act(async () => {
      streamPromise = result.current.sendStreaming("analisa");
    });
    await act(async () => {
      get().callbacks.onInterrupt({
        question: "É soja ou milho?",
        responseKind: "choice",
        options: ["Soja", "Milho"],
      });
      get().callbacks.onDone("sess-1");
      get().resolve();
      await streamPromise;
    });

    await act(async () => {
      await result.current.answerInterrupt("Soja");
    });

    expect(resumeMessageStream).toHaveBeenCalledWith(
      "sess-1",
      "Soja",
      expect.any(Object),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.current.pendingInterrupt).toBeNull();

    // A resposta do usuário entra como mensagem dele na conversa.
    const userMsgs = result.current.messages.filter((m) => m.role === "user");
    expect(userMsgs[userMsgs.length - 1].content).toBe("Soja");

    await waitFor(() => {
      const last = result.current.messages[result.current.messages.length - 1];
      expect(last.content).toBe("Beleza, soja então.");
    });
  });

  it("aceita uma segunda pergunta no mesmo turno", async () => {
    const get = driveStream();
    resumeMessageStream.mockImplementation((threadId, answer, callbacks) => {
      callbacks.onInterrupt({
        question: "Qual estádio?",
        responseKind: "text",
      });
      return Promise.resolve();
    });

    const { result } = renderHook(() => useChat());
    let streamPromise;
    await act(async () => {
      streamPromise = result.current.sendStreaming("analisa");
    });
    await act(async () => {
      get().callbacks.onInterrupt({
        question: "É soja?",
        responseKind: "boolean",
      });
      get().callbacks.onDone("sess-1");
      get().resolve();
      await streamPromise;
    });

    await act(async () => {
      await result.current.answerInterrupt("Sim");
    });

    expect(result.current.pendingInterrupt.question).toBe("Qual estádio?");
  });

  it("answerInterrupt é no-op quando não há pergunta pendente", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.answerInterrupt("oi");
    });

    expect(resumeMessageStream).not.toHaveBeenCalled();
  });

  it("clearChat descarta a pergunta pendente", async () => {
    const get = driveStream();
    const { result } = renderHook(() => useChat());

    let streamPromise;
    await act(async () => {
      streamPromise = result.current.sendStreaming("analisa");
    });
    await act(async () => {
      get().callbacks.onInterrupt({
        question: "É soja?",
        responseKind: "boolean",
      });
      get().callbacks.onDone("sess-1");
      get().resolve();
      await streamPromise;
    });

    expect(result.current.pendingInterrupt).not.toBeNull();

    act(() => {
      result.current.clearChat();
    });

    expect(result.current.pendingInterrupt).toBeNull();
  });
});

describe("useChat — conversas persistidas", () => {
  beforeEach(() => {
    sendMessage.mockReset();
    sendMessageStream.mockReset();
    resumeMessageStream.mockReset();
    getSessionMessages.mockReset();
    closeSession.mockReset();
    getSessionMessages.mockResolvedValue([]);
    closeSession.mockResolvedValue(null);
  });

  it("loadSession repopula a conversa e adota o sessionId", async () => {
    getSessionMessages.mockResolvedValueOnce([
      { id: "m1", role: "user", content: "olha essa folha" },
      { id: "m2", role: "assistant", content: "Isso é ferrugem." },
    ]);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.loadSession("sess-antiga");
    });

    expect(result.current.sessionId).toBe("sess-antiga");
    expect(result.current.messages.map((m) => m.content)).toEqual([
      "olha essa folha",
      "Isso é ferrugem.",
    ]);
  });

  it("loadSession de conversa vazia cai na saudação inicial", async () => {
    getSessionMessages.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.loadSession("sess-vazia");
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe("assistant");
  });

  it("clearChat fecha a sessão anterior para gerar o resumo", async () => {
    // POST /sessions/{id}/close é o que grava `summary_text` e indexa o resumo
    // no Store — sem essa chamada a memória entre sessões nunca é alimentada.
    getSessionMessages.mockResolvedValueOnce([
      { id: "m1", role: "user", content: "oi" },
    ]);

    const { result } = renderHook(() => useChat());
    await act(async () => {
      await result.current.loadSession("sess-1");
    });

    act(() => {
      result.current.clearChat();
    });

    expect(closeSession).toHaveBeenCalledWith("sess-1");
    expect(result.current.sessionId).toBeNull();
  });

  it("clearChat sem sessão aberta não chama o backend", () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.clearChat();
    });

    expect(closeSession).not.toHaveBeenCalled();
  });
});
