import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Camera } from 'lucide-react';
import { ReactComponent as Selo } from '../assets/brand/selo.svg';
import { copy } from '../copy/ze';

const team = [
  { name: 'Breno Coutinho Rodrigues', role: 'Desenvolvedor' },
  { name: 'Felipe Carillo', role: 'Desenvolvedor' },
  { name: 'Gabriel Soares Teixeira', role: 'Desenvolvedor' },
  { name: 'João Pedro Galhardo', role: 'Desenvolvedor' },
  { name: 'Luca Pinheiro Gomes', role: 'Desenvolvedor' },
];

const timeline = [
  { tag: '2024.2', title: 'Projeto aprovado', desc: 'Definição de escopo, formação do grupo, alinhamento com orientadores.' },
  { tag: '2025.1', title: 'Primeiro modelo', desc: 'CNN treinada em PlantVillage. POC de classificação.' },
  { tag: '2025.2', title: 'Web app + API', desc: 'React + FastAPI, primeira versão pública.' },
  { tag: '2026.1', title: 'Redesign + banca', desc: 'Voz do Zé, identidade visual, mobile-first. Defesa.', star: true },
];

const ods = [
  { num: '02', title: 'Fome zero & agricultura sustentável', desc: 'Reduzir perdas de safra por diagnóstico tardio.' },
  { num: '09', title: 'Indústria, inovação e infraestrutura', desc: 'Democratização de IA aplicada ao agro brasileiro.' },
  { num: '17', title: 'Parcerias e meios de implementação', desc: 'Código aberto + dataset público + parcerias acadêmicas.' },
];

function AboutPage() {
  return (
    <Box>
      {/* Quote hero */}
      <Box sx={{ px: { xs: 3, md: 7 }, py: { xs: 6, md: 9 }, maxWidth: 1100, mx: 'auto' }}>
        <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'secondary.main', mb: 2 }}>
          Sobre
        </Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3.2rem' }, maxWidth: 820, mb: 4 }}>
          "Quando o produtor não tem agrônomo perto,{' '}
          <Box component="span" sx={{ color: 'secondary.main' }}>o Zé fica.</Box>"
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.3fr 1fr' }, gap: 5, alignItems: 'start' }}>
          <Box>
            <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
              O Zé Praga nasceu no <b>Instituto Mauá de Tecnologia</b> como Trabalho de Conclusão de
              Curso, a partir de uma constatação: muitos produtores não têm acesso regular a um
              agrônomo. Quando aparece uma praga na folha, "o que é isso?" vira "vou pulverizar e ver".
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
              Construímos o Zé como um consultor fitossanitário de bolso, gratuito, sem cadastro, que
              roda no navegador. Foto → diagnóstico → receita prática, em português.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              Hoje o Zé reconhece <b>6 classes de pragas em soja</b>. Em breve, milho, café e algodão.
            </Typography>
          </Box>
          <Box sx={{ aspectRatio: '4/5', borderRadius: 4, background: 'linear-gradient(160deg, #1F5A3D, #74C69D)', position: 'relative', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
            <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontSize: '5rem', color: (t) => t.palette.brand.milho, opacity: 0.4 }}>Z</Typography>
            <Typography sx={{ position: 'absolute', bottom: 16, left: 16, right: 16, fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.62rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Foto do grupo — placeholder
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Team */}
      <Box sx={{ backgroundColor: (t) => t.palette.surface.sunken, px: { xs: 3, md: 7 }, py: { xs: 6, md: 8 } }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
          <Typography variant="h3" sx={{ mb: 0.5 }}>Quem fez</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Turma de TCC do IMT, sob orientação dos Profs. Alexsander Tressino de Carvalho e Gabriel de Souza Lima.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(5,1fr)' }, gap: 2 }}>
            {team.map((m) => (
              <Box key={m.name} sx={{ backgroundColor: 'background.paper', borderRadius: 3, p: 2, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ aspectRatio: '1', borderRadius: 2, background: 'linear-gradient(160deg,#74C69D,#1F5A3D)', display: 'grid', placeItems: 'center', mb: 1.5, color: (t) => t.palette.brand.milho, fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '1.8rem' }}>
                  {m.name.charAt(0)}
                </Box>
                <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.2 }}>
                  {m.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">{m.role}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Timeline */}
      <Box sx={{ px: { xs: 3, md: 7 }, py: { xs: 6, md: 8 }, maxWidth: 1100, mx: 'auto' }}>
        <Typography variant="h3" sx={{ mb: 4 }}>Marcos</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 3 }}>
          {timeline.map((t, i) => (
            <Box key={t.tag}>
              <Box sx={{ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', mb: 1.5, fontFamily: (th) => th.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '0.8rem', bgcolor: t.star ? 'secondary.main' : 'primary.main', color: t.star ? '#fff' : (th) => th.palette.brand.milho }}>
                {t.star ? '★' : i + 1}
              </Box>
              <Typography sx={{ fontFamily: (th) => th.typography.fontFamilyMono, fontSize: '0.7rem', color: 'secondary.main', fontWeight: 700 }}>{t.tag}</Typography>
              <Typography sx={{ fontFamily: (th) => th.typography.fontFamilyDisplay, fontWeight: 600, fontSize: '0.95rem', mt: 0.25 }}>{t.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>{t.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ODS */}
      <Box sx={{ backgroundColor: 'primary.main', color: (t) => t.palette.brand.creme, px: { xs: 3, md: 7 }, py: { xs: 6, md: 8 } }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: (t) => t.palette.brand.milho, mb: 1 }}>
            Impacto
          </Typography>
          <Typography variant="h3" sx={{ color: (t) => t.palette.brand.milho, mb: 3 }}>Ligações com ODS</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 3 }}>
            {ods.map((o) => (
              <Box key={o.num}>
                <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '3rem', color: (t) => t.palette.brand.milho, lineHeight: 1 }}>{o.num}</Typography>
                <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontSize: '1.05rem', mt: 1, mb: 0.5 }}>{o.title}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.85, lineHeight: 1.5 }}>{o.desc}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Acknowledgements + CTA */}
      <Box sx={{ px: 3, py: { xs: 7, md: 9 }, textAlign: 'center', maxWidth: 720, mx: 'auto' }}>
        <Selo style={{ width: 80, height: 80, margin: '0 auto 16px' }} />
        <Typography variant="h3" sx={{ mb: 1 }}>Experimenta o Zé.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Instituto Mauá de Tecnologia · 2026 · Licença MIT.
        </Typography>
        <Button component={Link} to="/chat" variant="contained" color="secondary" size="large" startIcon={<Camera size={20} />}>
          {copy.cta.sendPhoto}
        </Button>
      </Box>
    </Box>
  );
}

export default AboutPage;
