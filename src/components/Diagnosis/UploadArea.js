import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { Trash2, Search } from 'lucide-react';
import ImageDropzone from '../common/ImageDropzone';

function UploadArea({ imagePreview, isAnalyzing, onImageSelect, onAnalyze, onReset }) {
  if (!imagePreview) {
    return <ImageDropzone onImageSelect={onImageSelect} />;
  }

  return (
    <Box>
      <Box
        sx={{
          textAlign: 'center',
          mb: 2,
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'surface.sunken',
        }}
      >
        <Box
          component="img"
          src={imagePreview}
          alt="Imagem selecionada"
          sx={{
            maxWidth: '100%',
            maxHeight: 350,
            objectFit: 'contain',
            borderRadius: 1,
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <Search size={18} />}
          onClick={onAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Análise em andamento…' : 'Analisar esta folha'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Trash2 size={18} />}
          onClick={onReset}
          disabled={isAnalyzing}
        >
          Remover
        </Button>
      </Box>
      {isAnalyzing && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', mt: 2 }}
        >
          O serviço está processando a imagem. Esta tela não estima porcentagem nem tempo restante.
        </Typography>
      )}
    </Box>
  );
}

export default UploadArea;
