import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

function ActionPlan({ actions }) {
  if (!actions || actions.length === 0) return null;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Plano de Acao
      </Typography>
      <List dense>
        {actions.map((action, index) => (
          <ListItem key={index} disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleOutlineIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={action} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default ActionPlan;
