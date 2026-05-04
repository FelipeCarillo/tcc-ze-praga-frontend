import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Layout from './components/Layout/Layout';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import HistoryPage from './pages/HistoryPage';
import DiagnosisDetailPage from './pages/DiagnosisDetailPage';
import ApiDocsPage from './pages/ApiDocsPage';
import AboutPage from './pages/AboutPage';
import ModelsPage from './pages/ModelsPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import * as authService from './services/authService';

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
    setUser(session.user);
  }, []);

  const updateProfile = useCallback(async (values) => {
    const session = await authService.updateProfile(values);
    setUser(session.user);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const auth = useMemo(
    () => ({ user, loading, login, register, updateProfile, logout }),
    [loading, login, logout, register, updateProfile, user]
  );

  return (
    <AuthContext.Provider value={auth}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><LandingPage /></Layout>} />
          <Route path="/chat" element={<Layout showFooter={false}><ChatPage /></Layout>} />
          <Route path="/historico" element={<Layout><HistoryPage /></Layout>} />
          <Route path="/historico/:id" element={<Layout><DiagnosisDetailPage /></Layout>} />
          <Route path="/api-docs" element={<Layout><ApiDocsPage /></Layout>} />
          <Route path="/modelos" element={<Layout><ModelsPage /></Layout>} />
          <Route path="/sobre" element={<Layout><AboutPage /></Layout>} />
          <Route path="/login" element={<Layout><LoginPage /></Layout>} />
          <Route path="/perfil" element={<Layout><ProfilePage /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
