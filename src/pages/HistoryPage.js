import React, { useState, useMemo } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import { Search, Trash2, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import HistoryList from '../components/History/HistoryList';
import useHistory from '../hooks/useHistory';
import { useDarkMode } from '../hooks/useDarkMode';

const severityFilters = [
  { key: 'all', label: 'Todos' },
  { key: 'alta', label: 'Severa', color: '#E63946' },
  { key: 'media', label: 'Moderada', color: '#F4A261' },
  { key: 'baixa', label: 'Leve', color: '#52B788' },
  { key: 'nenhuma', label: 'Saudável', color: '#52B788' },
];

function HistoryPage() {
  const isDark = useDarkMode();
  const { diagnoses, loading, error, remove, clearAll } = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSeverity, setActiveSeverity] = useState('all');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const filteredDiagnoses = useMemo(() => {
    let result = diagnoses;

    if (activeSeverity !== 'all') {
      result = result.filter((d) => d.severity === activeSeverity);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          (d.disease || '').toLowerCase().includes(query) ||
          (d.scientificName || '').toLowerCase().includes(query)
      );
    }

    return result;
  }, [diagnoses, activeSeverity, searchQuery]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(45, 106, 79);
    doc.text('Zé Praga — Relatório de Diagnósticos', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, 28, { align: 'center' });
    doc.text(`Total de diagnósticos: ${filteredDiagnoses.length}`, pageWidth / 2, 34, { align: 'center' });

    // Table
    const severityLabels = { alta: 'Severa', media: 'Moderada', baixa: 'Leve', nenhuma: 'Saudável' };
    const tableData = filteredDiagnoses.map((d, i) => [
      i + 1,
      d.disease || '-',
      d.scientificName || '-',
      `${(d.confidence * 100).toFixed(1)}%`,
      severityLabels[d.severity] || d.severity,
      new Date(d.timestamp).toLocaleDateString('pt-BR'),
    ]);

    doc.autoTable({
      startY: 42,
      head: [['#', 'Doença', 'Nome Científico', 'Confiança', 'Severidade', 'Data']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [45, 106, 79], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
      },
    });

    // Action Plans
    filteredDiagnoses.forEach((d) => {
      if (d.actionPlan?.essencial) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(45, 106, 79);
        doc.text(`Plano de Ação — ${d.disease}`, 14, 20);

        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text(`${d.scientificName || ''} | Confiança: ${(d.confidence * 100).toFixed(1)}% | ${new Date(d.timestamp).toLocaleDateString('pt-BR')}`, 14, 27);

        let y = 35;
        doc.setFontSize(11);
        doc.setTextColor(45, 106, 79);
        doc.text('Ações Essenciais:', 14, y);
        y += 7;
        doc.setFontSize(9);
        doc.setTextColor(26, 26, 46);
        d.actionPlan.essencial.forEach((action) => {
          const lines = doc.splitTextToSize(`• ${action}`, pageWidth - 28);
          if (y + lines.length * 5 > 280) { doc.addPage(); y = 20; }
          doc.text(lines, 14, y);
          y += lines.length * 5 + 2;
        });
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Zé Praga — Diagnóstico Fitossanitário Inteligente | Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`ze-praga-relatorio-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleClearAll = () => {
    if (clearAll) {
      clearAll();
    }
    setClearDialogOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Histórico de Diagnósticos
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {diagnoses.length > 0 && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<Download size={16} />}
              onClick={handleExportPDF}
              sx={{ fontWeight: 500 }}
            >
              Exportar PDF
            </Button>
          )}
          {diagnoses.length > 0 && (
            <Button
              size="small"
              color="error"
              startIcon={<Trash2 size={16} />}
              onClick={() => setClearDialogOpen(true)}
              sx={{ fontWeight: 500 }}
            >
              Limpar
            </Button>
          )}
        </Box>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Seus diagnósticos anteriores.
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder="Buscar diagnóstico..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            backgroundColor: isDark ? '#132218' : '#FFFFFF',
            color: isDark ? '#E8F5E9' : 'inherit',
            '& input::placeholder': {
              color: isDark ? '#9CA3AF' : 'inherit',
              opacity: 1,
            },
            '& fieldset': {
              borderColor: isDark ? '#2D3B35' : '#E5E7EB',
            },
            '&:hover fieldset': {
              borderColor: isDark ? '#52B788' : '#2D6A4F',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {severityFilters.map((filter) => (
          <Chip
            key={filter.key}
            label={filter.label}
            onClick={() => setActiveSeverity(filter.key)}
            variant={activeSeverity === filter.key ? 'filled' : 'outlined'}
            sx={{
              fontWeight: 500,
              ...(activeSeverity === filter.key && filter.color
                ? {
                    backgroundColor: filter.color,
                    color: '#FFFFFF',
                    '&:hover': { backgroundColor: filter.color },
                  }
                : activeSeverity === filter.key
                ? {
                    backgroundColor: 'primary.main',
                    color: '#FFFFFF',
                    '&:hover': { backgroundColor: 'primary.dark' },
                  }
                : {
                    borderColor: isDark ? '#2D3B35' : '#E5E7EB',
                    color: isDark ? '#E8F5E9' : 'text.primary',
                    backgroundColor: isDark ? '#132218' : 'transparent',
                    '&:hover': { borderColor: 'primary.light' },
                  }),
            }}
          />
        ))}
      </Box>

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

      {!loading && <HistoryList diagnoses={filteredDiagnoses} onDelete={remove} />}

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Limpar histórico</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja limpar todo o histórico de diagnósticos? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleClearAll} color="error" variant="contained">
            Limpar tudo
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default HistoryPage;
