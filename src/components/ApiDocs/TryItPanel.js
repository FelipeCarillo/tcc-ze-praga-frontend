import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Play, Upload, X } from 'lucide-react';
import { analyzeImage } from '../../services/inferenceService';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

/**
 * Painel "Try it" FUNCIONAL (auditoria, seção 15): solta uma imagem → chama o
 * endpoint real de inferência (`POST /api/v1/inference` via inferenceService) →
 * mostra a resposta JSON inline. Em modo mock, usa a inferência simulada.
 */
function TryItPanel() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const pick = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setError(null);
    }
    e.target.value = '';
  };

  const run = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeImage(file, 'ensemble');
      setResult(res);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Falha ao classificar.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: (t) => t.palette.brand.noite3,
        backgroundColor: (t) => t.palette.brand.noite2,
        color: (t) => t.palette.brand.creme,
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.66rem', color: 'secondary.main', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>
          Try it · POST /classify {USE_MOCK && '· (mock)'}
        </Typography>
        <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '1.1rem', mb: 2 }}>
          Roda de verdade
        </Typography>

        <input ref={inputRef} type="file" accept="image/*" hidden onChange={pick} />

        {!preview ? (
          <Box
            onClick={() => inputRef.current?.click()}
            sx={{ border: '1px dashed', borderColor: (t) => t.palette.brand.noite3, borderRadius: 2.5, p: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: 'secondary.main' } }}
          >
            <Upload size={22} />
            <Typography sx={{ fontSize: '0.85rem', mt: 1, color: 'rgba(240,237,226,0.75)' }}>Solta uma foto da folha aqui</Typography>
            <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.62rem', color: 'rgba(240,237,226,0.45)', mt: 0.5 }}>JPG/PNG · &lt;10MB</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Box component="img" src={preview} alt="" sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'cover' }} />
            <Typography sx={{ flex: 1, fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.72rem', color: 'rgba(240,237,226,0.7)', wordBreak: 'break-all' }}>{file?.name}</Typography>
            <Button onClick={reset} size="small" startIcon={<X size={14} />} sx={{ color: 'rgba(240,237,226,0.7)' }}>Trocar</Button>
          </Box>
        )}

        <Button
          onClick={run}
          disabled={!file || loading}
          variant="contained"
          color="secondary"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Play size={16} />}
          sx={{ mt: 2, width: '100%' }}
        >
          {loading ? 'Rodando…' : 'Rodar agora'}
        </Button>
      </Box>

      {(result || error) && (
        <Box sx={{ borderTop: '1px solid', borderColor: (t) => t.palette.brand.noite3, p: 2.5, backgroundColor: (t) => t.palette.brand.noite }}>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.62rem', color: error ? 'error.light' : 'secondary.main', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
            {error ? 'Erro' : 'Response · 200'}
          </Typography>
          <Box component="pre" sx={{ m: 0, fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.72rem', color: (t) => t.palette.brand.folha, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 280, overflow: 'auto' }}>
            {error ? error : JSON.stringify(result, null, 2)}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default TryItPanel;
