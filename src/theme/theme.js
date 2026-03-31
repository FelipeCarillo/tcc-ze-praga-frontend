import { createTheme } from '@mui/material/styles';

export function createAppTheme(mode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#2D6A4F',
        light: '#52B788',
        dark: '#1B4332',
      },
      secondary: {
        main: '#F4A261',
        light: '#F4C089',
        dark: '#D4823E',
      },
      background: {
        default: isDark ? '#0D1B12' : '#FAFDF7',
        paper: isDark ? '#132218' : '#FFFFFF',
      },
      error: {
        main: '#E63946',
      },
      warning: {
        main: '#F4A261',
      },
      success: {
        main: '#52B788',
      },
      text: {
        primary: isDark ? '#E8F5E9' : '#1A1A2E',
        secondary: isDark ? '#9CA3AF' : '#6B7280',
      },
      divider: isDark ? '#2D3B35' : '#E5E7EB',
      severity: {
        alta: '#E63946',
        media: '#F4A261',
        baixa: '#F4D35E',
        nenhuma: '#52B788',
      },
      chat: {
        user: isDark ? '#1A3A27' : '#E8F5E9',
        bot: isDark ? '#132218' : '#FFFFFF',
      },
      surface: {
        sunken: isDark ? '#0D1B12' : '#FAFDF7',
        elevated: isDark ? '#132218' : '#FFFFFF',
        muted: isDark ? '#1A3A27' : '#F8F9FA',
      },
      code: {
        header: isDark ? '#132218' : '#1E293B',
        body: isDark ? '#0D1B12' : '#0F172A',
        text: isDark ? '#D1E7D4' : '#E2E8F0',
        tabInactive: isDark ? '#9CA3AF' : 'rgba(255,255,255,0.6)',
        tabActive: isDark ? '#E8F5E9' : '#FFFFFF',
      },
    },
    typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h4: {
        fontWeight: 700,
        fontSize: '1.25rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.1rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 24,
            padding: '8px 24px',
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: '#1B4332',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? '0 2px 12px rgba(0,0,0,0.3)'
              : '0 2px 12px rgba(0,0,0,0.06)',
            borderRadius: 16,
            border: `1px solid ${isDark ? '#2D3B35' : '#E5E7EB'}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark
              ? 'rgba(13, 27, 18, 0.92)'
              : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            color: isDark ? '#E8F5E9' : '#1A1A2E',
            boxShadow: 'none',
            borderBottom: `1px solid ${isDark ? '#2D3B35' : '#E5E7EB'}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  });
}
