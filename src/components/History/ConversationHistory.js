import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, InputBase, Skeleton, Typography } from "@mui/material";
import { MessageSquare, Mic, Search } from "lucide-react";
import { useSessions } from "../Chat/SessionsList";

const DAY = 86400000;

/** Hoje, Esta semana e Antes — como no m-Historico-Conversas. */
export function groupConversations(sessions, now = Date.now()) {
  const today = new Date(now).toDateString();
  const groups = [
    { label: "Hoje", items: [] },
    { label: "Esta semana", items: [] },
    { label: "Antes", items: [] },
  ];
  for (const s of sessions) {
    const at = new Date(s.updatedAt || s.createdAt || 0);
    if (at.toDateString() === today) groups[0].items.push(s);
    else if (now - at.getTime() < 7 * DAY) groups[1].items.push(s);
    else groups[2].items.push(s);
  }
  return groups.filter((g) => g.items.length);
}

export function when(iso, now = Date.now()) {
  const d = new Date(iso);
  if (d.toDateString() === new Date(now).toDateString())
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (now - d.getTime() < 7 * DAY) return d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
}

function isVoice(s) {
  return /mensagem de voz/i.test(s.title || "") || /^🎤/.test(s.title || "");
}

function Row({ s, first, onOpen }) {
  const voice = isVoice(s);
  return (
    <Box
      component="button"
      type="button"
      onClick={() => onOpen(s.id)}
      sx={{ width: "100%", display: "flex", gap: 1.5, alignItems: "center", px: 1.75, py: 1.4, border: 0, borderTop: first ? "none" : "1px solid", borderColor: "divider", bgcolor: "transparent", color: "text.primary", fontFamily: "inherit", textAlign: "left", cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
    >
      {s.imageUrl ? (
        <Box component="img" src={s.imageUrl} alt="" sx={{ width: 48, height: 48, borderRadius: "12px", objectFit: "cover", flexShrink: 0 }} />
      ) : (
        <Box sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: "surface.muted", color: "primary.main", display: "grid", placeItems: "center", flexShrink: 0 }}>
          {voice ? <Mic size={22} aria-hidden="true" /> : <MessageSquare size={22} aria-hidden="true" />}
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem" }} noWrap>
            {(s.title || "Conversa com o Zé").replace(/^🎤\s*/, "")}
          </Typography>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: "0.75rem", color: "text.secondary", flexShrink: 0 }}>
            {when(s.updatedAt || s.createdAt)}
          </Typography>
        </Box>
        {s.lastReply && (
          <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }} noWrap>
            Zé: {s.lastReply}
          </Typography>
        )}
        {(s.diagnosisCount > 0 || s.talhaoNome) && (
          <Box sx={{ mt: 0.5, display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {s.diagnosisCount > 0 && (
              <Box component="span" sx={{ fontSize: "0.6875rem", fontWeight: 700, px: 1, py: 0.25, borderRadius: 999, bgcolor: "#FDE9D7", color: "#8F3B07" }}>
                {s.diagnosisCount} {s.diagnosisCount === 1 ? "laudo" : "laudos"}
              </Box>
            )}
            {s.talhaoNome && (
              <Box component="span" sx={{ fontSize: "0.6875rem", fontWeight: 700, px: 1, py: 0.25, borderRadius: 999, bgcolor: "surface.muted" }}>
                {s.talhaoNome}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

/**
 * Histórico de conversas — m-Historico-Conversas (TCC-097): busca, conversas
 * agrupadas por quando aconteceram, com a última resposta do Zé, os laudos
 * que saíram de cada uma e o talhão. Tocar reabre a conversa no chat.
 */
export default function ConversationHistory() {
  const navigate = useNavigate();
  const { sessions, loading, error, reload } = useSessions(true);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return sessions;
    return sessions.filter((s) => [s.title, s.preview, s.lastReply, s.talhaoNome].some((v) => (v || "").toLowerCase().includes(t)));
  }, [sessions, q]);
  const open = (id) => navigate("/chat", { state: { sessionId: id } });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box sx={{ position: "relative" }}>
        <Box sx={{ position: "absolute", left: 14, top: 15, color: "text.secondary", display: "flex", zIndex: 1 }}>
          <Search size={18} aria-hidden="true" />
        </Box>
        <InputBase
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar nas conversas"
          inputProps={{ "aria-label": "Buscar nas conversas" }}
          sx={{ width: "100%", height: 48, border: "1.5px solid", borderColor: "divider", borderRadius: "14px", pl: 5.25, pr: 1.75, bgcolor: "background.paper", fontSize: "1rem" }}
        />
      </Box>
      {loading ? (
        [0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: "18px" }} />)
      ) : error ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="text.secondary">Não consegui carregar suas conversas agora.</Typography>
          <Button onClick={reload} sx={{ mt: 1 }}>Tentar de novo</Button>
        </Box>
      ) : !filtered.length ? (
        <Box sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
          <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
            {q ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
          </Typography>
          <Typography sx={{ fontSize: "0.875rem", mt: 0.5 }}>
            {q ? "Tente outra palavra." : "Pergunte algo ao Zé ou mande a foto de uma folha."}
          </Typography>
        </Box>
      ) : (
        groupConversations(filtered).map((g, gi) => (
          <Box key={g.label} sx={{ display: "flex", flexDirection: "column", gap: 1, animation: `zpUp .5s ${gi * 0.08}s cubic-bezier(.2,.7,.2,1) both` }}>
            <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: "0.75rem", fontWeight: 600, letterSpacing: ".06em", color: "text.secondary", textTransform: "uppercase", mt: gi ? 0.75 : 0 }}>
              {g.label}
            </Typography>
            <Box sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: "18px", overflow: "hidden" }}>
              {g.items.map((s, i) => (
                <Row key={s.id} s={s} first={i === 0} onOpen={open} />
              ))}
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
}
