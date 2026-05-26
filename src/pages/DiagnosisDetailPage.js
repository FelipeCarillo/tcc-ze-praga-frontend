import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Drawer from '@mui/material/Drawer';
import { ChevronLeft, Share2, FileText, MessageCircle, Link2, ThumbsDown, Camera } from 'lucide-react';
import { ReactComponent as Marca } from '../assets/brand/marca.svg';
import ConfidenceBar from '../components/Diagnosis/ConfidenceBar';
import ActionPlan from '../components/Diagnosis/ActionPlan';
import { getDiagnosisById } from '../services/historyService';
import { exportDiagnosisPdf } from '../services/pdfExport';

const SEV = {
  alta: { label: 'Severa', token: 'alta' },
  media: { label: 'Moderada', token: 'media' },
  baixa: { label: 'Leve', token: 'baixa' },
  nenhuma: { label: 'Saudável', token: 'nenhuma' },
};

function HeroPhoto({ result, onBack, onExport }) {
  return (
    <Box sx={{ position: 'relative', height: { xs: 220, md: 280 } }}>
      {result.imageUrl ? (
        <Box component="img" src={result.imageUrl} alt="Folha analisada" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <Box sx={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#74C69D,#1F5A3D)' }} />
      )}
      <IconButton onClick={onBack} aria-label="Voltar" sx={{ position: 'absolute', top: 14, left: 14, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' } }}>
        <ChevronLeft size={20} />
      </IconButton>
      <IconButton onClick={onExport} aria-label="Exportar" sx={{ position: 'absolute', top: 14, right: 14, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' } }}>
        <Share2 size={18} />
      </IconButton>
    </Box>
  );
}

function ZeExplains({ description }) {
  if (!description) return null;
  return (
    <Box sx={{ backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2, mt: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box sx={{ width: 24, height: 24, borderRadius: '7px', overflow: 'hidden' }}>
          <Marca style={{ width: 24, height: 24, display: 'block' }} />
        </Box>
        <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyHand, color: 'secondary.main', fontSize: '1.1rem' }}>
          — Como eu cheguei nisso
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
        {description}
      </Typography>
    </Box>
  );
}

function Alternatives({ top3, onNotMatch }) {
  const alts = (top3 || []).slice(1);
  if (alts.length === 0) return null;
  return (
    <Box sx={{ mt: 2.5 }}>
      <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 600, fontSize: '1rem', mb: 1 }}>
        Pode ser outra coisa?
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {alts.map((alt, i) => (
          <Box key={alt.diseaseId || i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ flex: 1 }}>{alt.disease}</Typography>
            <Box sx={{ width: 70, height: 4, bgcolor: 'rgba(28,42,32,0.06)', borderRadius: 999, overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${Math.min(alt.confidence * 100, 100)}%`, bgcolor: 'secondary.main' }} />
            </Box>
            <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.7rem', color: 'text.secondary', minWidth: 44, textAlign: 'right' }}>
              {(alt.confidence * 100).toFixed(1)}%
            </Typography>
          </Box>
        ))}
      </Box>
      <Button onClick={onNotMatch} size="small" startIcon={<ThumbsDown size={14} />} sx={{ mt: 1, color: 'text.secondary' }}>
        Não bate com o que vejo
      </Button>
    </Box>
  );
}

function ExportSheet({ open, onClose, result, onPdf, onCopyLink }) {
  const items = [
    { icon: <FileText size={18} />, title: 'PDF do diagnóstico', desc: 'Com selo Zé Praga + IMT pra mostrar pro agrônomo', onClick: onPdf, bg: 'primary.main', color: (t) => t.palette.brand.milho },
    {
      icon: <MessageCircle size={18} />,
      title: 'WhatsApp',
      desc: 'Mandar resumo pra alguém',
      onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(`Diagnóstico Zé Praga: ${result.disease} (${(result.confidence * 100).toFixed(0)}%)`)}`, '_blank'),
      bg: '#25D366',
      color: '#fff',
    },
    { icon: <Link2 size={18} />, title: 'Copiar link', desc: 'Link desta página', onClick: onCopyLink, bg: 'rgba(28,42,32,0.12)', color: 'text.primary' },
  ];
  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: { borderRadius: '22px 22px 0 0', p: 2.5, maxWidth: 560, mx: 'auto' } } }}>
      <Box sx={{ width: 36, height: 4, bgcolor: 'divider', borderRadius: 999, mx: 'auto', mb: 2 }} />
      <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '1.1rem', mb: 1.5 }}>
        Exportar diagnóstico
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map((it) => (
          <Box
            key={it.title}
            onClick={() => { it.onClick(); }}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2.5, cursor: 'pointer', backgroundColor: (t) => t.palette.surface.sunken, '&:hover': { backgroundColor: 'action.hover' } }}
          >
            <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: it.bg, color: it.color }}>
              {it.icon}
            </Box>
            <Box>
              <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '0.9rem' }}>{it.title}</Typography>
              <Typography variant="caption" color="text.secondary">{it.desc}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Drawer>
  );
}

function DiagnosisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    async function load() {
      try {
        const data = await getDiagnosisById(id);
        if (!data) setError('Diagnóstico não encontrado.');
        else setDiagnosis(data);
      } catch {
        setError('Erro ao carregar diagnóstico.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handlePdf = () => {
    exportDiagnosisPdf(diagnosis);
    setSheetOpen(false);
  };
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setSnackbar({ open: true, message: 'Link copiado.' });
    } catch {
      setSnackbar({ open: true, message: 'Não consegui copiar o link.' });
    }
    setSheetOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Button startIcon={<ChevronLeft size={18} />} onClick={() => navigate('/historico')} sx={{ mb: 2, color: 'text.secondary' }}>
          Voltar ao histórico
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const sev = SEV[diagnosis.severity] || SEV.media;
  const dateStr = diagnosis.timestamp
    ? new Date(diagnosis.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <Box sx={{ width: '100%', backgroundColor: 'background.paper', minHeight: '100%' }}>
      <HeroPhoto result={diagnosis} onBack={() => navigate('/historico')} onExport={() => setSheetOpen(true)} />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box sx={{ display: 'inline-flex', px: 1, py: 0.25, borderRadius: 999, fontSize: '0.66rem', fontWeight: 700, bgcolor: (t) => `${t.palette.severity[sev.token]}22`, color: (t) => t.palette.severity[sev.token] }}>
            ● {sev.label.toUpperCase()}
          </Box>
          {dateStr && (
            <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.7rem', color: 'text.secondary' }}>{dateStr}</Typography>
          )}
        </Box>

        <Typography variant="h3" sx={{ mb: 0.25 }}>{diagnosis.disease}</Typography>
        {diagnosis.scientificName && (
          <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.72rem', color: 'text.secondary', mb: 1.5 }}>
            {diagnosis.scientificName}
          </Typography>
        )}

        <ConfidenceBar confidence={diagnosis.confidence} />

        {diagnosis.actionPlan && (
          <Box sx={{ mt: 2.5 }}>
            <ActionPlan actions={diagnosis.actionPlan} />
          </Box>
        )}

        <ZeExplains description={diagnosis.description} />

        <Alternatives top3={diagnosis.top3} onNotMatch={() => setSnackbar({ open: true, message: 'Valeu pelo retorno — vou aprender com isso.' })} />

        <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
          <Button component="a" href="/chat" variant="outlined" startIcon={<Camera size={18} />} sx={{ flex: 1, borderColor: 'divider', color: 'text.primary' }}>
            Foto-controle
          </Button>
          <Button onClick={() => setSheetOpen(true)} variant="contained" color="secondary" startIcon={<Share2 size={18} />} sx={{ flex: 1 }}>
            Exportar
          </Button>
        </Box>
      </Box>

      <ExportSheet open={sheetOpen} onClose={() => setSheetOpen(false)} result={diagnosis} onPdf={handlePdf} onCopyLink={handleCopyLink} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snackbar.message}
      />
    </Box>
  );
}

export default DiagnosisDetailPage;
