import { useState, useEffect, useCallback } from 'react';
import { getDiagnoses, deleteDiagnosis } from '../services/historyService';

function useHistory() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDiagnoses();
      setDiagnoses(data);
    } catch {
      setError('Erro ao carregar historico.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(async (id) => {
    try {
      await deleteDiagnosis(id);
      setDiagnoses((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError('Erro ao remover diagnostico.');
    }
  }, []);

  return { diagnoses, loading, error, reload: load, remove };
}

export default useHistory;
