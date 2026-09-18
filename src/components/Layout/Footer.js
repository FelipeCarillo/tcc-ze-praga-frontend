import React from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{ borderTop: "1px solid", borderColor: "divider", mt: 6, py: 4, bgcolor: "surface.sunken" }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          gap={3}
        >
          <Box>
            <Typography fontWeight={800} sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay }}>Zé Praga</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 430, mt: 1 }}
            >
              Caderno visual de observação de doenças foliares de soja.
              <br />
              Projeto de TCC · Instituto Mauá de Tecnologia · 2026.
            </Typography>
          </Box>
          <Stack direction="row" flexWrap="wrap" gap={0.5} alignItems="flex-start">
            <Button component={Link} to="/sobre">
              O projeto
            </Button>
            <Button component={Link} to="/modelos">
              Modelos e métricas
            </Button>
            <Button component={Link} to="/api-docs">
              API
            </Button>
            <Button component={Link} to="/planos">
              Planos
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
