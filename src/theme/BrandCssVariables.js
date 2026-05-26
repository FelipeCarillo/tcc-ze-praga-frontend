import React from 'react';
import GlobalStyles from '@mui/material/GlobalStyles';
import { useTheme } from '@mui/material/styles';
import { brandCssVariables } from './theme';

/**
 * Injeta os tokens de marca como CSS custom properties em :root, sincronizados
 * com o modo claro/escuro atual. Permite que componentes "bespoke" (chat, matriz
 * de confusão, API docs) usem `var(--mata)`, `var(--cerrado)`, etc. sem divergir
 * do tema MUI. Deve ser montado dentro do <ThemeProvider>.
 */
function BrandCssVariables() {
  const theme = useTheme();
  return <GlobalStyles styles={{ ':root': brandCssVariables(theme.palette.mode) }} />;
}

export default BrandCssVariables;
