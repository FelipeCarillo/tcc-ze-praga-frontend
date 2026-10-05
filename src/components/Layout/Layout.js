import React from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import TopBar from './TopBar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import RuntimeNotice from '../common/RuntimeNotice';

/**
 * Casca de navegação — rebrand 2026, igual ao canvas de design.
 *
 * Desktop: TopBar (sólida, ou `topBar="overlay"` transparente sobre o hero da
 * landing) + conteúdo + rodapé. Mobile: sem barra global — cada tela tem o
 * próprio cabeçalho, como no canvas — e a BottomNav com a câmera no centro.
 * `/chat` e `/camera` são telas cheias, sem casca.
 */
function Layout({ children, showFooter = true, topBar = 'solid', bottomNav = true }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const fullScreen = location.pathname === '/chat' || location.pathname === '/camera';
  const showMobileNav = isMobile && bottomNav && !fullScreen;

  if (fullScreen) {
    return <Box sx={{ minHeight: '100dvh' }}>{children}</Box>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Box
        component="a"
        href="#main-content"
        sx={{ position: 'absolute', left: 16, top: -100, zIndex: 2000, p: 2, bgcolor: 'background.paper', '&:focus': { top: 8 } }}
      >
        Ir para o conteúdo
      </Box>
      <RuntimeNotice />
      {topBar === 'solid' && <TopBar variant="solid" />}
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{
          flex: 1,
          position: 'relative',
          pb: showMobileNav ? 'calc(84px + env(safe-area-inset-bottom))' : 0,
        }}
      >
        {topBar === 'overlay' && <TopBar variant="overlay" />}
        {children}
      </Box>
      {showFooter && !isMobile && <Footer />}
      {showMobileNav && <BottomNav />}
    </Box>
  );
}

export default Layout;
