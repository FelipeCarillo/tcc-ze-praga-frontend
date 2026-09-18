import React from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
export default function Page({
  eyebrow,
  title,
  description,
  actions,
  children,
}) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 }, maxWidth: 1240 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        gap={2}
        sx={{ mb: { xs: 3, md: 5 }, pb: { xs: 2.5, md: 3 }, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Box maxWidth={700}>
          {eyebrow && (
            <Typography
              variant="overline"
              color="primary.main"
              sx={{ fontWeight: 800, letterSpacing: 1.5, fontSize: '0.72rem' }}
            >
              {eyebrow}
            </Typography>
          )}
          <Typography
            component="h1"
            variant="h3"
            sx={{
              fontSize: { xs: "2rem", md: "2.7rem" },
              letterSpacing: "-.03em",
              mb: 1,
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography color="text.secondary">{description}</Typography>
          )}
        </Box>
        {actions && (
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            {actions}
          </Stack>
        )}
      </Stack>
      {children}
    </Container>
  );
}
export function LoadingState({ label = "Carregando…" }) {
  return (
    <Box role="status" aria-label={label}>
      <Typography color="text.secondary" mb={2}>
        {label}
      </Typography>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="rounded" height={90} sx={{ mb: 2 }} />
      ))}
    </Box>
  );
}
export function ErrorState({
  message = "Não foi possível carregar. Confira sua conexão e tente novamente.",
  onRetry,
}) {
  return (
    <Alert
      severity="error"
      action={
        onRetry && (
          <Button color="inherit" onClick={onRetry}>
            Tentar novamente
          </Button>
        )
      }
    >
      {message}
    </Alert>
  );
}
