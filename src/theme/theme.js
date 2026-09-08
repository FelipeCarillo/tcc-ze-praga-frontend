import { createTheme } from '@mui/material/styles';

/**
 * Tokens de marca "Zé Praga" (auditoria de design — seção 04).
 * São constantes de marca, independentes do modo claro/escuro.
 */
export const brand = {
  mata: '#1F5A3D', // Verde Mata — primary / estrutura
  mata2: '#2D6A4F', // Verde Mata claro
  mataNoite: '#0F3D27',
  folha: '#74C69D', // Folha — success / acento claro
  folhaSoft: '#C7E8D4',
  cerrado: '#E07856', // Terracota — ação / CTAs quentes
  cerradoSoft: '#FAD9C8',
  milho: '#F4C95D', // Milho — brilho / acento
  milhoSoft: '#FBE9B8',
  tijolo: '#8B3A26', // alerta sério
  papel: '#FBF7EE', // superfície base (light)
  papel2: '#F4EEDF', // superfície sombreada (light)
  solo: '#1C2A20', // texto / headlines (light)
  noite: '#0F1B14', // bg base (dark)
  noite2: '#18261D', // surface elevada (dark)
  noite3: '#243329', // bordas / hover (dark)
  creme: '#F0EDE2', // texto on dark
  // severidade (semântica)
  severa: '#C03A2B',
  moderada: '#E07856',
  leve: '#F4C95D',
  saudavel: '#5BA970',
};

const FONT_DISPLAY = "'Bricolage Grotesque', 'DM Sans', sans-serif";
const FONT_BODY = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Helvetica', 'Arial', sans-serif";
const FONT_MONO = "'JetBrains Mono', 'SF Mono', Menlo, monospace";
const FONT_HAND = "'Caveat', cursive";

/**
 * Tokens crus expostos como CSS custom properties para os componentes "bespoke"
 * (chat, matriz de confusão, API docs dark) usarem `var(--mata)` sem divergir do
 * tema MUI. Aplicado por <BrandCssVariables/> sincronizado ao modo.
 */
export function brandCssVariables(mode) {
  const isDark = mode === 'dark';
  return {
    '--mata': brand.mata,
    '--mata-12': brand.mata2,
    '--mata-noite': brand.mataNoite,
    '--folha': brand.folha,
    '--folha-soft': brand.folhaSoft,
    '--cerrado': brand.cerrado,
    '--cerrado-soft': brand.cerradoSoft,
    '--milho': brand.milho,
    '--milho-soft': brand.milhoSoft,
    '--tijolo': brand.tijolo,
    // superfícies e texto — sensíveis ao modo
    '--papel': isDark ? brand.noite : brand.papel,
    '--papel-2': isDark ? brand.noite2 : brand.papel2,
    '--solo': isDark ? brand.creme : brand.solo,
    '--solo-60': isDark ? 'rgba(240,237,226,0.70)' : 'rgba(28,42,32,0.62)',
    '--solo-40': isDark ? 'rgba(240,237,226,0.45)' : 'rgba(28,42,32,0.40)',
    '--solo-12': isDark ? 'rgba(240,237,226,0.14)' : 'rgba(28,42,32,0.12)',
    '--solo-06': isDark ? 'rgba(240,237,226,0.08)' : 'rgba(28,42,32,0.06)',
    // dark canônico (sempre escuro — usado em blocos de código / colunas dark)
    '--noite': brand.noite,
    '--noite-2': brand.noite2,
    '--noite-3': brand.noite3,
    '--creme-dark': brand.creme,
    // severidade
    '--severa': brand.severa,
    '--moderada': brand.moderada,
    '--leve': brand.leve,
    '--saudavel': brand.saudavel,
    // tipografia
    '--display': FONT_DISPLAY,
    '--body': FONT_BODY,
    '--mono': FONT_MONO,
    '--hand': FONT_HAND,
    // raios
    '--r-sm': '8px',
    '--r-md': '14px',
    '--r-lg': '22px',
    '--r-xl': '32px',
    '--r-full': '999px',
  };
}

