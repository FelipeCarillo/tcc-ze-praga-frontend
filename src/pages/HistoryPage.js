import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import HistoryList from '../components/History/HistoryList';
import useHistory from '../hooks/useHistory';

function HistoryPage() {
  const { diagnoses, loading, error, remove } = useHistory();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Historico de Diagnosticos
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Seus diagnosticos anteriores.
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && <HistoryList diagnoses={diagnoses} onDelete={remove} />}
    </Container>
  );
}

export default HistoryPage;
