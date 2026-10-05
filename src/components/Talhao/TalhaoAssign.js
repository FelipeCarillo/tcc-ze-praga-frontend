import React, { useEffect, useState } from "react";
import { MenuItem, Stack, TextField, Typography } from "@mui/material";
import { MapPin } from "lucide-react";
import { listTalhoes } from "../../services/talhoesService";
import { setDiagnosisTalhao } from "../../services/historyService";

const NONE = "__sem_talhao__";

/**
 * Talhão de um laudo já feito, com troca na hora (TCC-093).
 * Serve para corrigir a foto mandada com o talhão errado selecionado.
 */
export default function TalhaoAssign({ diagnosis, onChange }) {
  const [talhoes, setTalhoes] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    listTalhoes()
      .then((list) => alive && setTalhoes(list))
      .catch(() => alive && setTalhoes([]));
    return () => {
      alive = false;
    };
  }, []);

  const value =
    diagnosis.talhaoId && talhoes?.some((t) => t.id === diagnosis.talhaoId)
      ? diagnosis.talhaoId
      : NONE;

  const move = async (next) => {
    const talhao =
      next === NONE ? null : talhoes.find((t) => t.id === next) || null;
    setSaving(true);
    setError("");
    try {
      const updated = await setDiagnosisTalhao(diagnosis.id, talhao);
      onChange?.({
        ...diagnosis,
        ...(updated || {}),
        talhaoId: talhao?.id ?? null,
        talhaoNome: talhao?.nome ?? null,
      });
    } catch {
      setError("Não foi possível mudar o talhão. Tente de novo.");
    } finally {
      setSaving(false);
    }
  };

  if (talhoes && !talhoes.length && !diagnosis.talhaoId) return null;

  return (
    <Stack gap={0.5} sx={{ mb: 3, maxWidth: 360 }}>
      <TextField
        select
        size="small"
        label="Talhão deste laudo"
        value={talhoes ? value : NONE}
        disabled={!talhoes || saving}
        onChange={(e) => move(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <MapPin size={16} style={{ marginRight: 8 }} aria-hidden="true" />
            ),
          },
        }}
      >
        {(talhoes || []).map((t) => (
          <MenuItem key={t.id} value={t.id}>
            {t.nome}
          </MenuItem>
        ))}
        <MenuItem value={NONE}>Sem talhão</MenuItem>
      </TextField>
      {saving && (
        <Typography variant="caption" color="text.secondary" role="status">
          Salvando…
        </Typography>
      )}
      {error && (
        <Typography variant="caption" color="error" role="alert">
          {error}
        </Typography>
      )}
    </Stack>
  );
}
