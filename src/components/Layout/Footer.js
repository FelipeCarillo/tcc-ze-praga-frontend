import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ReactComponent as Marca } from '../../assets/brand/marca.svg';
import { ReactComponent as Selo } from '../../assets/brand/selo.svg';

const productLinks = [
  { label: 'Diagnosticar', path: '/chat' },
  { label: 'Histórico', path: '/historico' },
  { label: 'Planos', path: '/planos' },
  { label: 'Perfil', path: '/perfil' },
];

const projectLinks = [
  { label: 'Sobre o Zé Praga', path: '/sobre' },
  { label: 'Modelos & métricas', path: '/modelos' },
  { label: 'API pública', path: '/api-docs' },
];

const colTitleSx = {
  fontFamily: (t) => t.typography.fontFamilyMono,
  fontSize: '0.7rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: (t) => t.palette.brand.milho,
  mb: 1.5,
};

const linkSx = {
  color: 'rgba(240,237,226,0.8)',
  textDecoration: 'none',
  fontSize: '0.875rem',
  '&:hover': { color: (t) => t.palette.brand.milho },
  transition: 'color 0.2s',
};

const pillSx = {
  display: 'inline-flex',
  alignItems: 'center',
  px: 1.25,
  py: 0.4,
  borderRadius: 999,
  fontSize: '0.72rem',
  fontWeight: 700,
};

/**
 * Footer institucional (auditoria, seção 09): fundo Verde Mata, wordmark
 * Bricolage, selo botânico, 2 colunas de links + selos ODS/TCC.
 */
function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: (t) => t.palette.brand.creme,
        py: 6,
        px: { xs: 3, md: 7 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr 1fr' },
            gap: 5,
          }}
        >
          {/* Marca + missão */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Marca style={{ width: 44, height: 44, display: 'block' }} />
              <Typography
                sx={{
                  fontFamily: (t) => t.typography.fontFamilyDisplay,
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  letterSpacing: '-0.02em',
                  color: (t) => t.palette.brand.milho,
                }}
              >
                Zé Praga
              </Typography>
            </Box>
            <Typography
              sx={{ color: 'rgba(240,237,226,0.78)', lineHeight: 1.7, maxWidth: 360, mb: 2 }}
            >
              O consultor fitossanitário de bolso. Hoje na soja, amanhã em qualquer cultivo —
              pra qualquer produtor, sem cadastro, no celular.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Box sx={{ ...pillSx, bgcolor: (t) => t.palette.brand.milhoSoft, color: '#8A6C0E' }}>
                ODS 2
              </Box>
              <Box sx={{ ...pillSx, bgcolor: (t) => t.palette.brand.milhoSoft, color: '#8A6C0E' }}>
                ODS 9
              </Box>
              <Box
                sx={{
                  ...pillSx,
                  border: '1px solid rgba(240,237,226,0.25)',
                  color: 'rgba(240,237,226,0.85)',
                }}
              >
                TCC · IMT 2026
              </Box>
            </Box>
          </Box>

          {/* Produto */}
          <Box>
            <Typography sx={colTitleSx}>Produto</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {productLinks.map((l) => (
                <Typography key={l.path} component={Link} to={l.path} sx={linkSx}>
                  {l.label}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Projeto */}
          <Box>
            <Typography sx={colTitleSx}>Projeto</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {projectLinks.map((l) => (
                <Typography key={l.path} component={Link} to={l.path} sx={linkSx}>
                  {l.label}
                </Typography>
              ))}
              <Typography
                component="a"
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={linkSx}
              >
                GitHub do TCC
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: '1px solid rgba(240,237,226,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(240,237,226,0.55)' }}>
            © 2026 · Grupo Zé Praga · Instituto Mauá de Tecnologia
          </Typography>
          <Selo style={{ width: 56, height: 56, opacity: 0.7 }} />
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;
