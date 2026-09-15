import { useEffect, useState, useCallback } from "react";
import { getActionPlan } from "../services/actionPlanService";
export function useActionPlan(diseaseId, enabled = true) {
  const [state, setState] = useState({
    id: null,
    actionPlan: null,
    loading: false,
    error: null,
  });
  const [version, setVersion] = useState(0);
  const retry = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let cancelled = false;
    setState({
      id: diseaseId,
      actionPlan: null,
      loading: !!diseaseId && enabled,
      error: null,
    });
    if (!diseaseId || !enabled) return undefined;
    getActionPlan(diseaseId)
      .then((actionPlan) => {
        if (!cancelled)
          setState({ id: diseaseId, actionPlan, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled)
          setState({ id: diseaseId, actionPlan: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
  }, [diseaseId, enabled, version]);
  return {
    ...(state.id === diseaseId
      ? state
      : { actionPlan: null, loading: !!diseaseId && enabled, error: null }),
    retry,
  };
}
export default useActionPlan;
