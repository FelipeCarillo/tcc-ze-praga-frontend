import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from './theme/theme';
import { ColorModeContext } from './ColorModeContext';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const COLOR_MODE_STORAGE_KEY = 'zepraga-color-mode';

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
    }),
    [mode]
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
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

serviceWorkerRegistration.register();
