import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha, useTheme } from '@mui/material/styles';
import {
  ArrowRight,
  BookOpen,
  Cpu,
  Crown,
  History,
  Info,
  Leaf,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Sun,
  UserRound,
} from 'lucide-react';
import { useColorMode } from '../../hooks/useColorMode';
import { useAuth } from '../../hooks/useAuth';

const navLinks = [
  { label: 'Como Funciona', path: '/#como-funciona' },
  { label: 'Modelos', path: '/modelos', icon: <Cpu size={18} /> },
  { label: 'Planos', path: '/planos', icon: <Crown size={18} /> },
  { label: 'API', path: '/api-docs', icon: <BookOpen size={18} /> },
  { label: 'Sobre', path: '/sobre', icon: <Info size={18} /> },
];

const mobileNavItems = [
  { label: 'Início', path: '/', icon: <Leaf size={20} /> },
  { label: 'Chat', path: '/chat', icon: <MessageCircle size={20} /> },
  { label: 'Histórico', path: '/historico', icon: <History size={20} /> },
  { label: 'Modelos', path: '/modelos', icon: <Cpu size={20} /> },
  { label: 'Planos', path: '/planos', icon: <Crown size={20} /> },
  { label: 'API Docs', path: '/api-docs', icon: <BookOpen size={20} /> },
  { label: 'Sobre', path: '/sobre', icon: <Info size={20} /> },
];

function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { toggleColorMode, mode } = useColorMode();
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleNavClick = (path) => {
    if (path.startsWith('/#')) {
      const id = path.substring(2);
      if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: id } });
      } else {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    navigate('/');
  };

  const authItem = user
    ? { label: 'Perfil', path: '/perfil', icon: <UserRound size={20} /> }
    : { label: 'Login', path: '/login', icon: <LogIn size={20} /> };

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2, md: 3 } }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1, color: 'text.primary' }}
            >
              <Menu size={24} />
            </IconButton>
          )}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'primary.main',
              flexGrow: 1,
              gap: 1,
            }}
          >
            <Leaf size={28} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.02em',
              }}
            >
              Zé Praga
            </Typography>
          </Box>
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navLinks.map((item) => (
                <Button
                  key={item.path}
                  component={item.path.startsWith('/#') ? 'button' : Link}
                  to={item.path.startsWith('/#') ? undefined : item.path}
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'transparent',
                    },
                    ...(location.pathname === item.path && {
                      color: 'primary.main',
                      fontWeight: 600,
                    }),
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                component={Link}
                to="/chat"
                variant="contained"
                color="primary"
                endIcon={<ArrowRight size={18} />}
                sx={{
                  ml: 1,
                  borderRadius: 24,
                  px: 3,
                }}
              >
                Iniciar Diagnóstico
              </Button>
              <Button
                component={Link}
                to={authItem.path}
                variant="outlined"
                color="primary"
                startIcon={user ? <UserRound size={18} /> : <LogIn size={18} />}
                sx={{ ml: 1, borderRadius: 24, px: 2.5 }}
              >
                {authItem.label}
              </Button>
              {user && (
                <Tooltip title="Sair">
                  <IconButton onClick={handleLogout} sx={{ color: 'text.primary' }}>
                    <LogOut size={20} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
                <IconButton
                  onClick={toggleColorMode}
                  sx={{ ml: 0.5, color: 'text.primary' }}
                >
                  {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </IconButton>
              </Tooltip>
            </Box>
          )}
          {isMobile && (
            <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
              <IconButton
                onClick={toggleColorMode}
                sx={{ color: 'text.primary' }}
              >
                {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            color: 'text.primary',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ width: 280, pt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Leaf size={24} color={theme.palette.primary.main} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Zé Praga
            </Typography>
          </Box>
          <List>
            {mobileNavItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      color: 'text.primary',
                    },
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      color: 'text.primary',
                      fontWeight: 600,
                      borderLeft: '3px solid',
                      borderLeftColor: 'primary.main',
                    },
                    '&.Mui-selected:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.16),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to={authItem.path}
                selected={location.pathname === authItem.path}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    color: 'text.primary',
                  },
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    color: 'text.primary',
                    fontWeight: 600,
                    borderLeft: '3px solid',
                    borderLeftColor: 'primary.main',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.16),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  {authItem.icon}
                </ListItemIcon>
                <ListItemText primary={authItem.label} />
              </ListItemButton>
            </ListItem>
          </List>
          <Box sx={{ px: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider', mt: 1 }}>
            <Button
              component={Link}
              to="/chat"
              variant="contained"
              color="primary"
              fullWidth
              endIcon={<ArrowRight size={18} />}
              onClick={() => setDrawerOpen(false)}
            >
              Iniciar Diagnóstico
            </Button>
            {user && (
              <Button
                color="error"
                variant="outlined"
                fullWidth
                startIcon={<LogOut size={18} />}
                onClick={handleLogout}
                sx={{ mt: 1.5 }}
              >
                Sair
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default Navbar;


