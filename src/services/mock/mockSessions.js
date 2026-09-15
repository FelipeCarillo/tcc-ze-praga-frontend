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
      title: user?.content || "Análise de uma folha",
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
  localStorage.setItem(key(userId), JSON.stringify(sessions));
}
