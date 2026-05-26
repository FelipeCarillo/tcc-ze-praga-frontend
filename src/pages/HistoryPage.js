import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import InputBase from '@mui/material/InputBase';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Share2, CheckSquare, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import useHistory from '../hooks/useHistory';
import { FeatureGate } from '../components/FeatureGate';
import HistoryItem from '../components/History/HistoryItem';
import EmptyState from '../components/History/EmptyState';
import { copy } from '../copy/ze';

const FILTERS = [
  { key: 'all', label: 'Tudo' },
  { key: 'alta', label: 'Severa', token: 'alta' },
  { key: 'media', label: 'Moderada', token: 'media' },
  { key: 'baixa', label: 'Leve', token: 'baixa' },
  { key: 'nenhuma', label: 'Saudável', token: 'nenhuma' },
];

const SEV_LABELS = { alta: 'Severa', media: 'Moderada', baixa: 'Leve', nenhuma: 'Saudável' };

function dayLabel(ts) {
  const d = new Date(ts);
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diff = (startOf(new Date()) - startOf(d)) / 86400000;
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function groupByDay(list) {
  const groups = [];
  const map = new Map();
  list.forEach((d) => {
    const k = dayLabel(d.timestamp);
    if (!map.has(k)) {
      const bucket = [];
      map.set(k, bucket);
      groups.push({ label: k, items: bucket });
    }
    map.get(k).push(d);
  });
  return groups;
}

function exportPdf(list) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(20);
  doc.setTextColor(31, 90, 61);
  doc.text('Zé Praga — Relatório de Diagnósticos', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} · ${list.length} diagnóstico(s)`, pageWidth / 2, 28, { align: 'center' });

  doc.autoTable({
    startY: 40,
    head: [['#', 'Praga', 'Científico', 'Confiança', 'Severidade', 'Data']],
    body: list.map((d, i) => [
      i + 1,
      d.disease || '-',
      d.scientificName || '-',
      `${(d.confidence * 100).toFixed(1)}%`,
      SEV_LABELS[d.severity] || d.severity,
      new Date(d.timestamp).toLocaleDateString('pt-BR'),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [31, 90, 61], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
  });

  doc.save(`ze-praga-relatorio-${new Date().toISOString().split('T')[0]}.pdf`);
}

function HistoryPage() {
  const navigate = useNavigate();
  const { diagnoses, loading, error, remove, clearAll } = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSeverity, setActiveSeverity] = useState('all');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const counts = useMemo(() => {
    const c = { all: diagnoses.length };
    for (const d of diagnoses) c[d.severity] = (c[d.severity] || 0) + 1;
    return c;
  }, [diagnoses]);

  const filtered = useMemo(() => {
    let result = diagnoses;
    if (activeSeverity !== 'all') result = result.filter((d) => d.severity === activeSeverity);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) => (d.disease || '').toLowerCase().includes(q) || (d.scientificName || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [diagnoses, activeSeverity, searchQuery]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const exitSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const selectedList = filtered.filter((d) => selectedIds.has(d.id));

  const handleDeleteSelected = async () => {
    for (const d of selectedList) await remove(d.id);
    exitSelection();
  };

  const handleClearAll = () => {
    if (clearAll) clearAll();
    setClearDialogOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2, md: 3 }, py: 3, pb: selectionMode ? 12 : 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.25 }}>
        <Box>
          <Typography variant="h3">{copy.history.title}</Typography>
          {diagnoses.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {diagnoses.length} diagnóstico{diagnoses.length > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
        {diagnoses.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <FeatureGate feature="export_diagnoses">
              <IconButton onClick={() => exportPdf(filtered)} size="small" aria-label="Exportar PDF" sx={{ color: 'text.secondary' }}>
                <Share2 size={18} />
              </IconButton>
            </FeatureGate>
            <IconButton onClick={() => setSelectionMode((v) => !v)} size="small" aria-label="Selecionar" sx={{ color: selectionMode ? 'primary.main' : 'text.secondary' }}>
              <CheckSquare size={18} />
            </IconButton>
            <IconButton onClick={() => setClearDialogOpen(true)} size="small" aria-label="Limpar histórico" sx={{ color: 'text.secondary' }}>
              <Trash2 size={18} />
            </IconButton>
          </Box>
        )}
      </Box>

      {diagnoses.length > 0 && (
        <>
          {/* Search */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 1.5, px: 1.5, py: 0.75, borderRadius: 999, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Search size={16} />
            <InputBase fullWidth placeholder="Buscar praga…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ fontSize: '0.875rem' }} />
          </Box>

          {/* Filter chips */}
          <Box sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', pb: 1, mb: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
            {FILTERS.map((f) => {
              const active = activeSeverity === f.key;
              const count = counts[f.key] || 0;
              if (f.key !== 'all' && count === 0) return null;
              return (
                <Box
                  key={f.key}
                  onClick={() => setActiveSeverity(f.key)}
                  sx={{
                    whiteSpace: 'nowrap',
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 999,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    bgcolor: active ? (f.token ? (t) => `${t.palette.severity[f.token]}22` : 'primary.main') : (t) => t.palette.surface.sunken,
                    color: active ? (f.token ? (t) => t.palette.severity[f.token] : (t) => t.palette.brand.milho) : 'text.secondary',
                  }}
                >
                  {f.token ? '● ' : ''}{f.label} · {count}
                </Box>
              );
            })}
          </Box>
        </>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && diagnoses.length === 0 && <EmptyState />}

      {!loading && diagnoses.length > 0 && filtered.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          Nada encontrado com esse filtro.
        </Typography>
      )}

      {!loading &&
        groups.map((g) => (
          <Box key={g.label} sx={{ mb: 2 }}>
            <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', mb: 1 }}>
              {g.label}
            </Typography>
            {g.items.map((d) => (
              <HistoryItem
                key={d.id}
                diagnosis={d}
                selectionMode={selectionMode}
                selected={selectedIds.has(d.id)}
                onToggle={toggleSelect}
                onOpen={(id) => navigate(`/historico/${id}`)}
              />
            ))}
          </Box>
        ))}

      {/* Selection bar */}
      {selectionMode && selectedIds.size > 0 && (
        <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: (t) => t.zIndex.appBar + 2, backgroundColor: 'primary.main', color: (t) => t.palette.brand.milho, px: 2, py: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom))', display: 'flex', alignItems: 'center', gap: 1.5, maxWidth: 760, mx: 'auto' }}>
          <IconButton onClick={exitSelection} size="small" sx={{ color: (t) => t.palette.brand.milho }}>
            <X size={18} />
          </IconButton>
          <Typography sx={{ flex: 1, fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700 }}>
            {selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''}
          </Typography>
          <Button onClick={() => exportPdf(selectedList)} startIcon={<Share2 size={16} />} sx={{ color: (t) => t.palette.brand.milho }}>
            Exportar
          </Button>
          <Button onClick={handleDeleteSelected} startIcon={<Trash2 size={16} />} sx={{ color: '#fff' }}>
            Apagar
          </Button>
        </Box>
      )}

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay }}>Limpar histórico</DialogTitle>
        <DialogContent>
          <DialogContentText>{copy.feedback.clearHistoryConfirm}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleClearAll} color="error" variant="contained">
            Jogar fora tudo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HistoryPage;
