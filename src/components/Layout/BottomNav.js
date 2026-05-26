import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { History, Home, MessageCircle, UserRound } from 'lucide-react';

const items = [
  { label: 'Início', path: '/', icon: <Home size={22} /> },
  { label: 'Chat', path: '/chat', icon: <MessageCircle size={22} /> },
  { label: 'Histórico', path: '/historico', icon: <History size={22} /> },
  { label: 'Perfil', path: '/perfil', icon: <UserRound size={22} /> },
];

function currentValue(pathname) {
  const found = items.find((i) =>
    i.path === '/' ? pathname === '/' : pathname.startsWith(i.path)
  );
  return found ? found.path : false;
}

/**
 * Navegação inferior fixa para mobile (substitui o drawer hambúrguer).
 * 4 destinos; o CTA de câmera é o <CameraFAB/> flutuante por cima.
 */
function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.appBar,
        borderTop: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        pb: 'env(safe-area-inset-bottom)',
        backgroundColor: 'background.paper',
      }}
    >
      <BottomNavigation
        value={currentValue(location.pathname)}
        onChange={(_, value) => navigate(value)}
        showLabels
        sx={{
          backgroundColor: 'transparent',
          '& .MuiBottomNavigationAction-root': { color: 'text.secondary' },
          '& .Mui-selected': { color: 'primary.main', fontWeight: 700 },
        }}
      >
        {items.map((i) => (
          <BottomNavigationAction key={i.path} label={i.label} value={i.path} icon={i.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;
