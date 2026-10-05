import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { copy } from "../../copy/ze";

/**
 * "O Zé está escrevendo" — balão do Zé com três pontos, como no m-Chat.
 * Aparece só até o primeiro passo ou token; depois os passos do agente
 * (StepsList) mostram o progresso. Sem porcentagem: o transporte não tem.
 */
export default function TypingIndicator({ toolCall = null }) {
  const label = toolCall
    ? copy.chat.tools[toolCall] || copy.chat.tools._fallback
    : "O Zé está olhando…";
  const dot = (delay) => ({
    width: 7,
    height: 7,
    borderRadius: "50%",
    bgcolor: "text.secondary",
    animation: `zpDot 1.2s ${delay}s infinite`,
  });
  return (
    <Box
      role="status"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        my: 1,
        px: 1.75,
        py: 1.25,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "20px 20px 20px 6px",
        "@keyframes zpDot": {
          "0%,80%,100%": { opacity: 0.25, transform: "translateY(0)" },
          "40%": { opacity: 1, transform: "translateY(-4px)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "& *": { animation: "none !important" },
        },
      }}
    >
      <Box sx={{ display: "flex", gap: 0.5 }} aria-hidden="true">
        <Box sx={dot(0)} />
        <Box sx={dot(0.15)} />
        <Box sx={dot(0.3)} />
      </Box>
      <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
        {label}
      </Typography>
    </Box>
  );
}
