import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { copy } from "../../copy/ze";

/** Status indeterminado: o transporte não fornece porcentagem de progresso. */
export default function TypingIndicator({ toolCall = null }) {
  const label = toolCall ? copy.chat.tools[toolCall] || copy.chat.tools._fallback : "Análise em andamento…";
  return (
    <Box role="status" sx={{ display: "flex", alignItems: "center", gap: 1.25, my: 2, px: 2, py: 1.5, borderLeft: "3px solid", borderColor: "primary.main", bgcolor: "surface.sunken" }}>
      <CircularProgress size={18} thickness={5} aria-hidden="true" />
      <Box><Typography fontWeight={700} variant="body2">{label}</Typography><Typography variant="caption" color="text.secondary">A foto e a conversa permanecem disponíveis enquanto a resposta é preparada.</Typography></Box>
    </Box>
  );
}
