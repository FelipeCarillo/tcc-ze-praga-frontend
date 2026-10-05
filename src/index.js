import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from './theme/theme';
import BrandCssVariables from './theme/BrandCssVariables';
import { ColorModeContext } from './ColorModeContext';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const COLOR_MODE_STORAGE_KEY = 'zepraga-color-mode';
const FIELD_MODE_STORAGE_KEY = 'zepraga-modo-campo';

function getInitialFieldMode() {
  try {
    return localStorage.getItem(FIELD_MODE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function getInitialColorMode() {
  try {
    const savedMode = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode;
    }

    const prefersDark =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    return prefersDark ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function Root() {
  const [mode, setMode] = useState(getInitialColorMode);
  // "Modo campo" (Perfil): letra maior e contraste máximo, para o sol.
  const [field, setField] = useState(getInitialFieldMode);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => {
          const nextMode = prev === 'light' ? 'dark' : 'light';
          try {
            localStorage.setItem(COLOR_MODE_STORAGE_KEY, nextMode);
          } catch {
            // Ignore storage errors and keep runtime mode.
          }
          return nextMode;
        }),
      mode,
      field,
      toggleFieldMode: () =>
        setField((prev) => {
          try {
            localStorage.setItem(FIELD_MODE_STORAGE_KEY, prev ? '0' : '1');
          } catch {
            // Ignore storage errors and keep runtime mode.
          }
          return !prev;
        }),
    }),
    [mode, field]
  );

  const theme = useMemo(() => createAppTheme(mode, { field }), [mode, field]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrandCssVariables />
        <App />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

if (process.env.NODE_ENV === 'production') serviceWorkerRegistration.register();
else serviceWorkerRegistration.unregister();
