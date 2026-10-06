import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, InputBase, Typography } from "@mui/material";
import { AlertTriangle, ArrowRight, Check } from "lucide-react";
import { checkImageFile } from "../../utils/frameChecks";
import { IMAGE_ACCEPT, validateImage } from "../../utils/imageUpload";

const CHECKS = [
  { key: "luz", ok: "Luz boa", nok: "Luz fraca ou forte demais" },
  { key: "foco", ok: "Em foco", nok: "Foto tremida" },
  { key: "folha", ok: "Folha na mira", nok: "Folha pequena na foto" },
];

/**
 * Foto da galeria antes da análise — m-Chat-Foto do canvas.
 *
 * A foto ocupa a tela, com as mesmas checagens da câmera (calculadas na
 * imagem de verdade), um campo opcional para contar algo e os botões
 * Trocar / Analisar folha. A foto da câmera não passa por aqui: lá as
 * checagens já rodaram ao vivo e ela vai direto para a análise.
 */
export default function PhotoConfirm({ file, onCancel, onReplace, onAnalyze }) {
  const [url, setUrl] = useState("");
  const [checks, setChecks] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef(null);

  useEffect(() => {
    if (!file) return undefined;
    const u = URL.createObjectURL(file);
    setUrl(u);
    setChecks(null);
    let alive = true;
    checkImageFile(file).then((c) => alive && setChecks(c));
    return () => {
      alive = false;
      URL.revokeObjectURL(u);
    };
  }, [file]);

  const analyze = async () => {
    setBusy(true);
    setError("");
    try {
      const ok = await onAnalyze(note.trim(), file);
      if (ok === false) setError("A análise não foi concluída. Sua foto e o texto foram mantidos para tentar de novo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        "@keyframes zpIn": { from: { opacity: 0, transform: "translateY(16px) scale(.97)" }, to: { opacity: 1, transform: "none" } },
        "@keyframes zpCheck": { from: { opacity: 0, transform: "translateX(-8px)" }, to: { opacity: 1, transform: "none" } },
        "@media (prefers-reduced-motion: reduce)": { "& *": { animation: "none !important" } },
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, p: 2, display: "flex", flexDirection: "column", gap: 1.5, maxWidth: 760, width: "100%", mx: "auto", boxSizing: "border-box" }}>
        <Box sx={{ position: "relative", flex: 1, minHeight: 220, borderRadius: "24px", overflow: "hidden", bgcolor: "#0B1510", animation: "zpIn .5s cubic-bezier(.2,.7,.2,1) both" }}>
          {url && (
            <Box component="img" src={url} alt="Foto escolhida para análise" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          )}
          <Box role="status" aria-live="polite" sx={{ position: "absolute", left: 12, right: 12, bottom: 12, display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {checks &&
              CHECKS.map((c, i) => {
                const ok = checks[c.key];
                return (
                  <Box
                    key={c.key}
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                      bgcolor: "rgba(11,21,16,.8)",
                      color: "#FFFFFF",
                      borderRadius: 999,
                      px: 1.5,
                      py: 0.85,
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      animation: `zpCheck .4s ${0.2 + i * 0.3}s both`,
                    }}
                  >
                    {ok ? <Check size={14} color="#C8F169" strokeWidth={3} aria-hidden="true" /> : <AlertTriangle size={14} color="#FBD38D" aria-hidden="true" />}
                    {ok ? c.ok : c.nok}
                  </Box>
                );
              })}
          </Box>
        </Box>
        <Typography component="label" htmlFor="nota-foto" sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "text.secondary" }}>
          Quer contar algo? (opcional)
        </Typography>
        <InputBase
          id="nota-foto"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex.: começou nas folhas de baixo"
          inputProps={{ maxLength: 500 }}
          sx={{ height: 48, px: 1.75, border: "1.5px solid", borderColor: "divider", borderRadius: "14px", bgcolor: "background.paper", fontSize: "1rem" }}
        />
        {error && <Alert severity="error">{error}</Alert>}
      </Box>

      <Box sx={{ bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider", px: 2, pt: 1.5, pb: "max(20px, env(safe-area-inset-bottom))" }}>
        <Box sx={{ maxWidth: 760, mx: "auto", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)", gap: 1.25 }}>
          <Box
            component="button"
            type="button"
            disabled={busy}
            onClick={() => (onReplace ? input.current?.click() : onCancel())}
            sx={{ height: 56, borderRadius: "16px", border: "1.5px solid", borderColor: "primary.main", bgcolor: "transparent", color: "primary.main", fontFamily: "inherit", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
          >
            Trocar
          </Box>
          <Box
            component="button"
            type="button"
            disabled={busy}
            onClick={analyze}
            sx={{ height: 56, borderRadius: "16px", border: 0, bgcolor: "cta.main", color: "cta.contrastText", fontFamily: "inherit", fontWeight: 800, fontSize: "1.0625rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 1, cursor: "pointer", "&:hover": { bgcolor: "cta.hover" }, "&:disabled": { opacity: 0.6 } }}
          >
            Analisar folha
            <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
          </Box>
        </Box>
        <input
          ref={input}
          type="file"
          accept={IMAGE_ACCEPT}
          hidden
          onChange={(e) => {
            const next = e.target.files?.[0];
            e.target.value = "";
            if (!next) return;
            const issue = validateImage(next);
            if (issue) setError(issue);
            else onReplace(next);
          }}
        />
      </Box>
    </Box>
  );
}
