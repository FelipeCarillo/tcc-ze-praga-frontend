import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

// O CRA/Jest não resolve o react-router-dom v7; o projeto mocka como módulo
// virtual (ver QuotaExceededModal.test.js).
const mockNavigate = jest.fn();
let mockPathname = '/';
jest.mock(
  'react-router-dom',
  () => ({
    __esModule: true,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: mockPathname }),
    Link: require('react').forwardRef(({ to, children, ...rest }, ref) => (
      <a href={to} ref={ref} {...rest}>
        {children}
      </a>
    )),
  }),
  { virtual: true },
);

const mockUseAuth = jest.fn();
jest.mock('../../../hooks/useAuth', () => ({
  __esModule: true,
  useAuth: () => mockUseAuth(),
}));

const BottomNav = require('../BottomNav').default;

beforeEach(() => {
  mockUseAuth.mockReset();
  mockNavigate.mockReset();
  mockPathname = '/';
});

describe('BottomNav (rebrand 2026)', () => {
  it('sem login esconde o histórico e manda a câmera para o login', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<BottomNav />);
    expect(screen.queryByRole('link', { name: /Histórico/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fotografar folha' }));
    expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { from: '/camera' } });
  });

  it('marca a página atual com aria-current', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } });
    mockPathname = '/historico/abc';
    render(<BottomNav />);
    expect(screen.getByRole('link', { name: /Histórico/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Início/ })).not.toHaveAttribute('aria-current');
  });

  it('com login, a câmera abre a tela de câmera do Zé', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } });
    render(<BottomNav />);
    fireEvent.click(screen.getByRole('button', { name: 'Fotografar folha' }));
    expect(mockNavigate).toHaveBeenCalledWith('/camera');
  });

  it('a aba "Zé" abre a conversa sem precisar de foto', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } });
    render(<BottomNav />);
    expect(screen.getByRole('link', { name: /Zé/ })).toHaveAttribute('href', '/chat');
    expect(screen.queryByRole('link', { name: /Planos/ })).not.toBeInTheDocument();
  });
});
