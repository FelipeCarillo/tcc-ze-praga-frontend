import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
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
          borderColor: 'grey.300',
          borderRadius: 2,
          bgcolor: 'grey.50',
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
          startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          onClick={onAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analisando...' : 'Analisar Imagem'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
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
          O modelo esta analisando a imagem. Isso pode levar alguns segundos...
        </Typography>
      )}
    </Box>
  );
}

export default UploadArea;
