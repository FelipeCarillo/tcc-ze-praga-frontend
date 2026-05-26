import React, { useEffect, useRef, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';

const COUNT_KEY = 'ze-diag-count';
const DISMISS_KEY = 'ze-install-dismissed';

/**
 * Prompt de instalação PWA (auditoria, seção 08/21): aparece só depois de
 * 2 diagnósticos salvos com sucesso e quando o navegador disponibiliza o
 * `beforeinstallprompt`. Dispensável e silencioso depois disso.
 */
function InstallPrompt() {
  const deferred = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return undefined;

    const maybeShow = () => {
      const n = parseInt(localStorage.getItem(COUNT_KEY) || '0', 10) || 0;
      if (deferred.current && n >= 2 && !localStorage.getItem(DISMISS_KEY)) {
        setOpen(true);
      }
    };
    const onBeforeInstall = (e) => {
      e.preventDefault();
      deferred.current = e;
      maybeShow();
    };
    const onSaved = () => {
      const n = (parseInt(localStorage.getItem(COUNT_KEY) || '0', 10) || 0) + 1;
      localStorage.setItem(COUNT_KEY, String(n));
      maybeShow();
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('diagnosis-saved', onSaved);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('diagnosis-saved', onSaved);
    };
  }, []);

  const install = async () => {
    setOpen(false);
    const e = deferred.current;
    deferred.current = null;
    localStorage.setItem(DISMISS_KEY, '1');
    if (!e) return;
    e.prompt();
    try {
      await e.userChoice;
    } catch {
      // usuário fechou — tudo bem
    }
  };

  const dismiss = () => {
    setOpen(false);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  return (
    <Snackbar
      open={open}
      onClose={dismiss}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      message="Quer botar o Zé na tela inicial?"
      action={
        <>
          <Button size="small" onClick={install} sx={{ color: (t) => t.palette.brand.milho, fontWeight: 700 }}>
            Instalar
          </Button>
          <Button size="small" onClick={dismiss} sx={{ color: 'inherit' }}>
            Agora não
          </Button>
        </>
      }
    />
  );
}

export default InstallPrompt;
