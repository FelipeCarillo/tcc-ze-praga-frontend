import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

function ImagePreview({ imageUrl, onRemove }) {
  if (!imageUrl) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-block',
        mb: 1,
      }}
    >
      <Box
        component="img"
        src={imageUrl}
        alt="Preview"
        sx={{
          height: 80,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.300',
        }}
      />
      <IconButton
        size="small"
        onClick={onRemove}
        sx={{
          position: 'absolute',
          top: -8,
          right: -8,
          bgcolor: 'error.main',
          color: 'white',
          width: 22,
          height: 22,
          '&:hover': { bgcolor: 'error.dark' },
        }}
      >
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
}

export default ImagePreview;
