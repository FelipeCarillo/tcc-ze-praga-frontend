import React from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import CameraFAB from './CameraFAB';

/**
 * Casca de navegação. No desktop: Navbar + conteúdo + Footer. No mobile:
 * Navbar enxuta + BottomNav fixa + CameraFAB (sem footer). O /chat usa a navbar
 * em modo `app` e não mostra bottom nav (tem header/composer próprios).
 */
function Layout({ children, showFooter = true }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isChat = location.pathname === '/chat';
  const showMobileNav = isMobile && !isChat;

  // O /chat é uma tela cheia com header e composer próprios (sem chrome global).
  if (isChat) {
    return <Box sx={{ minHeight: '100vh' }}>{children}</Box>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar variant="default" />
      <Box
        component="main"
        sx={{ flex: 1, pb: showMobileNav ? 'calc(64px + env(safe-area-inset-bottom))' : 0 }}
      >
        {children}
      </Box>
      {showFooter && !showMobileNav && <Footer />}
      {showMobileNav && (
        <>
          <CameraFAB />
          <BottomNav />
        </>
      )}
    </Box>
  );
}

export default Layout;
