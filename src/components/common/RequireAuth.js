import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoadingState } from "./Page";
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingState label="Conferindo sua sessão…" />;
  if (!user)
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname + location.search,
          fromState: location.state,
        }}
      />
    );
  return children;
}
