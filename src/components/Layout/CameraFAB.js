import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Fab from '@mui/material/Fab';
import { Camera } from 'lucide-react';

/**
 * FAB de câmera flutuante (mobile), centralizado acima da <BottomNav/>.
 * "Câmera é cidadã primária" (auditoria, seção 08): abre a câmera traseira
 * (capture="environment") e leva o arquivo pro /chat.
 */
function CameraFAB() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    navigate('/chat', file ? { state: { pendingFile: file } } : undefined);
    e.target.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleFile}
      />
      <Fab
        aria-label="Mandar foto"
        onClick={() => inputRef.current && inputRef.current.click()}
        sx={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 'calc(54px + env(safe-area-inset-bottom))',
          zIndex: (t) => t.zIndex.appBar + 1,
          bgcolor: 'secondary.main',
          color: '#FFFFFF',
          boxShadow: '0 6px 16px rgba(224,120,86,0.45)',
          '&:hover': { bgcolor: 'secondary.dark' },
        }}
      >
        <Camera size={24} />
      </Fab>
    </>
  );
}

export default CameraFAB;
