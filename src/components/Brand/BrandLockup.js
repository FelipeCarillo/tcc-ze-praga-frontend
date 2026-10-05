import React from "react";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import { ReactComponent as Marca } from "../../assets/brand/marca.svg";

/**
 * Marca do rebrand 2026: símbolo (mira com folha) + "ZÉ PRAGA" em Archivo
 * Expanded 800, como no canvas de design. `tone="light"` para fundo escuro
 * (foto da lavoura, painel noite).
 */
export default function BrandLockup({
  size = 32,
  tone = "default",
  to = "/",
  sx,
}) {
  return (
    <Box
      component={to ? Link : "span"}
      to={to || undefined}
      aria-label={to ? "Zé Praga — início" : undefined}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        textDecoration: "none",
        flexShrink: 0,
        color: tone === "light" ? "#FFFFFF" : "text.primary",
        ...sx,
      }}
    >
      <Marca
        style={{ width: size, height: size, display: "block", flexShrink: 0 }}
        aria-hidden="true"
      />
      <Box
        component="span"
        sx={{
          fontFamily: (t) => t.typography.fontFamilyDisplay,
          fontWeight: 800,
          fontStretch: "120%",
          fontSize: size * 0.53,
          letterSpacing: "0.01em",
          whiteSpace: "nowrap",
          textShadow: tone === "light" ? "0 1px 8px rgba(0,0,0,.4)" : "none",
        }}
      >
        ZÉ PRAGA
      </Box>
    </Box>
  );
}
