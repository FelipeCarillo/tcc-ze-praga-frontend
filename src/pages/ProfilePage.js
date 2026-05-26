import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { ClipboardList, CreditCard, Moon, KeyRound, LogOut, Plus, Trash2, Pencil } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useColorMode } from '../hooks/useColorMode';
import { FeatureGate } from '../components/FeatureGate';
import { PLAN_DETAILS } from '../services/subscriptionService';
import { getDiagnoses } from '../services/historyService';
import { listTalhoes, createTalhao, deleteTalhao } from '../services/talhoesService';

function StatCell({ value, label }) {
  return (
    <Box sx={{ backgroundColor: 'primary.main', textAlign: 'center', py: 1.5 }}>
      <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '1.4rem', color: (t) => t.palette.brand.milho, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.58rem', color: 'rgba(240,237,226,0.7)', mt: 0.5, textTransform: 'uppercase' }}>
        {label}
      </Typography>
    </Box>
  );
}

function ShortcutRow({ icon, title, right, onClick, to }) {
  const Comp = to ? Link : 'div';
  return (
    <Box
      component={Comp}
      to={to}
      onClick={onClick}
      sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper', textDecoration: 'none', color: 'text.primary', cursor: 'pointer', '&:hover': { borderColor: 'primary.light' } }}
    >
      <Box sx={{ width: 32, height: 32, borderRadius: 2, display: 'grid', placeItems: 'center', backgroundColor: (t) => t.palette.surface.sunken, color: 'primary.main' }}>
        {icon}
      </Box>
      <Typography sx={{ flex: 1, fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '0.9rem' }}>{title}</Typography>
      {right}
    </Box>
  );
}

function TalhoesSection() {
  const [talhoes, setTalhoes] = useState([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ nome: '', hectares: '', cultura: 'soja' });

  const reload = useCallback(() => { listTalhoes().then(setTalhoes); }, []);
  useEffect(() => { reload(); }, [reload]);

  const add = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) return;
    await createTalhao(form);
    setForm({ nome: '', hectares: '', cultura: 'soja' });
    setAdding(false);
    reload();
  };
  const remove = async (id) => { await deleteTalhao(id); reload(); };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Typography sx={{ flex: 1, fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary' }}>
          Meus talhões
        </Typography>
        <IconButton size="small" onClick={() => setAdding((v) => !v)} aria-label="Adicionar talhão" sx={{ bgcolor: 'secondary.main', color: '#fff', '&:hover': { bgcolor: 'secondary.dark' } }}>
          <Plus size={16} />
        </IconButton>
      </Box>

      <Collapse in={adding}>
        <Box component="form" onSubmit={add} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, mb: 1.5, borderRadius: 2.5, backgroundColor: (t) => t.palette.surface.sunken }}>
          <TextField size="small" label="Nome / apelido do talhão" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
          <TextField size="small" label="Hectares" type="number" value={form.hectares} onChange={(e) => setForm((f) => ({ ...f, hectares: e.target.value }))} />
          <Button type="submit" variant="contained" color="secondary" size="small">Salvar talhão</Button>
        </Box>
      </Collapse>

      {talhoes.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          Nenhum talhão ainda. Cadastra um pra eu agrupar seus diagnósticos por área.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {talhoes.map((t) => (
            <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'linear-gradient(160deg,#74C69D,#1F5A3D)', flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: (th) => th.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '0.88rem' }} noWrap>{t.nome}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {[t.hectares ? `${t.hectares} ha` : null, t.cultura].filter(Boolean).join(' · ')}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => remove(t.id)} aria-label="Remover" sx={{ color: 'text.secondary' }}>
                <Trash2 size={16} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

function ProfilePage() {
  const { user, loading, updateProfile, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [diagCount, setDiagCount] = useState(0);
  const [talhoesCount, setTalhoesCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true, state: { from: '/perfil' } });
  }, [loading, navigate, user]);

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name || '', email: user.email || '' });
  }, [user]);

  useEffect(() => {
    getDiagnoses().then((d) => setDiagCount(d.length)).catch(() => {});
    listTalhoes().then((t) => setTalhoesCount(t.length)).catch(() => {});
  }, []);

  if (loading || !user) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  const subscription = user.subscription?.is_active ? user.subscription : null;
  const planTitle = subscription ? (PLAN_DETAILS[subscription.plan.name]?.title || subscription.plan.display_name) : 'Grátis';
  const isSupporter = !!subscription;
  const initial = (user.full_name || user.email || 'Z').trim().charAt(0).toUpperCase();

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateProfile(form);
      setMessage('Pronto, atualizei aqui.');
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', pb: 4 }}>
      {/* Header mata */}
      <Box sx={{ background: 'linear-gradient(180deg, #1F5A3D, #0F3D27)', color: (t) => t.palette.brand.creme, px: { xs: 2.5, md: 3 }, pt: 4, pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: (t) => t.palette.brand.milho, color: 'primary.main', display: 'grid', placeItems: 'center', fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '1.6rem' }}>
            {initial}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 700, fontSize: '1.2rem', color: (t) => t.palette.brand.milho, lineHeight: 1.1 }} noWrap>
              {user.full_name || 'Compadre'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }} noWrap component="div">{user.email}</Typography>
            {isSupporter && (
              <Box sx={{ display: 'inline-flex', mt: 0.75, px: 1, py: 0.25, borderRadius: 999, bgcolor: 'secondary.main', color: '#fff', fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.58rem', fontWeight: 700 }}>
                ★ {planTitle.replace(/^Plano\s+/, '').toUpperCase()}
              </Box>
            )}
          </Box>
          <IconButton onClick={() => setEditing((v) => !v)} aria-label="Editar perfil" sx={{ color: (t) => t.palette.brand.milho }}>
            <Pencil size={18} />
          </IconButton>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', borderRadius: '10px 10px 0 0', overflow: 'hidden', backgroundColor: 'rgba(244,201,93,0.18)' }}>
          <StatCell value={diagCount} label="diagnósticos" />
          <StatCell value={talhoesCount} label="talhões" />
          <StatCell value={planTitle.replace(/^Plano\s+/, '')} label="plano" />
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 3 }, pt: 3 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        <Collapse in={editing}>
          <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <TextField size="small" label="Nome" name="full_name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
            <TextField size="small" label="E-mail" name="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Button type="submit" variant="contained" color="secondary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</Button>
          </Box>
        </Collapse>

        {/* Produção */}
        <Box sx={{ mb: 3 }}>
          <TalhoesSection />
        </Box>

        {/* Conta */}
        <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', mb: 1.5 }}>Conta</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <ShortcutRow icon={<ClipboardList size={16} />} title="Histórico completo" to="/historico" />
          <ShortcutRow icon={<CreditCard size={16} />} title={subscription ? 'Plano e cobrança' : 'Ver planos'} to="/planos" />
          <FeatureGate feature="api_access">
            <ShortcutRow icon={<KeyRound size={16} />} title="API keys" to="/api-docs" />
          </FeatureGate>
          <ShortcutRow
            icon={<Moon size={16} />}
            title="Modo noite"
            onClick={toggleColorMode}
            right={<Switch checked={mode === 'dark'} onChange={toggleColorMode} size="small" onClick={(e) => e.stopPropagation()} />}
          />
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button onClick={() => { logout(); navigate('/'); }} startIcon={<LogOut size={16} />} color="error" sx={{ fontWeight: 600 }}>
            Encerrar sessão
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ProfilePage;
