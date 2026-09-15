import { listDemoSessions, demoSessionMessages } from './mock/mockSessions';
import { IS_DEMO } from '../config/runtime';
import api from './api';
import { getAuthHeaders, getCurrentUserId } from './authService';

const USE_MOCK = IS_DEMO;

/**
 * Conversas do chat — listagem e releitura.
 *
 * O backend sempre persistiu `chat_sessions` e `chat_messages`, mas não expunha
 * leitura: o chat recomeçava do zero a cada reload. Estes endpoints (GET
 * /sessions e GET /sessions/{id}/messages) fecham esse buraco.
 */

function mapSession(data) {
  return {
    id: data.id,
    // `title` ainda não é preenchido por nada no backend; a primeira mensagem
    // do usuário é o rótulo natural da conversa.
    title: data.title || data.preview || 'Conversa sem título',
    preview: data.preview,
    messageCount: data.message_count,
    summary: data.summary_text,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapMessage(data) {
  return {
    id: data.id,
    role: data.role,
    content: data.content,
    diagnosisId: data.diagnosis_id,
    timestamp: data.created_at,
  };
}

/**
 * Lista as conversas do usuário, mais recentes primeiro.
 * @returns {Promise<Array<object>>} vazio quando não há conversas ou sem auth.
 */
export async function listSessions(limit = 50) {
  // Sem backend não há conversa persistida: lista vazia é o estado honesto
  // (o drawer mostra o empty state em vez do erro de rede).
  if (USE_MOCK) return listDemoSessions(getCurrentUserId());

  try {
    const response = await api.get('/api/v1/sessions', {
      params: { limit },
      headers: getAuthHeaders(),
    });
    return (response.data || []).map(mapSession);
  } catch (error) {
    // Histórico é acessório: sem ele o chat continua funcionando normalmente.
    if (error?.response?.status === 401) return [];
    throw error;
  }
}

/**
 * Mensagens de uma conversa, em ordem cronológica.
 * @returns {Promise<Array<object>>} vazio quando a conversa não existe.
 */
export async function getSessionMessages(sessionId) {
  if (!sessionId) return [];
  if (USE_MOCK) return demoSessionMessages(getCurrentUserId(), sessionId);
  try {
    const response = await api.get(`/api/v1/sessions/${sessionId}/messages`, {
      headers: getAuthHeaders(),
    });
    return (response.data || []).map(mapMessage);
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
}

/**
 * Encerra a conversa: o backend gera o resumo, grava em `summary_text` e o
 * indexa no Store para virar memória entre sessões.
 *
 * Best-effort — se falhar, a conversa simplesmente fica sem resumo.
 */
export async function closeSession(sessionId) {
  if (!sessionId || USE_MOCK) return null;
  try {
    const response = await api.post(
      `/api/v1/sessions/${sessionId}/close`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch {
    return null;
  }
}

export async function getPendingInterrupt(sessionId) {
 if (USE_MOCK) return null;
 const {data} = await api.get('/api/v1/chat/interrupts', {headers:getAuthHeaders()});
 const info = (data || []).find(item=>item.session_id===sessionId)?.interrupt;
 return info ? {...info, responseKind:info.response_kind} : null;
}
