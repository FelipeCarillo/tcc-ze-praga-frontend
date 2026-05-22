import React, { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { MessageCircle, ScanLine } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUsageSummary } from '../../services/usageService';

/**
 * Color-codes a single feature's usage:
 *   - default  : under 50%
 *   - warning  : 50%-79%
 *   - danger   : 80%-99%
 *   - error    : >= 100%
 */
function chipColor(used, limit) {
  if (limit === null || limit === undefined || limit === 0) return 'default';
  const ratio = used / limit;
  if (ratio >= 1) return 'error';
  if (ratio >= 0.8) return 'warning';
  if (ratio >= 0.5) return 'info';
  return 'success';
}

function formatCounter(feature) {
  if (!feature) return null;
  const limit = feature.limit;
  if (limit === null || limit === undefined) return `${feature.used} (ilimitado)`;
  return `${feature.used}/${limit}`;
}

function QuotaDisplay() {
  const { user } = useAuth();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setUsage(null);
      return;
    }
    setLoading(true);
    try {
      const data = await getUsageSummary();
      setUsage(data);
    } catch {
      // Keep stale data silently; the modal/handlers cover the user-facing flow.
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('quota-updated', handler);
    window.addEventListener('quota-exceeded', handler);
    return () => {
      window.removeEventListener('quota-updated', handler);
      window.removeEventListener('quota-exceeded', handler);
    };
  }, [refresh]);

  if (!user || !usage) return null;

  const chat = usage.chat;
  const inference = usage.inference;

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mr: 0.5 }}
      data-testid="quota-display"
    >
      <Tooltip title="Mensagens de chat hoje · reseta diariamente">
        <Chip
          icon={<MessageCircle size={14} />}
          label={`Chat ${formatCounter(chat)}`}
          color={chipColor(chat?.used, chat?.limit)}
          size="small"
          variant="outlined"
          data-testid="quota-chip-chat"
          aria-busy={loading || undefined}
        />
      </Tooltip>
      <Tooltip title="Inferências hoje · reseta diariamente">
        <Chip
          icon={<ScanLine size={14} />}
          label={`Inferência ${formatCounter(inference)}`}
          color={chipColor(inference?.used, inference?.limit)}
          size="small"
          variant="outlined"
          data-testid="quota-chip-inference"
          aria-busy={loading || undefined}
        />
      </Tooltip>
    </Box>
  );
}

export default QuotaDisplay;
