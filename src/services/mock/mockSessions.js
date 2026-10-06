const key = (userId) => "ze-praga-sessions:" + userId;
function read(userId) {
  try {
    return JSON.parse(localStorage.getItem(key(userId)) || "[]");
  } catch {
    return [];
  }
}
export function listDemoSessions(userId) {
  return read(userId)
    .map(({ messages, ...session }) => session)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export function demoSessionMessages(userId, id) {
  return read(userId).find((s) => s.id === id)?.messages || [];
}
export function appendDemoTurn(userId, id, user, assistant) {
  const sessions = read(userId),
    now = new Date().toISOString();
  let session = sessions.find((s) => s.id === id);
  if (!session) {
    session = {
      id,
      title: user?.content || (user?.hasImage ? "Foto de folha" : "Conversa com o Zé"),
      preview: user?.content || "",
      createdAt: now,
      messages: [],
    };
    sessions.push(session);
  }
  session.messages.push(
    ...[user, assistant].map((m, i) => ({
      ...m,
      id: id + "-" + Date.now() + "-" + i,
      timestamp: now,
    })),
  );
  session.messageCount = session.messages.length;
  session.updatedAt = now;
  // TCC-097: o card de "Conversas" — última resposta, laudos, foto e talhão.
  if (assistant?.content) session.lastReply = assistant.content.replace(/[*#]/g, "").replace(/\s+/g, " ").trim().slice(0, 160);
  const laudos = session.messages.filter((m) => m.diagnosis);
  session.diagnosisCount = laudos.length;
  const ultimo = laudos[laudos.length - 1]?.diagnosis;
  if (ultimo) {
    session.imageUrl = ultimo.imageUrl || session.imageUrl || null;
    session.talhaoNome = ultimo.talhaoNome || null;
  }
  localStorage.setItem(key(userId), JSON.stringify(sessions));
}
