import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CloudUpload, Image } from 'lucide-react';

function ImageDropzone({ onImageSelect, disabled = false }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onImageSelect(acceptedFiles[0]);
      }
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: false,
    disabled,
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        borderRadius: 1,
        p: 5,
        textAlign: 'center',
        cursor: disabled ? 'default' : 'pointer',
        bgcolor: isDragActive ? 'action.selected' : 'background.paper',
        transition: 'border-color 0.2s ease, background-color 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        '&:hover': disabled
          ? {}
          : {
              borderColor: 'primary.light',
              bgcolor: 'action.selected',
            },
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <>
          <Image size={48} color="currentColor" style={{ marginBottom: 8 }} />
          <Typography variant="h6" color="primary">
            Solte a imagem aqui
          </Typography>
        </>
      ) : (
        <>
          <CloudUpload size={48} color="currentColor" style={{ marginBottom: 8, opacity: 0.65 }} />
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }}>
            Registre uma folha
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Arraste uma imagem ou clique para selecionar. JPG, PNG ou WEBP.
          </Typography>
        </>
      )}
    </Box>
  );
}

export default ImageDropzone;