export function createAppTheme(mode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? brand.folha : brand.mata,
        light: brand.folha,
        dark: brand.mataNoite,
        contrastText: isDark ? brand.noite : '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#F0A98D' : '#AA462B',
        light: '#F0A98D',
        dark: brand.tijolo,
        contrastText: isDark ? brand.noite : '#FFFFFF',
      },
      background: {
        default: isDark ? brand.noite : brand.papel,
        paper: isDark ? brand.noite2 : '#FFFFFF',
      },
      error: {
        main: brand.severa,
      },
      warning: {
        main: brand.cerrado,
      },
      success: {
        main: brand.saudavel,
      },
      text: {
        primary: isDark ? brand.creme : brand.solo,
        secondary: isDark ? 'rgba(240,237,226,0.70)' : 'rgba(28,42,32,0.62)',
      },
      divider: isDark ? brand.noite3 : 'rgba(28,42,32,0.12)',
      // —— chaves customizadas: VALORES atualizados, chaves preservadas ——
      severity: {
        alta: brand.severa,
        media: brand.moderada,
        baixa: brand.leve,
        nenhuma: brand.saudavel,
      },
      // tokens de marca acessíveis via theme.palette.brand.*
      brand,
      chat: {
        user: isDark ? brand.noite3 : brand.folhaSoft,
        bot: isDark ? brand.noite2 : '#FFFFFF',
      },
      surface: {
        sunken: isDark ? brand.noite : brand.papel2,
        elevated: isDark ? brand.noite2 : '#FFFFFF',
        muted: isDark ? brand.noite3 : brand.papel2,
      },
      code: {
        header: isDark ? brand.noite2 : brand.noite2,
        body: isDark ? brand.noite : brand.noite,
        text: brand.creme,
        tabInactive: 'rgba(240,237,226,0.5)',
        tabActive: '#FFFFFF',
      },
      custom: {
        chatPreview: isDark ? brand.noite3 : brand.papel2,
      },
    },
    typography: {
      fontFamily: FONT_BODY,
      fontFamilyDisplay: FONT_DISPLAY,
      fontFamilyHand: FONT_HAND,
      fontFamilyMono: FONT_MONO,
      fontSize: 14,
      h1: {
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
        lineHeight: 1.02,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: 'clamp(1.75rem, 3.4vw, 2.5rem)',
        lineHeight: 1.1,
        letterSpacing: '-0.018em',
      },
      h3: {
        fontFamily: FONT_DISPLAY,
        fontWeight: 600,
        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
        lineHeight: 1.15,
        letterSpacing: '-0.018em',
      },
      h4: {
        fontFamily: FONT_DISPLAY,
        fontWeight: 600,
        fontSize: '1.6rem',
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
      },
      h5: {
        fontFamily: FONT_DISPLAY,
        fontWeight: 600,
        fontSize: '1.0625rem',
      },
      h6: {
        fontFamily: FONT_DISPLAY,
        fontWeight: 600,
        fontSize: '0.9375rem',
      },
      body1: {
        fontSize: '1.0625rem',
        lineHeight: 1.65,
      },
      body2: {
        fontSize: '0.9375rem',
        lineHeight: 1.6,
      },
      button: {
        fontWeight: 700,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiCssBaseline: { styleOverrides: { html: { scrollBehavior: 'auto' }, body: { overflowWrap: 'break-word' }, '*:focus-visible': { outline: '3px solid ' + (isDark ? brand.milho : brand.mata), outlineOffset: 3 }, '@media (prefers-reduced-motion: reduce)': { '*, *::before, *::after': { animationDuration: '0.01ms !important', transitionDuration: '0.01ms !important', scrollBehavior: 'auto !important' } } } },
        MuiButtonBase: { styleOverrides: { root: { '&.Mui-focusVisible': { outline: '3px solid ' + (isDark ? brand.milho : brand.mata), outlineOffset: 3 } } } },
        MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
      MuiMenuItem: { styleOverrides: { root: { minHeight: 44 } } },
      MuiTextField: { defaultProps: { variant: 'outlined' } },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 999,
            padding: '10px 22px',
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: isDark ? brand.folhaSoft : brand.mataNoite,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? '0 2px 12px rgba(0,0,0,0.32)'
              : '0 2px 12px rgba(28,42,32,0.06)',
            borderRadius: 22,
            border: `1px solid ${isDark ? brand.noite3 : 'rgba(28,42,32,0.06)'}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark
              ? 'rgba(15, 27, 20, 0.92)'
              : 'rgba(251, 247, 238, 0.85)',
            backdropFilter: 'blur(12px)',
            color: isDark ? brand.creme : brand.solo,
            boxShadow: 'none',
            borderBottom: `1px solid ${isDark ? brand.noite3 : 'rgba(28,42,32,0.06)'}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundImage: 'none',
          },
        },
      },
    },
  });
}
