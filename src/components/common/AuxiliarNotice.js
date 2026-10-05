import React from "react";
import Box from "@mui/material/Box";
import { Info } from "lucide-react";
import { copy } from "../../copy/ze";

/**
 * Aviso padrão de que o Zé é um auxiliar, não fonte da verdade (rebrand 2026).
 * Vai em toda resposta do agente, card de diagnóstico, laudo e histórico.
 * `compact` é a versão de uma linha para baixo de cada mensagem do chat.
 */
function AuxiliarNotice({ compact = false, sx }) {
  return (
    <Box
      role="note"
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        bgcolor: (t) =>
          t.palette.mode === "dark" ? "rgba(201,162,39,0.14)" : "#FBF1C9",
        color: (t) => (t.palette.mode === "dark" ? "#F3DE8A" : "#5A3E02"),
        borderRadius: compact ? "10px" : "12px",
        px: compact ? 1.25 : 1.5,
        py: compact ? 0.75 : 1.25,
        fontSize: compact ? "0.75rem" : "0.8125rem",
        lineHeight: 1.4,
        ...sx,
      }}
    >
      <Info
        size={compact ? 14 : 16}
        strokeWidth={2.4}
        style={{ flexShrink: 0, marginTop: 1 }}
        aria-hidden="true"
      />
      {compact ? (
        <span>{copy.notice.short}</span>
      ) : (
        <span>
          <strong>{copy.notice.title}</strong> {copy.notice.body}
        </span>
      )}
    </Box>
  );
}

export default AuxiliarNotice;
