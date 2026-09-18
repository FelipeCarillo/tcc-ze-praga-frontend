import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Camera, Moon, Sun } from 'lucide-react';
import { ReactComponent as Marca } from '../../assets/brand/marca.svg';
import AvatarMenu from './AvatarMenu';
import { copy } from '../../copy/ze';
import { useAuth } from '../../hooks/useAuth';
import { useColorMode } from '../../hooks/useColorMode';

const navLinks = [
  { label: 'Analisar folha', path: '/chat', requiresAuth: true },
  { label: 'Histórico', path: '/historico', requiresAuth: true },
  { label: 'Modelos', path: '/modelos' },
  { label: 'API', path: '/api-docs' },
  { label: 'Sobre', path: '/sobre' },
  { label: 'Planos', path: '/planos' },
];

function isActive(pathname, path) {
  return path === '/' ? pathname === '/' : pathname.startsWith(path);
}

/**
 * Navbar enxuta (auditoria, seção 09).
 * - `variant='default'`: marca + links prioritários + CTA "Mandar foto" + avatar.
 * - `variant='app'` (/chat): só marca + avatar (o chat tem header próprio).
 * Sem drawer hambúrguer: no mobile a navegação vive na <BottomNav/>.
 */
function Navbar({ variant = 'default' }) {
  const location = useLocation();
  const { user } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isApp = variant === 'app';
  const showLinks = !isApp && !isMobile;
  const visibleNavLinks = navLinks.filter((item) => !item.requiresAuth || user);

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar
        sx={{
          maxWidth: 1200,
          width: '100%',
          minWidth: 0,
          mx: 'auto',
          px: { xs: 2, md: 3 },
          gap: { xs: 0.5, md: 1 },
          overflow: 'hidden',
        }}
      >
        <Box
          component={Link}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', flexShrink: 0 }}
        >
          <Marca style={{ width: 34, height: 34, display: 'block' }} />
          <Typography
            sx={{
              fontFamily: (t) => t.typography.fontFamilyDisplay,
              fontWeight: 800,
              fontSize: '1.2rem',
              letterSpacing: '-0.02em',
              color: 'primary.main',
              whiteSpace: 'nowrap',
            }}
          >
            {copy.brand.name}
          </Typography>
        </Box>

        {showLinks ? (
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: { md: 2, lg: 2.5 },
              overflow: 'hidden',
            }}
          >
            {visibleNavLinks.map((item) => {
              const active = isActive(location.pathname, item.path);
              return (
                <Typography
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    color: active ? 'text.primary' : 'text.secondary',
                    borderBottom: '2px solid',
                    borderColor: active ? 'secondary.main' : 'transparent',
                    pb: 0.25,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'color 0.15s',
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  {item.label}
                </Typography>
              );
            })}
          </Box>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 1 }, flexShrink: 0 }}>
          {!isApp && (
            <Button
              component={Link}
              to="/chat"
              variant="contained"
              color="secondary"
              startIcon={<Camera size={18} />}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Analisar uma folha
            </Button>
          )}
          <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo noite'}>
            <IconButton
              aria-label={mode === 'dark' ? 'Ativar modo claro' : 'Ativar modo noite'}
              onClick={toggleColorMode}
              sx={{ color: 'text.secondary' }}
            >
              {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>
          </Tooltip>
          <AvatarMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
