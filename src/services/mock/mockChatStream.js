import { delay } from './delay';
import { mockAnalyzeImage } from './mockInference';
import { chatResponses } from './mockData';

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
 */

const MOCK_SESSION_ID = 'mock-session';

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

/**
 * Mock de `sendMessageStream` — mesma assinatura de callbacks.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {File|null} imageFile
 * @param {string} modelId
 * @param {File|null} audioFile
 * @param {object} callbacks mesmos de `sendMessageStream`
 */
export async function mockSendMessageStream(
  messages,
  imageFile = null,
  modelId = 'ensemble',
  audioFile = null,
  callbacks = {}
) {
  const { onTranscript, onToken, onToolCall, onToolResult, onDiagnosis, onDone } =
    callbacks;

  if (audioFile && onTranscript) {
    await delay(500);
    onTranscript('essa folha aqui tá com umas manchas, o que será?');
  }

  if (imageFile) {
    // Gate de visão — no real é uma chamada de visão antes de diagnosticar.
    if (onToolCall) onToolCall('inspect_image');
    await delay(700);
    if (onToolResult) onToolResult('{"is_analyzable_plant": true}');

    if (onToolCall) onToolCall('analyze_image');
    const result = await mockAnalyzeImage(imageFile, modelId);
    if (onToolResult) onToolResult(JSON.stringify({ disease_id: result.diseaseId }));

    await streamText(
      `Olhei com calma. Isso aí é **${result.disease}** (*${result.scientificName}*), ` +
        `com ${(result.confidence * 100).toFixed(1)}% de confiança. ` +
        'Abre o card aí embaixo que eu te mostro a receita.',
      onToken
    );

    if (onDiagnosis) onDiagnosis(result);
    if (onDone) onDone(MOCK_SESSION_ID);
    return;
  }

  const last = messages && messages.length ? messages[messages.length - 1] : null;
  await delay(400);
  await streamText(keywordResponse(last ? last.content : ''), onToken);
  if (onDone) onDone(MOCK_SESSION_ID);
}

export default mockSendMessageStream;
