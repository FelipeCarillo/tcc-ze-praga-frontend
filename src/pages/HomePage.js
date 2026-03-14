import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/material/Box';
import SaveIcon from '@mui/icons-material/Save';
import UploadArea from '../components/Diagnosis/UploadArea';
import DiagnosisResult from '../components/Diagnosis/DiagnosisResult';
import useDiagnosis from '../hooks/useDiagnosis';
import { saveDiagnosis } from '../services/historyService';

function HomePage() {
  const {
    imagePreview,
    result,
    isAnalyzing,
    error,
    selectImage,
    analyze,
    reset,
  } = useDiagnosis();

  const [saved, setSaved] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleSave = async () => {
    if (!result) return;
    try {
      await saveDiagnosis(result);
      setSaved(true);
      setSnackbar({ open: true, message: 'Diagnostico salvo no historico!' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao salvar diagnostico.' });
    }
  };

  const handleReset = () => {
    reset();
    setSaved(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Diagnostico Fitossanitario
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Envie uma foto da folha de soja para identificar pragas e doencas.
        O modelo de inteligencia artificial ira analisar a imagem e fornecer
        um diagnostico com plano de acao.
      </Typography>

      <UploadArea
        imagePreview={imagePreview}
        isAnalyzing={isAnalyzing}
        onImageSelect={selectImage}
        onAnalyze={analyze}
        onReset={handleReset}
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <>
          <DiagnosisResult result={result} />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saved}
            >
              {saved ? 'Salvo!' : 'Salvar no Historico'}
            </Button>
            <Button variant="outlined" onClick={handleReset}>
              Nova Analise
            </Button>
          </Box>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Container>
  );
}

export default HomePage;
