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
/**
 * Casca das páginas de conteúdo (Modelos, Sobre, API, Pagamento…) com a
 * tipografia do canvas: etiqueta em mono verde, título em Archivo Expanded
 * 800 e o subtítulo em cinza — o mesmo cabeçalho do d-Historico.
 */
export default function Page({ eyebrow, title, description, actions, children }) {
  return (
    <Container
      maxWidth="lg"
      sx={{
        pt: { xs: 2.5, md: 5 },
        pb: { xs: 4, md: 7 },
        maxWidth: 1280,
        px: { xs: 2.5, md: 4 },
        "@keyframes zpUp": { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "none" } },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "flex-end" }}
        gap={2}
        sx={{ mb: { xs: 3, md: 4.5 }, animation: "zpUp .5s cubic-bezier(.2,.7,.2,1) both", "@media (prefers-reduced-motion: reduce)": { animation: "none" } }}
      >
        <Box maxWidth={760}>
          {eyebrow && (
            <Typography
              sx={{
                fontFamily: (t) => t.typography.fontFamilyMono,
                fontSize: "0.8125rem",
                fontWeight: 600,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "primary.main",
                mb: 1,
              }}
            >
              {eyebrow}
            </Typography>
          )}
          <Typography
            component="h1"
            sx={{
              m: 0,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
              fontWeight: 800,
              fontStretch: { xs: "112%", md: "115%" },
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography color="text.secondary" sx={{ mt: 1.25, fontSize: { xs: "1rem", md: "1.0625rem" }, lineHeight: 1.5 }}>
              {description}
            </Typography>
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
