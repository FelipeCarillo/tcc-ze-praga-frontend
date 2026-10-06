import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import {
  ArrowRight,
  Check,
  ImageIcon,
  RotateCcw,
  X,
  Zap,
  ZapOff,
} from "lucide-react";
import TalhaoPicker from "../components/Talhao/TalhaoPicker";
import { IMAGE_ACCEPT } from "../utils/imageUpload";

/**
 * Câmera do Zé — m-Camera do canvas: imagem ao vivo da câmera traseira, mira
 * com varredura, checagens de captura, talhão da análise, flash, galeria e
 * obturador.
 *
 * As checagens são calculadas de verdade sobre a região da mira, a cada
 * ~500 ms, num canvas pequeno: brilho médio (luz), variação de bordas
 * (foco) e proporção de pixels verdes (folha na mira). A identificação da
 * planta como soja continua sendo do servidor (inspect_image) — por isso a
 * terceira checagem fala em "folha na mira", não em "folha de soja".
 *
 * Uma foto por vez: o chat envia uma imagem por mensagem.
 */

import { analyzeFrame, SAMPLE } from "../utils/frameChecks";

export { analyzeFrame };

const CHECKS = [
  { key: "luz", ok: "Luz boa", nok: brightnessHint },
  { key: "foco", ok: "Em foco", nok: () => "Segure firme" },
  { key: "folha", ok: "Folha na mira", nok: () => "Centralize a folha" },
];
function brightnessHint() {
  return "Ajuste a luz";
}

function Corner({ pos }) {
  const v = pos.includes("t") ? { top: 0 } : { bottom: 0 };
  const h = pos.includes("l") ? { left: 0 } : { right: 0 };
  const line = "4px solid #C8F169";
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "absolute",
        ...v,
        ...h,
        width: 44,
        height: 44,
        borderTop: pos.includes("t") ? line : "none",
        borderBottom: pos.includes("b") ? line : "none",
        borderLeft: pos.includes("l") ? line : "none",
        borderRight: pos.includes("r") ? line : "none",
        borderRadius:
          pos === "tl"
            ? "14px 0 0 0"
            : pos === "tr"
              ? "0 14px 0 0"
              : pos === "bl"
                ? "0 0 0 14px"
                : "0 0 14px 0",
      }}
    />
  );
}

