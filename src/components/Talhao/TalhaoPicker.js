import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Divider,
  ListItemIcon,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { MapPin, Plus } from "lucide-react";
import useTalhoes from "../../hooks/useTalhoes";

const NONE = "__sem_talhao__";
const NEW = "__novo_talhao__";

/**
 * Escolha do talhão antes da foto (TCC-093) — o "Talhão 3 · Sede ▾" do design.
 * Cada laudo do chat nasce no talhão escolhido aqui. Sem talhão cadastrado,
 * vira um convite para cadastrar no Perfil.
 *
 * `variant="inline"`: sem contorno, com a bolinha verde — a linha de status
 * do cabeçalho da conversa no m-Chat ("● Talhão 3 · Sede").
 */
export default function TalhaoPicker({ disabled = false, sx, variant = "pill", busy = false }) {
  const { talhoes, loading, active, choose } = useTalhoes();
  const inline = variant === "inline";

  if (!loading && !talhoes.length && inline)
    return (
      <Box component={Link} to="/perfil" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, fontSize: "0.8125rem", color: "text.secondary", textDecoration: "none", ...sx }}>
        <Dot busy={busy} />
        Sem talhão · cadastrar
      </Box>
    );
  if (!loading && !talhoes.length)
    return (
      <Box
        component={Link}
        to="/perfil"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          minHeight: 36,
          px: 1.5,
          borderRadius: 999,
          border: "1px dashed",
          borderColor: "divider",
          color: "text.secondary",
          fontSize: "0.8125rem",
          fontWeight: 600,
          textDecoration: "none",
          ...sx,
        }}
      >
        <Plus size={15} aria-hidden="true" />
        Cadastrar talhão para organizar os laudos
      </Box>
    );

  return (
    <Select
      size="small"
      value={
        active?.id && talhoes.some((t) => t.id === active.id) ? active.id : NONE
      }
      disabled={disabled || loading}
      onChange={(e) => {
        if (e.target.value === NEW) return;
        choose(e.target.value === NONE ? null : e.target.value);
      }}
      inputProps={{ "aria-label": "Talhão desta análise" }}
      renderValue={(value) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {inline ? <Dot busy={busy} /> : <MapPin size={15} aria-hidden="true" />}
          <Typography
            component="span"
            sx={{ fontSize: inline ? "0.8125rem" : "0.875rem", fontWeight: inline ? 500 : 700, color: inline ? "text.secondary" : "inherit" }}
            noWrap
          >
            {value === NONE
              ? "Sem talhão"
              : talhoes.find((t) => t.id === value)?.nome || "Talhão"}
          </Typography>
        </Box>
      )}
      sx={inline ? {
        minHeight: 0,
        maxWidth: "100%",
        "& .MuiSelect-select": { p: "0 22px 0 0 !important", minHeight: "0 !important" },
        "& fieldset": { border: 0 },
        "& .MuiSvgIcon-root": { right: 0, fontSize: 18 },
        ...sx,
      } : {
        borderRadius: 999,
        minHeight: 36,
        maxWidth: 260,
        bgcolor: "background.paper",
        "& .MuiSelect-select": { py: 0.75, pl: 1.5 },
        ...sx,
      }}
    >
      {talhoes.map((t) => (
        <MenuItem key={t.id} value={t.id}>
          {t.nome}
          {t.apelido ? (
            <Typography
              component="span"
              color="text.secondary"
              sx={{ ml: 1, fontSize: "0.8125rem" }}
            >
              {t.apelido}
            </Typography>
          ) : null}
        </MenuItem>
      ))}
      <MenuItem value={NONE}>Sem talhão</MenuItem>
      <Divider />
      <MenuItem value={NEW} component={Link} to="/perfil">
        <ListItemIcon>
          <Plus size={16} />
        </ListItemIcon>
        Cadastrar talhão
      </MenuItem>
    </Select>
  );
}

/** Bolinha de status: verde parado, pulsando enquanto o Zé analisa. */
function Dot({ busy }) {
  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        flexShrink: 0,
        bgcolor: busy ? "warning.main" : "success.main",
        animation: "zpBlink 1.4s ease-in-out infinite",
        "@keyframes zpBlink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
        "@media (prefers-reduced-motion: reduce)": { animation: "none" },
      }}
    />
  );
}
