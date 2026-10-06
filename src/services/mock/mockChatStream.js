import { delay } from './delay';
import { mockAnalyzeImage } from './mockInference';
import { chatResponses } from './mockData';
import { createLocalTalhao, readFazendas, readTalhoes } from '../localFarmStore';
import { parseTalhao, pedeCadastroDeTalhao } from '../../utils/parseTalhao';

/**
 * Versão mock do streaming SSE do chat.
 *
 * `REACT_APP_USE_MOCK=true` é documentado como "navega a UI sem backend", mas
 * só o `sendMessage` (síncrono) tinha caminho mock — e a `ChatPage` usa
 * `sendStreaming`. Ou seja: o recurso principal do produto era justamente o
 * que não funcionava sem backend.
 *
 * Reproduz a sequência real de eventos do `/chat/stream`, com as mesmas pausas
 * de ordem de grandeza (gate de visão, inferência ONNX, plano de ação), pra a
 * UI de streaming — typewriter, badge de ferramenta, card de diagnóstico —
 * poder ser exercitada e demonstrada sem Postgres, Supabase ou OpenAI.
 *
 * TCC-098: também simula o agente perguntando o talhão (ask_user) e
 * cadastrando um talhão descrito na conversa, com o resume da pergunta —
 * o mesmo roteiro que o system prompt pede ao agente real.
 */

const MOCK_SESSION_ID = 'mock-session';
const NOVO = 'Novo talhão';
const PULAR = 'Pular';

// Perguntas pendentes por conversa (o "checkpointer" do demo).
const pending = new Map();

function keywordResponse(text) {
  const lower = (text || '').toLowerCase();
  if (lower.match(/oi|ol[áa]|bom dia|boa tarde|boa noite|hey|hello/)) {
    return chatResponses.greeting;
  }
  if (lower.match(/quem [ée] voc[êe]|o que voc[êe] faz|sobre voc[êe]|como funciona/)) {
    return chatResponses.about;
  }
  if (lower.match(/ferrugem/)) return chatResponses.ferrugem;
  if (lower.match(/mancha|alvo/)) return chatResponses.mancha;
  return chatResponses.default;
}

/** Emite o texto em pedaços, como o LLM faria. */
async function streamText(text, onToken) {
  if (!onToken || !text) return;
  const words = text.split(' ');
  for (let i = 0; i < words.length; i += 3) {
    const chunk = words.slice(i, i + 3).join(' ');
    onToken(i === 0 ? chunk : ` ${chunk}`);
    // eslint-disable-next-line no-await-in-loop -- streaming é sequencial por natureza
    await new Promise((r) => setTimeout(r, 45));
  }
}

const rotulo = (t) => `${t.nome}${t.apelido ? ' · ' + t.apelido : ''}`;

/** Rótulos das opções; nome repetido em outra fazenda leva o nome da fazenda. */
function opcoes(talhoes) {
  const fazendas = new Map(readFazendas().map((f) => [f.id, f.nome]));
  const conta = talhoes.reduce((m, t) => m.set(rotulo(t), (m.get(rotulo(t)) || 0) + 1), new Map());
  return talhoes.map((t) => ({
    t,
    label: conta.get(rotulo(t)) > 1 ? `${rotulo(t)} (${fazendas.get(t.fazendaId) || 'outra fazenda'})` : rotulo(t),
  }));
}

function selected(t, created) {
  const fazenda = readFazendas().find((f) => f.id === t.fazendaId);
  return {
    id: t.id,
    nome: t.nome,
    apelido: t.apelido || null,
    hectares: t.hectares ?? null,
    dataSemeadura: t.dataSemeadura || null,
    fazendaId: t.fazendaId || null,
    fazendaNome: fazenda?.nome || null,
    created,
  };
}

async function registrar(texto, cb) {
  cb.onToolCall?.('register_talhao');
  await delay(500);
  const t = createLocalTalhao(parseTalhao(texto));
  const sel = selected(t, true);
  cb.onToolResult?.(JSON.stringify({ ok: true, talhao: sel }));
  cb.onTalhao?.(sel);
  return sel;
}

async function analisar(imageFile, modelId, cb, talhao) {
  cb.onToolCall?.('inspect_image');
  await delay(700);
  cb.onToolResult?.('{"is_analyzable_plant": true}');
  cb.onToolCall?.('analyze_image');
  const result = await mockAnalyzeImage(imageFile, modelId);
  cb.onToolResult?.(JSON.stringify({ disease_id: result.diseaseId }));
  cb.onToolCall?.('get_action_plan');
  await delay(600);
  cb.onToolResult?.('{"levels": ["essencial"]}');
  const onde = talhao ? ` no ${rotulo(talhao)}` : '';
  await streamText(
    `Neste exemplo simulado, a hipótese exibida${onde} é **${result.disease}** (*${result.scientificName}*), ` +
      `com ${(result.confidence * 100).toFixed(1)}% de confiança. ` +
      'Abra o resultado abaixo para conhecer as orientações do catálogo.',
    cb.onToken
  );
  cb.onDiagnosis?.({
    ...result,
    talhaoId: talhao?.id ?? null,
    talhaoNome: talhao?.nome ?? null,
  });
}

