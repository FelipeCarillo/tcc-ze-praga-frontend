import React, { useEffect, useState } from "react";
import { Alert, Box, Dialog, IconButton, MenuItem, Select, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Leaf, Warehouse, X } from "lucide-react";
import FormField from "./FormField";
import { ReactComponent as Marca } from "../../assets/brand/marca.svg";
import { createTalhao, updateTalhao } from "../../services/talhoesService";

const vazio = { nome: "", apelido: "", hectares: "", dataSemeadura: "" };

/**
 * Novo talhão — m-Talhao-Novo do canvas: folha que sobe de baixo no celular
 * (janela no desktop), com a fazenda escolhida, nome, apelido, área e data de
 * semeadura. Com `talhao`, edita (e pode mover de fazenda).
 */
export default function NovoTalhaoSheet({ open, fazendas, fazendaId, talhao, onClose, onSaved }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [form, setForm] = useState(vazio);
  const [fazenda, setFazenda] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setFazenda(talhao?.fazendaId || fazendaId || fazendas[0]?.id || "");
    setForm(
      talhao
        ? {
            nome: talhao.nome || "",
            apelido: talhao.apelido || "",
            hectares: talhao.hectares ?? "",
            dataSemeadura: talhao.dataSemeadura || "",
          }
        : vazio,
    );
  }, [open, talhao, fazendaId, fazendas]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setError("Dê um nome ao talhão.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = { ...form, nome: form.nome.trim(), fazendaId: fazenda || null };
      const saved = talhao ? await updateTalhao(talhao.id, data) : await createTalhao(data);
      onSaved?.(saved);
    } catch {
      setError("Não foi possível salvar o talhão. Confira os dados e tente de novo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !busy && onClose()}
      fullWidth
      maxWidth="xs"
      aria-labelledby="titulo-talhao"
      slotProps={{
        paper: {
          sx: mobile
            ? { position: "fixed", bottom: 0, m: 0, width: "100%", maxWidth: "100%", borderRadius: "28px 28px 0 0" }
            : { borderRadius: "24px" },
        },
      }}
    >
      <Box component="form" onSubmit={save} sx={{ px: 2.5, pt: 1.25, pb: 2.75, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box aria-hidden="true" sx={{ alignSelf: "center", width: 44, height: 5, borderRadius: 999, bgcolor: "divider", display: { sm: "none" } }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography id="titulo-talhao" component="h2" sx={{ m: 0, fontSize: "1.375rem", fontWeight: 800, fontStretch: "110%" }}>
            {talhao ? "Editar talhão" : "Novo talhão"}
          </Typography>
          <IconButton aria-label="Fechar" onClick={onClose} disabled={busy}>
            <X size={20} />
          </IconButton>
        </Box>

        {fazendas.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minHeight: 52, px: 1.5, border: "1.5px solid", borderColor: "divider", borderRadius: "12px" }}>
            <Box sx={{ color: "primary.main", display: "flex" }}>
              <Warehouse size={20} aria-hidden="true" />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography id="rotulo-fazenda" sx={{ fontSize: "0.75rem", fontWeight: 700, color: "text.secondary" }}>
                Fazenda
              </Typography>
              <Select
                variant="standard"
                disableUnderline
                value={fazenda}
                onChange={(e) => setFazenda(e.target.value)}
                inputProps={{ "aria-labelledby": "rotulo-fazenda" }}
                sx={{ fontWeight: 700, fontSize: "1rem", width: "100%", "& .MuiSelect-select": { py: 0 } }}
              >
                {fazendas.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.nome}
                    {f.municipio ? ` · ${[f.municipio, f.uf].filter(Boolean).join("/")}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            {fazendas.length > 1 && (
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "primary.main" }} aria-hidden="true">
                Trocar
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 1.25 }}>
          <FormField label="Nome" name="t-nome" value={form.nome} onChange={set("nome")} required autoFocus inputProps={{ maxLength: 120 }} placeholder="Talhão 9" />
          <FormField label="Apelido" name="t-apelido" value={form.apelido} onChange={set("apelido")} inputProps={{ maxLength: 120 }} placeholder="Rio" />
          <FormField label="Área (ha)" name="t-area" value={form.hectares} onChange={set("hectares")} inputProps={{ inputMode: "decimal", type: "number", min: 0, step: "0.01" }} placeholder="40" />
          <FormField label="Semeadura" name="t-sem" type="date" value={form.dataSemeadura} onChange={set("dataSemeadura")} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "0.875rem", flexWrap: "wrap" }}>
          <b>Cultura</b>
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, px: 1.5, py: 0.6, borderRadius: 999, bgcolor: "surface.muted", fontWeight: 700 }}>
            <Leaf size={14} aria-hidden="true" />
            Soja
          </Box>
          <Box component="span" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>por enquanto, só soja</Box>
        </Box>

        {!talhao && (
          <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start", bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(200,241,105,.08)" : "#EEF8D6"), borderRadius: "14px", p: 1.5, fontSize: "0.875rem", lineHeight: 1.4 }}>
            <Marca style={{ width: 36, height: 36, flexShrink: 0 }} aria-hidden="true" />
            <span>
              Também dá pra pedir ao Zé, na conversa: <b>“cria o talhão 9 do Rio, 40 hectares”</b>.
            </span>
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)", gap: 1.25, mt: 0.5 }}>
          <Box component="button" type="button" onClick={onClose} disabled={busy} sx={{ height: 56, borderRadius: "16px", border: "1.5px solid", borderColor: "text.primary", bgcolor: "transparent", color: "text.primary", fontFamily: "inherit", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
            Cancelar
          </Box>
          <Box component="button" type="submit" disabled={busy} sx={{ height: 56, borderRadius: "16px", border: 0, bgcolor: "cta.main", color: "cta.contrastText", fontFamily: "inherit", fontWeight: 800, fontSize: "1.0625rem", cursor: "pointer", "&:hover": { bgcolor: "cta.hover" }, "&:disabled": { opacity: 0.6 } }}>
            {busy ? "Salvando…" : "Salvar talhão"}
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
