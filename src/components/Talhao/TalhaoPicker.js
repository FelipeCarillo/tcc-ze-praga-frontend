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
 */
export default function TalhaoPicker({ disabled = false, sx }) {
  const { talhoes, loading, active, choose } = useTalhoes();

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
          <MapPin size={15} aria-hidden="true" />
          <Typography
            component="span"
            sx={{ fontSize: "0.875rem", fontWeight: 700 }}
            noWrap
          >
            {value === NONE
              ? "Sem talhão"
              : talhoes.find((t) => t.id === value)?.nome || "Talhão"}
          </Typography>
        </Box>
      )}
      sx={{
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
