import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { MotionConfig } from "framer-motion";
import { AuthContext } from "./AuthContext";
import { FeaturesProvider } from "./contexts/FeaturesContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import NavigationEffects from "./components/common/NavigationEffects";
import RequireAuth from "./components/common/RequireAuth";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./components/Layout/Layout";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import HistoryPage from "./pages/HistoryPage";
import DiagnosisDetailPage from "./pages/DiagnosisDetailPage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PlansPage from "./pages/PlansPage";
import PaymentPage from "./pages/PaymentPage";
import ProfilePage from "./pages/ProfilePage";
import QuotaExceededModal from "./components/common/QuotaExceededModal";
import InstallPrompt from "./components/common/InstallPrompt";
import * as authService from "./services/authService";

// Páginas institucionais / pesadas: carregadas sob demanda (auditoria, seção 21).
const ApiDocsPage = lazy(() => import("./pages/ApiDocsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ModelsPage = lazy(() => import("./pages/ModelsPage"));

function PageLoader() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

function AuthExpiredListener({ onExpired }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = () => {
      onExpired();
      navigate("/login", { replace: true, state: { from: location.pathname + location.search } });
    };
    window.addEventListener("auth-expired", handler);
    return () => window.removeEventListener("auth-expired", handler);
  }, [navigate, onExpired, location.pathname, location.search]);

  return null;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getSession()
      .then((session) => setUser(session?.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (values) => {
    const session = await authService.login(values);
    setUser(session.user);
  }, []);

  const register = useCallback(async (values) => {
    const session = await authService.register(values);
    // Com verificação de e-mail ligada não há sessão ainda — a conta só é
    // ativada pelo link. Devolvemos o resultado pra tela decidir o que mostrar.
    if (session.pendingVerification) return session;
    setUser(session.user);
    return session;
  }, []);

  const updateProfile = useCallback(async (values) => {
    const session = await authService.updateProfile(values);
    setUser(session.user);
  }, []);

  const syncUser = useCallback((nextUser) => {
    const session = authService.saveCurrentUser(nextUser);
    setUser(session.user);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const clearUserOnExpired = useCallback(() => setUser(null), []);

  const auth = useMemo(
    () => ({ user, loading, login, register, updateProfile, syncUser, logout }),
    [loading, login, logout, register, syncUser, updateProfile, user],
  );

  return (
    <AuthContext.Provider value={auth}>
      <FeaturesProvider>
        <MotionConfig reducedMotion="user">
          <ErrorBoundary>
            <BrowserRouter>
              <NavigationEffects />
              <AuthExpiredListener onExpired={clearUserOnExpired} />
              <QuotaExceededModal />
              <InstallPrompt />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Layout>
                        <LandingPage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <Layout showFooter={false}>
                        <RequireAuth>
                          <ChatPage />
                        </RequireAuth>
                      </Layout>
                    }
                  />
                  <Route
                    path="/historico"
                    element={
                      <Layout>
                        <RequireAuth>
                          <HistoryPage />
                        </RequireAuth>
                      </Layout>
                    }
                  />
                  <Route
                    path="/historico/:id"
                    element={
                      <Layout>
                        <RequireAuth>
                          <DiagnosisDetailPage />
                        </RequireAuth>
                      </Layout>
                    }
                  />
                  <Route
                    path="/api-docs"
                    element={
                      <Layout>
                        <ApiDocsPage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/modelos"
                    element={
                      <Layout>
                        <ModelsPage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/sobre"
                    element={
                      <Layout>
                        <AboutPage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <Layout>
                        <LoginPage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/redefinir-senha"
                    element={
                      <Layout>
                        <ResetPasswordPage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/planos"
                    element={
                      <Layout>
                        <PlansPage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/planos/pagamento/:planName"
                    element={
                      <Layout>
                        <RequireAuth>
                          <PaymentPage />
                        </RequireAuth>
                      </Layout>
                    }
                  />
                  <Route
                    path="/perfil"
                    element={
                      <Layout>
                        <RequireAuth>
                          <ProfilePage />
                        </RequireAuth>
                      </Layout>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <Layout>
                        <NotFoundPage />
                      </Layout>
                    }
                  />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ErrorBoundary>
        </MotionConfig>
      </FeaturesProvider>
    </AuthContext.Provider>
  );
}

export default App;
