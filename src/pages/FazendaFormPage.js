import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Box, MenuItem, Select, Typography } from "@mui/material";
import { ChevronLeft } from "lucide-react";
import FormField from "../components/Fazenda/FormField";
import { createFazenda, listFazendas, updateFazenda } from "../services/fazendasService";
import { setActiveFazendaId } from "../services/activeFazenda";
import lavoura from "../assets/field/produtor.jpg";

const UFS = "AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO".split(" ");
const vazio = { nome: "", municipio: "", uf: "", hectares: "", agronomoNome: "", agronomoCrea: "" };

/**
 * Cadastrar / editar fazenda — m-Fazenda-Nova do canvas (TCC-096): foto no
 * topo, nome, município e UF, área total e o agrônomo responsável (que vai
 * para o campo de revisão técnica do relatório).
 */
export default function FazendaFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(vazio);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(!id);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    listFazendas()
      .then((list) => {
        const f = list.find((x) => x.id === id);
        if (!alive) return;
        if (!f) setError("Fazenda não encontrada.");
        else
          setForm({
            nome: f.nome || "",
            municipio: f.municipio || "",
            uf: f.uf || "",
            hectares: f.hectares ?? "",
            agronomoNome: f.agronomoNome || "",
            agronomoCrea: f.agronomoCrea || "",
          });
      })
      .catch(() => alive && setError("Não foi possível carregar a fazenda."))
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const voltar = id ? `/fazendas/${id}` : "/fazendas";

  const save = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setError("Dê um nome à fazenda.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const saved = id ? await updateFazenda(id, form) : await createFazenda(form);
      setActiveFazendaId(saved.id);
      navigate(`/fazendas/${saved.id}`, { replace: true });
    } catch {
      setError("Não foi possível salvar a fazenda. Confira os dados e tente de novo.");
      setBusy(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={save}
      sx={{
        maxWidth: 720,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        minHeight: { xs: "100dvh", md: "auto" },
        "@keyframes zpKen": { from: { transform: "scale(1.05)" }, to: { transform: "scale(1.14) translate(-2%, 1%)" } },
        "@keyframes zpUp": { from: { opacity: 0, transform: "translateY(14px)" }, to: { opacity: 1, transform: "none" } },
        "@media (prefers-reduced-motion: reduce)": { "& *": { animation: "none !important" } },
      }}
    >
      <Box sx={{ position: "relative", height: { xs: 170, md: 220 }, overflow: "hidden", bgcolor: "#0B1510", color: "#FFFFFF", borderRadius: { md: "0 0 24px 24px" } }}>
        <Box component="img" src={lavoura} alt="Lavoura de soja" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", animation: "zpKen 16s ease-in-out infinite alternate" }} />
        <Box aria-hidden="true" sx={{ position: "absolute", inset: 0, bgcolor: "rgba(11,21,16,.6)" }} />
        <Box component={Link} to={voltar} aria-label="Voltar" sx={{ position: "absolute", left: 12, top: 12, width: 44, height: 44, borderRadius: "50%", bgcolor: "rgba(11,21,16,.6)", display: "grid", placeItems: "center", color: "#FFFFFF" }}>
          <ChevronLeft size={22} />
        </Box>
        <Box sx={{ position: "absolute", left: 20, right: 20, bottom: 18 }}>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: "0.75rem", fontWeight: 600, letterSpacing: ".06em", color: "#C8F169" }}>
            {id ? "EDITAR FAZENDA" : "NOVA FAZENDA"}
          </Typography>
          <Typography component="h1" sx={{ m: 0, mt: 0.5, color: "#FFFFFF", fontSize: { xs: "1.75rem", md: "2.25rem" }, fontWeight: 800, fontStretch: "112%", letterSpacing: "-0.02em", lineHeight: 1.02 }}>
            {id ? form.nome || "Sua fazenda" : "Onde fica sua lavoura?"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, px: { xs: 2.5, md: 4 }, pt: 2.25, pb: 2, display: "flex", flexDirection: "column", gap: 1.5, animation: "zpUp .5s cubic-bezier(.2,.7,.2,1) both", opacity: ready ? 1 : 0.5 }}>
        <FormField label="Nome da fazenda" name="f-nome" value={form.nome} onChange={set("nome")} required autoFocus={!id} inputProps={{ maxLength: 120 }} placeholder="Fazenda Boa Vista" />
        <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 96px", gap: 1.25 }}>
          <FormField label="Município" name="f-mun" value={form.municipio} onChange={set("municipio")} inputProps={{ maxLength: 120 }} placeholder="Rio Verde" />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Box component="label" id="rotulo-uf" htmlFor="campo-f-uf" sx={{ fontSize: "0.8125rem", fontWeight: 700 }}>UF</Box>
            <Select
              id="campo-f-uf"
              value={form.uf}
              onChange={set("uf")}
              displayEmpty
              inputProps={{ "aria-labelledby": "rotulo-uf" }}
              sx={{ height: 48, borderRadius: "12px", bgcolor: "background.paper" }}
            >
              <MenuItem value="">—</MenuItem>
              {UFS.map((u) => (
                <MenuItem key={u} value={u}>{u}</MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
        <FormField label="Área total (ha)" hint="opcional" name="f-area" value={form.hectares} onChange={set("hectares")} inputProps={{ inputMode: "decimal", type: "number", min: 0, step: "0.01" }} placeholder="Ex.: 200" />

        <Box sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: "16px", p: 1.75, display: "flex", flexDirection: "column", gap: 1.25 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "0.9375rem" }}>
              Agrônomo responsável{" "}
              <Box component="span" sx={{ fontWeight: 500, color: "text.secondary", fontSize: "0.8125rem" }}>· opcional</Box>
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>Aparece no relatório, no campo de revisão técnica.</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 1 }}>
            <FormField label="Nome" name="f-agro" value={form.agronomoNome} onChange={set("agronomoNome")} inputProps={{ maxLength: 120 }} />
            <FormField label="CREA" name="f-crea" value={form.agronomoCrea} onChange={set("agronomoCrea")} inputProps={{ maxLength: 40 }} />
          </Box>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
      </Box>

      <Box sx={{ position: { xs: "sticky", md: "static" }, bottom: 0, bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider", px: { xs: 2.5, md: 4 }, pt: 1.5, pb: "max(20px, env(safe-area-inset-bottom))", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)", gap: 1.25 }}>
        <Box component={Link} to={voltar} sx={{ height: 56, borderRadius: "16px", border: "1.5px solid", borderColor: "text.primary", color: "text.primary", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem", textDecoration: "none" }}>
          Cancelar
        </Box>
        <Box component="button" type="submit" disabled={busy || !ready} sx={{ height: 56, borderRadius: "16px", border: 0, bgcolor: "cta.main", color: "cta.contrastText", fontFamily: "inherit", fontWeight: 800, fontSize: "1.0625rem", cursor: "pointer", "&:hover": { bgcolor: "cta.hover" }, "&:disabled": { opacity: 0.6 } }}>
          {busy ? "Salvando…" : "Salvar fazenda"}
        </Box>
      </Box>
    </Box>
  );
}
