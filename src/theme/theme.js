import { createTheme } from '@mui/material/styles';

/**
 * Tokens de marca "Zé Praga" (auditoria de design — seção 04).
 * São constantes de marca, independentes do modo claro/escuro.
 */
export const brand = {
  // Rebrand 2026 — "agrônomo de bolso": nomes dos tokens preservados para não
  // quebrar consumidores; só os valores mudaram (canvas de design aprovado).
  mata: '#1B4D2E', // Lavoura — primary / estrutura
  mata2: '#24603A',
  mataNoite: '#0F2E1B',
  folha: '#C8F169', // Broto — ação primária (sempre com texto escuro)
  folhaSoft: '#E8F8C4',
  cerrado: '#C2570C', // alerta moderado
  cerradoSoft: '#FDE9D7',
  milho: '#C8F169', // Broto — destaque sobre fundo escuro
  milhoSoft: '#E8F8C4',
  tijolo: '#8A1C12', // alerta sério (texto)
  papel: '#F2F4EE', // Palha — superfície base (light)
  papel2: '#E4E9DE', // superfície sombreada (light)
  solo: '#0F1A13', // texto / headlines (light)
  noite: '#0B1510', // bg base (dark) e câmera
  noite2: '#14251B', // surface elevada (dark)
  noite3: '#22362A', // bordas / hover (dark)
  creme: '#EEF2E8', // texto on dark
  oliva: '#4B7A12', // acento legível sobre fundo claro (secondary light)
  // severidade (semântica) — sempre acompanhada de ícone + palavra
  severa: '#B42318',
  moderada: '#C2570C',
  leve: '#C9A227',
  saudavel: '#2E9E57',
};

const FONT_DISPLAY = "'Archivo', -apple-system, BlinkMacSystemFont, sans-serif";
const FONT_BODY = "'Archivo', -apple-system, BlinkMacSystemFont, 'Helvetica', sans-serif";
const FONT_MONO = "'JetBrains Mono', 'SF Mono', Menlo, monospace";
// A fonte manuscrita (Caveat) saiu no rebrand; o token fica para compatibilidade
// e cai na display.
const FONT_HAND = FONT_DISPLAY;

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
    '--solo-60': isDark ? 'rgba(238,242,232,0.72)' : 'rgba(15,26,19,0.70)',
    '--solo-40': isDark ? 'rgba(238,242,232,0.45)' : 'rgba(15,26,19,0.45)',
    '--solo-12': isDark ? 'rgba(238,242,232,0.14)' : 'rgba(15,26,19,0.12)',
    '--solo-06': isDark ? 'rgba(238,242,232,0.08)' : 'rgba(15,26,19,0.06)',
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
    '--r-sm': '10px',
    '--r-md': '14px',
    '--r-lg': '20px',
    '--r-xl': '28px',
    '--broto': brand.folha,
    '--lavoura': brand.mata,
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
        main: isDark ? brand.folha : brand.oliva,
        light: brand.folha,
        dark: isDark ? brand.folhaSoft : '#3A5F0E',
        contrastText: isDark ? brand.noite : '#FFFFFF',
      },
      // Broto: ação primária de cada tela (câmera, "Fotografar folha").
      cta: {
        main: brand.folha,
        hover: '#B6E04F',
        contrastText: brand.solo,
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
        secondary: isDark ? 'rgba(238,242,232,0.72)' : 'rgba(15,26,19,0.70)',
      },
      divider: isDark ? brand.noite3 : 'rgba(15,26,19,0.12)',
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
        user: isDark ? brand.noite3 : brand.mata,
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
        fontWeight: 800,
        fontStretch: '118%',
        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
        lineHeight: 1.02,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontStretch: '115%',
        fontSize: 'clamp(1.75rem, 3.4vw, 2.5rem)',
        lineHeight: 1.1,
        letterSpacing: '-0.018em',
      },
      h3: {
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontStretch: '112%',
        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
        lineHeight: 1.15,
        letterSpacing: '-0.018em',
      },
      h4: {
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontStretch: '108%',
        fontSize: '1.6rem',
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
      },
      h5: {
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontStretch: '105%',
        fontSize: '1.0625rem',
      },
      h6: {
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
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
            borderRadius: 14,
            minHeight: 48,
            padding: '10px 20px',
            fontSize: '1rem',
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: isDark ? brand.folhaSoft : brand.mataNoite,
            },
          },
          // O antigo CTA terracota (secondary contained) vira verde-lavoura no
          // rebrand; o verde-broto fica reservado à ação de câmera (palette.cta).
          containedSecondary: {
            backgroundColor: isDark ? brand.folha : brand.mata,
            color: isDark ? brand.noite : '#FFFFFF',
            '&:hover': {
              backgroundColor: isDark ? brand.folhaSoft : brand.mataNoite,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderRadius: 20,
            border: `1px solid ${isDark ? brand.noite3 : '#DCE2D6'}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark
              ? 'rgba(11, 21, 16, 0.92)'
              : 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(12px)',
            color: isDark ? brand.creme : brand.solo,
            boxShadow: 'none',
            borderBottom: `1px solid ${isDark ? brand.noite3 : '#DCE2D6'}`,
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
            borderRadius: 18,
            backgroundImage: 'none',
          },
        },
      },
    },
  });
}
