import React from "react";
import { Link } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { copy } from "../../copy/ze";

/**
 * Rodapé do desktop — uma linha, como no canvas (d-Landing): o TCC, o aviso
 * de que o Zé é um auxiliar e os atalhos para o projeto.
 */
export default function Footer() {
  const link = {
    color: "text.secondary",
    textDecoration: "none",
    fontWeight: 600,
    "&:hover": { color: "text.primary" },
  };
  return (
    <Box component="footer" sx={{ borderTop: "1px solid", borderColor: "divider", px: 4, pt: 3.5, pb: 5 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        gap={2}
        flexWrap="wrap"
        sx={{ maxWidth: 1240, mx: "auto", fontSize: "0.875rem", color: "text.secondary", lineHeight: 1.5 }}
      >
        <span>TCC · Instituto Mauá de Tecnologia · 2026</span>
        <Box component="span" sx={{ maxWidth: 620 }}>
          {copy.notice.footer}
        </Box>
        <Stack direction="row" gap={2.5} component="nav" aria-label="Rodapé">
          <Box component={Link} to="/sobre" sx={link}>O projeto</Box>
          <Box component={Link} to="/modelos" sx={link}>Modelos</Box>
          <Box component={Link} to="/api-docs" sx={link}>API</Box>
        </Stack>
      </Stack>
    </Box>
  );
}
