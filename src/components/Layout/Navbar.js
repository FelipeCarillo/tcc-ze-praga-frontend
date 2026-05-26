import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Camera } from 'lucide-react';
import { ReactComponent as Marca } from '../../assets/brand/marca.svg';
import QuotaDisplay from './QuotaDisplay';
import AvatarMenu from './AvatarMenu';
import { copy } from '../../copy/ze';

const navLinks = [
  { label: 'Diagnosticar', path: '/chat' },
  { label: 'Histórico', path: '/historico' },
  { label: 'Modelos', path: '/modelos' },
  { label: 'API', path: '/api-docs' },
  { label: 'Sobre', path: '/sobre' },
];

function isActive(pathname, path) {
  return path === '/' ? pathname === '/' : pathname.startsWith(path);
}

/**
 * Navbar enxuta (auditoria, seção 09).
 * - `variant='default'`: marca + 5 links centralizados + CTA "Mandar foto" + avatar.
 * - `variant='app'` (/chat): só marca + avatar (o chat tem header próprio).
 * Sem drawer hambúrguer: no mobile a navegação vive na <BottomNav/>.
 */
function Navbar({ variant = 'default' }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isApp = variant === 'app';
  const showLinks = !isApp && !isMobile;

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2, md: 3 }, gap: 1 }}>
        <Box
          component={Link}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}
        >
          <Marca style={{ width: 34, height: 34, display: 'block' }} />
          <Typography
            sx={{
              fontFamily: (t) => t.typography.fontFamilyDisplay,
              fontWeight: 800,
              fontSize: '1.2rem',
              letterSpacing: '-0.02em',
              color: 'primary.main',
            }}
          >
            {copy.brand.name}
          </Typography>
        </Box>

        {showLinks ? (
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 3.5 }}>
            {navLinks.map((item) => {
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isMobile && !isApp && <QuotaDisplay />}
          {!isApp && (
            <Button
              component={Link}
              to="/chat"
              variant="contained"
              color="secondary"
              startIcon={<Camera size={18} />}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              {copy.cta.sendPhotoShort}
            </Button>
          )}
          <AvatarMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
