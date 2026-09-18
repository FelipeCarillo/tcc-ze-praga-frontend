import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { LogIn, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

function initialOf(user) {
  const base = user?.full_name || user?.email || '';
  return base.trim().charAt(0).toUpperCase() || '?';
}

/**
 * Avatar circular com dropdown exclusivo da conta. Logado: Perfil / Sair.
 * Deslogado: Entrar. O toggle de tema fica visível ao lado do avatar na barra.
 */
function AvatarMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const close = () => setAnchorEl(null);
  const handleLogout = () => {
    close();
    logout();
    navigate('/');
  };

  return (
    <>
      <Tooltip title={user ? 'Sua conta' : 'Conta'}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          aria-label="Menu da conta"
          aria-haspopup="true"
          aria-expanded={open || undefined}
          sx={{ ml: 0.5 }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 700,
              fontFamily: (t) => t.typography.fontFamilyDisplay,
              fontSize: '1rem',
            }}
          >
            {user ? initialOf(user) : <UserRound size={18} />}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 220, borderRadius: 1, border: '1px solid', borderColor: 'divider' } } }}
      >
        {user && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography
              sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, lineHeight: 1.2 }}
            >
              {user.full_name || 'Compadre'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          </Box>
        )}
        {user ? (
          <MenuItem component={Link} to="/perfil" onClick={close}>
            <ListItemIcon>
              <UserRound size={18} />
            </ListItemIcon>
            <ListItemText>Perfil</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem component={Link} to="/login" onClick={close}>
            <ListItemIcon>
              <LogIn size={18} />
            </ListItemIcon>
            <ListItemText>Entrar</ListItemText>
          </MenuItem>
        )}

        {user && <Divider />}
        {user && (
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogOut size={18} />
            </ListItemIcon>
            <ListItemText>Sair</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

export default AvatarMenu;
