import React from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
export default class ErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 4, py: 8 }}>
        <Typography variant="h4" component="h1" mb={2}>
          Vamos tentar abrir novamente.
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          A interface encontrou um erro inesperado. Recarregue para continuar.
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Recarregar aplicativo
        </Button>
        <Button component="a" href="/" sx={{ ml: 1 }}>
          Voltar ao início
        </Button>
      </Box>
    );
  }
}
