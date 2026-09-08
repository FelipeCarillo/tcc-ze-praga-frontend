import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const titles = {
  '/': 'Início', '/chat': 'Analisar uma folha', '/historico': 'Histórico',
  '/perfil': 'Meu perfil', '/login': 'Entrar', '/modelos': 'Modelos e métricas',
  '/api-docs': 'API', '/sobre': 'O projeto', '/planos': 'Planos',
  '/redefinir-senha': 'Redefinir senha',
};

export default function NavigationEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    const title = titles[pathname] || (pathname.startsWith('/historico/')
      ? 'Resultado da análise' : pathname.startsWith('/planos/pagamento/')
        ? 'Experimentar um plano' : 'Página não encontrada');
    document.title = title + ' · Zé Praga';
    window.scrollTo(0, 0);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}