/**
 * Mock de `sendMessageStream` — mesma assinatura de callbacks.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {File|null} imageFile
 * @param {string} modelId
 * @param {File|null} audioFile
 * @param {object} callbacks mesmos de `sendMessageStream` (+ onInterrupt, onTalhao)
 * @param {{sessionId?: string, talhaoId?: string, talhaoNome?: string}} [options]
 */
export async function mockSendMessageStream(
  messages,
  imageFile = null,
  modelId = 'ensemble',
  audioFile = null,
  callbacks = {},
  options = {}
) {
  const sid = options.sessionId || MOCK_SESSION_ID;
  const cb = callbacks;

  if (audioFile && cb.onTranscript) {
    await delay(500);
    cb.onTranscript('essa folha aqui tá com umas manchas, o que será?');
  }

  if (imageFile) {
    let talhao = null;
    if (options.talhaoId) {
      const t = readTalhoes().find((x) => x.id === options.talhaoId);
      talhao = t ? selected(t, false) : { id: options.talhaoId, nome: options.talhaoNome };
    } else {
      // Sem talhão escolhido, o Zé pergunta antes de analisar.
      cb.onToolCall?.('list_my_talhoes');
      await delay(400);
      const talhoes = readTalhoes();
      cb.onToolResult?.(JSON.stringify({ selected_talhao_id: null, talhoes: talhoes.length }));
      pending.set(sid, { stage: 'talhao', imageFile, modelId });
      cb.onInterrupt?.({
        kind: 'ask_user',
        question: 'Antes de analisar: em qual talhão você tirou essa foto? Assim eu guardo o laudo no lugar certo.',
        response_kind: 'choice',
        options: [...opcoes(talhoes).slice(0, 6).map((o) => o.label), NOVO, PULAR],
      });
      cb.onDone?.(sid);
      return;
    }
    await analisar(imageFile, modelId, cb, talhao);
    cb.onDone?.(sid);
    return;
  }

  const last = messages && messages.length ? messages[messages.length - 1] : null;
  if (pedeCadastroDeTalhao(last?.content)) {
    const sel = await registrar(last.content, cb);
    await streamText(
      `Pronto, cadastrei o **${rotulo(sel)}**${sel.fazendaNome ? ` na ${sel.fazendaNome}` : ''}. ` +
        'As próximas fotos já vão para esse talhão.',
      cb.onToken
    );
    cb.onDone?.(sid);
    return;
  }
  await delay(400);
  await streamText(keywordResponse(last ? last.content : ''), cb.onToken);
  cb.onDone?.(sid);
}

/** Resume de uma pergunta do Zé no demo (o `/chat/resume` simulado). */
export async function mockResumeStream(sessionId, response, callbacks = {}) {
  const cb = callbacks;
  const sid = sessionId || MOCK_SESSION_ID;
  const state = pending.get(sid);
  pending.delete(sid);
  if (!state) {
    await streamText('Anotado! Se quiser, mande outra foto ou pergunte o que precisar.', cb.onToken);
    cb.onDone?.(sid);
    return;
  }
  if (state.stage === 'talhao') {
    if (response === NOVO) {
      pending.set(sid, { ...state, stage: 'novo' });
      cb.onInterrupt?.({
        kind: 'ask_user',
        question: 'Me conta o nome, o apelido, a área e quando você plantou. Ex.: "Talhão 9, do Rio, 40 hectares, plantei dia 12 de setembro".',
        response_kind: 'text',
        options: null,
      });
      cb.onDone?.(sid);
      return;
    }
    let talhao = null;
    if (response !== PULAR) {
      const t = opcoes(readTalhoes()).find((o) => o.label === response)?.t || readTalhoes().find((x) => rotulo(x) === response || x.nome === response);
      if (t) {
        cb.onToolCall?.('use_talhao');
        await delay(300);
        talhao = selected(t, false);
        cb.onToolResult?.(JSON.stringify({ ok: true, talhao }));
        cb.onTalhao?.(talhao);
      }
    }
    await analisar(state.imageFile, state.modelId, cb, talhao);
    cb.onDone?.(sid);
    return;
  }
  // stage "novo": a descrição do talhão novo.
  const sel = await registrar(response, cb);
  await analisar(state.imageFile, state.modelId, cb, sel);
  cb.onDone?.(sid);
}

export default mockSendMessageStream;
