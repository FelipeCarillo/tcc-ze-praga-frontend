import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { motion, MotionConfig } from "framer-motion";
import { AuthContext } from "./AuthContext";
import { FeaturesProvider } from "./contexts/FeaturesContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import NavigationEffects from "./components/common/NavigationEffects";
import RequireAuth from "./components/common/RequireAuth";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./components/Layout/Layout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import QuotaExceededModal from "./components/common/QuotaExceededModal";
import InstallPrompt from "./components/common/InstallPrompt";
import * as authService from "./services/authService";

// Fora a landing e o login (primeira tela de quem chega pelo celular), cada
// página vira um chunk próprio: o bundle inicial encolhe e o 4G do campo baixa
// só o que a pessoa abre. O service worker guarda os chunks para a próxima vez.
const ChatPage = lazy(() => import("./pages/ChatPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const CameraPage = lazy(() => import("./pages/CameraPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const DiagnosisDetailPage = lazy(() => import("./pages/DiagnosisDetailPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const PlansPage = lazy(() => import("./pages/PlansPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
// Páginas institucionais / pesadas: carregadas sob demanda (auditoria, seção 21).
const ApiDocsPage = lazy(() => import("./pages/ApiDocsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ModelsPage = lazy(() => import("./pages/ModelsPage"));
const FazendasPage = lazy(() => import("./pages/FazendasPage"));
const FazendaPage = lazy(() => import("./pages/FazendaPage"));
const FazendaFormPage = lazy(() => import("./pages/FazendaFormPage"));

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

// Logado, o "/" é o Início (m-Home); deslogado, a landing com a barra de
// topo transparente sobre o hero (d-Landing / m-Landing).
function RootPage() {
  const { user } = React.useContext(AuthContext);
  return user ? (
    <Layout>
      <HomePage />
    </Layout>
  ) : (
    <Layout topBar="overlay" bottomNav={false}>
      <LandingPage />
    </Layout>
  );
}

const routeOrder = ["/", "/camera", "/chat", "/historico", "/modelos", "/api-docs", "/sobre"];

function routeIndex(pathname) {
  if (pathname.startsWith("/historico/")) return routeOrder.indexOf("/historico");
  if (pathname.startsWith("/planos")) return routeOrder.indexOf("/sobre") + 1;
  const index = routeOrder.indexOf(pathname);
  return index === -1 ? routeOrder.length : index;
}

function RouteTransition({ children }) {
  const location = useLocation();
  const previousPathname = useRef(location.pathname);
  const direction = routeIndex(location.pathname) >= routeIndex(previousPathname.current) ? 1 : -1;

  useEffect(() => {
    previousPathname.current = location.pathname;
  }, [location.pathname]);

  // Só a animação de ENTRADA. A versão anterior usava AnimatePresence
  // mode="wait" com saída, mas a saída nunca terminava: a página antiga ficava
  // montada e renderizava a rota nova (a página "nova" nunca montava de fato).
  // Efeito colateral visível: o /chat que aparecia era essa cópia, e o arquivo
  // vindo da câmera se perdia na troca. Remontar por chave, sem saída, resolve.
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, x: direction * 56 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
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
                <RouteTransition>
                  <Routes>
                  <Route path="/" element={<RootPage />} />
                  <Route
                    path="/camera"
                    element={
                      <Layout>
                        <RequireAuth>
                          <CameraPage />
                        </RequireAuth>
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
                      <Layout bottomNav={false}>
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
                      <Layout bottomNav={false} showFooter={false}>
                        <LoginPage />
                      </Layout>
                    }
                  />
                  <Route
                    path="/redefinir-senha"
                    element={
                      <Layout bottomNav={false} showFooter={false}>
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
                    path="/fazendas"
                    element={
                      <Layout>
                        <RequireAuth>
                          <FazendasPage />
                        </RequireAuth>
                      </Layout>
                    }
                  />
                  <Route
                    path="/fazendas/nova"
                    element={
                      <Layout bottomNav={false} showFooter={false}>
                        <RequireAuth>
                          <FazendaFormPage />
                        </RequireAuth>
                      </Layout>
                    }
                  />
                  <Route
                    path="/fazendas/:id/editar"
                    element={
                      <Layout bottomNav={false} showFooter={false}>
                        <RequireAuth>
                          <FazendaFormPage />
                        </RequireAuth>
                      </Layout>
                    }
                  />
                  <Route
                    path="/fazendas/:id"
                    element={
                      <Layout>
                        <RequireAuth>
                          <FazendaPage />
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
                </RouteTransition>
              </Suspense>
            </BrowserRouter>
          </ErrorBoundary>
        </MotionConfig>
      </FeaturesProvider>
    </AuthContext.Provider>
  );
}

export default App;
