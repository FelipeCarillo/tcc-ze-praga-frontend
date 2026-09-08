import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { analyzeImage } from "../../services/inferenceService";
import { IMAGE_ACCEPT, validateImage } from "../../utils/imageUpload";
import { useFeatures } from "../../contexts/FeaturesContext";
import { defaultModelId } from "../../data/diagnosisModels";
import { IS_DEMO } from "../../config/runtime";
export default function TryItPanel() {
  const input = useRef(null),
    features = useFeatures();
  const [file, setFile] = useState(null),
    [preview, setPreview] = useState(""),
    [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <Box
      sx={{
        p: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 4,
      }}
    >
      <Typography mb={2}>
        {IS_DEMO
          ? "Teste local com resposta simulada."
          : "Este envio consome uma análise da sua cota."}
      </Typography>
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
          setError(issue);
          if (!issue) {
            setFile(next);
            setResult(null);
          }
        }}
      />
      {file && (
        <Box
          component="img"
          src={preview}
          alt="Foto selecionada para o teste da API"
          sx={{ height: 160, maxWidth: "100%", objectFit: "contain", mb: 2 }}
        />
      )}
      <Stack direction="row" gap={1} flexWrap="wrap">
        <Button
          variant="outlined"
          disabled={loading}
          onClick={() => input.current.click()}
        >
          {file ? "Trocar foto" : "Escolher foto"}
        </Button>
        <Button
          variant="contained"
          disabled={!file || loading}
          onClick={async () => {
            setLoading(true);
            setError("");
            try {
              setResult(await analyzeImage(file, defaultModelId(features)));
            } catch {
              setError(
                "Não foi possível executar a análise. Confira a API e sua cota.",
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Executando…" : "Executar análise"}
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {result && (
        <Box
          component="pre"
          aria-label="Resposta da análise"
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "background.default",
            borderRadius: 2,
            overflow: "auto",
            maxHeight: 380,
            fontSize: ".8rem",
          }}
        >
          {JSON.stringify(
            {
              ...result,
              imageUrl: result.imageUrl ? "[imagem disponível]" : null,
            },
            null,
            2,
          )}
        </Box>
      )}
    </Box>
  );
}
