import React, { useCallback, useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { MessageSquare } from "lucide-react";
import { listSessions } from "../../services/sessionsService";

const DAY = 86400000;

/**
 * Agrupa por data. O canvas (d-Chat) agrupa as conversas por talhão, mas a
 * sessão de chat não guarda talhão no backend — então o agrupamento honesto é
 * por quando a conversa aconteceu.
 */
export function groupSessions(sessions, now = Date.now()) {
  const today = new Date(now).toDateString();
  const groups = [
    { label: "Hoje", items: [] },
    { label: "Últimos 7 dias", items: [] },
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

export function useSessions(active = true) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setSessions(await listSessions());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (active) reload();
  }, [active, reload]);
  return { sessions, loading, error, reload };
}

/**
 * Lista de conversas. `tone="dark"` é a lateral do desktop (d-Chat);
 * `tone="light"` é a gaveta do celular.
 */
export default function SessionsList({
  sessions,
  loading,
  error,
  currentSessionId,
  onSelect,
  tone = "light",
}) {
  const dark = tone === "dark";
  const muted = dark ? "#8A9B86" : "text.secondary";
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress
          size={22}
          sx={{ color: dark ? "#C8F169" : undefined }}
        />
      </Box>
    );
  if (error)
    return (
      <Typography variant="body2" sx={{ color: muted, px: 1, py: 2 }}>
        Não consegui carregar suas conversas agora.
      </Typography>
    );
  if (!sessions.length)
    return (
      <Box sx={{ px: 1, py: 3, textAlign: "center", color: muted }}>
        <MessageSquare size={22} style={{ opacity: 0.5 }} aria-hidden="true" />
        <Typography
          variant="body2"
          sx={{ color: muted, mt: 1, lineHeight: 1.5 }}
        >
          Ainda não temos conversa nenhuma. Manda a primeira foto que eu começo
          a anotar.
        </Typography>
      </Box>
    );
  return (
    <Box
      component="nav"
      aria-label="Conversas"
      sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
    >
      {groupSessions(sessions).map((g) => (
        <React.Fragment key={g.label}>
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: muted,
              px: 1,
              pt: 1.25,
              pb: 0.5,
            }}
          >
            {g.label}
          </Typography>
          {g.items.map((s) => {
            const current = s.id === currentSessionId;
            return (
              <Box
                key={s.id}
                component="button"
                type="button"
                onClick={() => onSelect(s.id)}
                aria-current={current ? "page" : undefined}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  width: "100%",
                  p: 1.25,
                  border: 0,
                  borderRadius: "12px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  bgcolor: current
                    ? dark
                      ? "#1B2E22"
                      : "surface.muted"
                    : "transparent",
                  color: dark
                    ? current
                      ? "#EEF2E8"
                      : "#B7C2B4"
                    : "text.primary",
                  "&:hover": { bgcolor: dark ? "#14251B" : "action.hover" },
                }}
              >
                <Box
                  component="span"
                  aria-hidden="true"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    flexShrink: 0,
                    bgcolor: current ? "#C8F169" : dark ? "#3A5243" : "divider",
                  }}
                />
                <Box component="span" sx={{ minWidth: 0, flex: 1 }}>
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: current ? 600 : 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.title}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </React.Fragment>
      ))}
    </Box>
  );
}