const roundBtn = {
  width: 48,
  height: 48,
  border: 0,
  borderRadius: "50%",
  bgcolor: "rgba(11,21,16,.6)",
  color: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

export default function CameraPage() {
  const navigate = useNavigate();
  const video = useRef(null);
  const canvas = useRef(null);
  const stream = useRef(null);
  const gallery = useRef(null);
  const systemCamera = useRef(null);
  const [status, setStatus] = useState("starting"); // starting | live | denied | unsupported
  const [checks, setChecks] = useState({
    luz: false,
    foco: false,
    folha: false,
  });
  const [torch, setTorch] = useState({ supported: false, on: false });
  const [photo, setPhoto] = useState(null); // { file, url }

  const stop = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);

  useEffect(() => {
    let alive = true;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return undefined;
    }
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } },
        audio: false,
      })
      .then((s) => {
        if (!alive) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream.current = s;
        if (video.current) video.current.srcObject = s;
        const track = s.getVideoTracks()[0];
        const caps = track?.getCapabilities?.() || {};
        setTorch({ supported: Boolean(caps.torch), on: false });
        setStatus("live");
      })
      .catch(() => alive && setStatus("denied"));
    return () => {
      alive = false;
      stop();
    };
  }, [stop]);

  // Checagens ao vivo sobre a região da mira.
  useEffect(() => {
    if (status !== "live" || photo) return undefined;
    const id = setInterval(() => {
      const v = video.current;
      const c = canvas.current;
      if (!v || !c || !v.videoWidth) return;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      const side = Math.min(v.videoWidth, v.videoHeight) * 0.7;
      const sx = (v.videoWidth - side) / 2;
      const sy = (v.videoHeight - side) / 2;
      ctx.drawImage(v, sx, sy, side, side, 0, 0, SAMPLE, SAMPLE);
      setChecks(analyzeFrame(ctx.getImageData(0, 0, SAMPLE, SAMPLE).data));
    }, 500);
    return () => clearInterval(id);
  }, [status, photo]);

  const toggleTorch = async () => {
    const track = stream.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch.on }] });
      setTorch((t) => ({ ...t, on: !t.on }));
    } catch {
      setTorch({ supported: false, on: false });
    }
  };

  const setFile = (file) => {
    if (!file) return;
    setPhoto((old) => {
      if (old) URL.revokeObjectURL(old.url);
      return { file, url: URL.createObjectURL(file) };
    });
  };

  const shoot = () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    c.toBlob(
      (blob) =>
        blob &&
        setFile(
          new File([blob], `folha-${Date.now()}.jpg`, { type: "image/jpeg" }),
        ),
      "image/jpeg",
      0.92,
    );
  };

  const pickFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    setFile(file);
  };

  const analyze = () => {
    if (!photo) return;
    stop();
    // A câmera já conferiu luz, foco e folha: a foto vai direto para a análise.
    navigate("/chat", { state: { pendingFile: photo.file, source: "camera" } });
  };

  useEffect(() => () => photo && URL.revokeObjectURL(photo.url), [photo]);

  const live = status === "live";

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "#0B1510",
        color: "#EEF2E8",
        overflow: "hidden",
        "@keyframes zpScan": {
          "0%": { top: "3%" },
          "50%": { top: "95%" },
          "100%": { top: "3%" },
        },
        "@keyframes zpBreath": {
          "0%,100%": { transform: "translate(-50%, -50%) scale(1)" },
          "50%": { transform: "translate(-50%, -50%) scale(1.025)" },
        },
        "@keyframes zpCheck": {
          from: { opacity: 0, transform: "translateX(-10px)" },
          to: { opacity: 1, transform: "none" },
        },
        "@keyframes zpRing": {
          "0%": { boxShadow: "0 0 0 0 rgba(200,241,105,.8)" },
          "70%": { boxShadow: "0 0 0 18px rgba(200,241,105,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(200,241,105,0)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "& *": { animation: "none !important" },
        },
      }}
    >
      <input
        ref={gallery}
        type="file"
        accept={IMAGE_ACCEPT}
        hidden
        onChange={pickFile}
      />
      <input
        ref={systemCamera}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={pickFile}
      />
      <canvas ref={canvas} width={SAMPLE} height={SAMPLE} hidden />

      {/* Imagem ao vivo (ou a foto tirada, para conferir). */}
      <Box
        component="video"
        ref={video}
        autoPlay
        playsInline
        muted
        aria-label="Imagem ao vivo da câmera"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: photo ? "none" : "block",
        }}
      />
      {photo && (
        <Box
          component="img"
          src={photo.url}
          alt="Foto tirada"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(11,21,16,0.35)",
          pointerEvents: "none",
        }}
      />

      {/* Topo: fechar, talhão, flash. */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          p: 1.75,
          pt: "calc(14px + env(safe-area-inset-top))",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          zIndex: 2,
        }}
      >
        <Box
          component="button"
          type="button"
          aria-label="Fechar câmera"
          onClick={() => navigate(-1)}
          sx={roundBtn}
        >
          <X size={22} strokeWidth={2.2} />
        </Box>
        <TalhaoPicker
          sx={{
            bgcolor: "rgba(11,21,16,.7)",
            color: "#FFFFFF",
            "& .MuiSvgIcon-root": { color: "#FFFFFF" },
            "& fieldset": { border: 0 },
          }}
        />
        {torch.supported ? (
          <Box
            component="button"
            type="button"
            aria-label={torch.on ? "Desligar flash" : "Ligar flash"}
            aria-pressed={torch.on}
            onClick={toggleTorch}
            sx={roundBtn}
          >
            {torch.on ? (
              <Zap size={20} fill="#C8F169" color="#C8F169" />
            ) : (
              <ZapOff size={20} />
            )}
          </Box>
        ) : (
          <Box sx={{ width: 48 }} />
        )}
      </Box>

      {!photo && live && (
        <>
          <Typography
            sx={{
              position: "absolute",
              left: 20,
              right: 20,
              top: 100,
              textAlign: "center",
              fontWeight: 700,
              fontSize: "1rem",
              textShadow: "0 1px 10px rgba(0,0,0,.6)",
              zIndex: 1,
            }}
          >
            Aproxime até uma folha preencher a mira
          </Typography>
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              left: "50%",
              top: "calc(50% - 60px)",
              width: "min(300px, 76vw)",
              height: "min(360px, 46vh)",
              transform: "translate(-50%, -50%)",
              animation: "zpBreath 2.6s ease-in-out infinite",
            }}
          >
            {["tl", "tr", "bl", "br"].map((p) => (
              <Corner key={p} pos={p} />
            ))}
            <Box
              sx={{
                position: "absolute",
                left: 8,
                right: 8,
                height: 2,
                bgcolor: "#C8F169",
                boxShadow: "0 0 16px 3px rgba(200,241,105,.85)",
                animation: "zpScan 2.6s ease-in-out infinite",
              }}
            />
          </Box>
          <Box
            role="status"
            aria-live="polite"
            sx={{
              position: "absolute",
              left: 20,
              right: 20,
              bottom: 236,
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              zIndex: 1,
            }}
          >
            {CHECKS.map((c, i) => {
              const ok = checks[c.key];
              return (
                <Box
                  key={c.key}
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    bgcolor: "rgba(11,21,16,.75)",
                    borderRadius: 999,
                    px: 1.5,
                    py: 0.875,
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    color: ok ? "#EEF2E8" : "#B7C2B4",
                    animation: `zpCheck .5s ${0.6 + i * 0.6}s both`,
                  }}
                >
                  {ok ? (
                    <Check size={14} color="#C8F169" strokeWidth={3} />
                  ) : (
                    <Box
                      component="span"
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        border: "2px solid #B7C2B4",
                      }}
                    />
                  )}
                  {ok ? c.ok : c.nok()}
                </Box>
              );
            })}
          </Box>
        </>
      )}

      {(status === "denied" || status === "unsupported") && !photo && (
        <Box
          sx={{
            position: "absolute",
            left: 24,
            right: 24,
            top: "30%",
            textAlign: "center",
            zIndex: 1,
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", mb: 1 }}>
            {status === "denied"
              ? "Sem acesso à câmera"
              : "Câmera indisponível neste navegador"}
          </Typography>
          <Typography sx={{ color: "#B7C2B4", mb: 2.5 }}>
            {status === "denied"
              ? "Libere a câmera nas permissões do navegador, ou use a câmera do aparelho."
              : "Use a câmera do aparelho ou escolha uma foto da galeria."}
          </Typography>
          <Box
            component="button"
            type="button"
            onClick={() => systemCamera.current?.click()}
            sx={{
              border: 0,
              borderRadius: "16px",
              bgcolor: "#C8F169",
              color: "#0F1A13",
              fontFamily: "inherit",
              fontWeight: 800,
              px: 3,
              height: 52,
              cursor: "pointer",
            }}
          >
            Abrir câmera do aparelho
          </Box>
        </Box>
      )}

      {/* Folha de baixo: bandeja, galeria, obturador e Analisar. */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: "#0B1510",
          borderRadius: "28px 28px 0 0",
          px: 3,
          pt: 2.25,
          pb: "calc(28px + env(safe-area-inset-bottom))",
          display: "flex",
          flexDirection: "column",
          gap: 2.25,
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: 520,
            width: "100%",
            mx: "auto",
          }}
        >
          <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
            {photo ? (
              <Box
                component="img"
                src={photo.url}
                alt="Foto capturada"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  objectFit: "cover",
                  border: "2px solid #C8F169",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  border: "1.5px dashed #4A5A4F",
                }}
              />
            )}
          </Box>
          <Typography
            sx={{
              fontFamily: (t) => t.typography.fontFamilyMono,
              fontSize: "0.8125rem",
              color: "#B7C2B4",
            }}
          >
            {photo ? "Foto pronta · confira antes" : "1 foto por análise"}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            alignItems: "center",
            maxWidth: 520,
            width: "100%",
            mx: "auto",
          }}
        >
          {photo ? (
            <Box
              component="button"
              type="button"
              onClick={() => setPhoto(null)}
              sx={{
                justifySelf: "start",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                color: "#EEF2E8",
                fontSize: "0.75rem",
                fontWeight: 600,
                bgcolor: "transparent",
                border: 0,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "14px",
                  border: "2px solid #EEF2E8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RotateCcw size={22} />
              </Box>
              Refazer
            </Box>
          ) : (
            <Box
              component="button"
              type="button"
              onClick={() => gallery.current?.click()}
              sx={{
                justifySelf: "start",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                color: "#EEF2E8",
                fontSize: "0.75rem",
                fontWeight: 600,
                bgcolor: "transparent",
                border: 0,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "14px",
                  border: "2px solid #EEF2E8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ImageIcon size={22} />
              </Box>
              Galeria
            </Box>
          )}
          <Box
            component="button"
            type="button"
            aria-label="Tirar foto"
            onClick={live ? shoot : () => systemCamera.current?.click()}
            disabled={Boolean(photo)}
            sx={{
              justifySelf: "center",
              width: 84,
              height: 84,
              borderRadius: "50%",
              border: "4px solid #EEF2E8",
              bgcolor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              opacity: photo ? 0.4 : 1,
              animation: photo ? "none" : "zpRing 2s 2.2s infinite",
              p: 0,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 66,
                height: 66,
                borderRadius: "50%",
                bgcolor: "#C8F169",
              }}
            />
          </Box>
          <Box
            component="button"
            type="button"
            onClick={analyze}
            disabled={!photo}
            sx={{
              justifySelf: "end",
              height: 48,
              px: 2,
              borderRadius: "14px",
              border: 0,
              bgcolor: photo ? "#C8F169" : "#1B4D2E",
              color: photo ? "#0F1A13" : "#FFFFFF",
              fontWeight: 800,
              fontSize: "0.9375rem",
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              fontFamily: "inherit",
              cursor: photo ? "pointer" : "default",
              opacity: photo ? 1 : 0.6,
            }}
          >
            Analisar
            <ArrowRight size={16} strokeWidth={2.6} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
