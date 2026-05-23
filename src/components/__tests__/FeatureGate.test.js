import React from 'react';
import { render, screen } from '@testing-library/react';

const mockUseAuth = jest.fn();

jest.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  useAuth: () => mockUseAuth(),
}));

const { FeaturesProvider } = require('../../contexts/FeaturesContext');
const { FeatureGate } = require('../FeatureGate');

beforeEach(() => {
  mockUseAuth.mockReset();
});

function renderWithAuth(authValue, ui) {
  mockUseAuth.mockReturnValue(authValue);
  return render(<FeaturesProvider>{ui}</FeaturesProvider>);
}

describe('FeatureGate', () => {
  it('renders nothing when user is not authenticated', () => {
    renderWithAuth(
      { user: null },
      <FeatureGate feature="api_access">
        <button>API Keys</button>
      </FeatureGate>
    );
    expect(screen.queryByText('API Keys')).not.toBeInTheDocument();
  });

  it('renders nothing when user has no plan', () => {
    renderWithAuth(
      { user: { id: 'u1' } },
      <FeatureGate feature="api_access">
        <button>API Keys</button>
      </FeatureGate>
    );
    expect(screen.queryByText('API Keys')).not.toBeInTheDocument();
  });

  it('renders fallback when feature is off', () => {
    renderWithAuth(
      { user: { id: 'u1', plan: { features: { api_access: false } } } },
      <FeatureGate
        feature="api_access"
        fallback={<span>Upgrade para Enterprise</span>}
      >
        <button>API Keys</button>
      </FeatureGate>
    );
    expect(screen.queryByText('API Keys')).not.toBeInTheDocument();
    expect(screen.getByText('Upgrade para Enterprise')).toBeInTheDocument();
  });

  it('renders children when feature is true', () => {
    renderWithAuth(
      { user: { id: 'u1', plan: { features: { api_access: true } } } },
      <FeatureGate feature="api_access">
        <button>API Keys</button>
      </FeatureGate>
    );
    expect(screen.getByText('API Keys')).toBeInTheDocument();
  });

  it('does not treat truthy strings as activated', () => {
    // Plano malformado com string em vez de boolean — deve cair em fallback.
    renderWithAuth(
      { user: { id: 'u1', plan: { features: { api_access: 'yes' } } } },
      <FeatureGate feature="api_access">
        <button>API Keys</button>
      </FeatureGate>
    );
    expect(screen.queryByText('API Keys')).not.toBeInTheDocument();
  });

  it('renders fallback when the feature key is missing', () => {
    renderWithAuth(
      {
        user: {
          id: 'u1',
          plan: { features: { tier_name: 'pro', search_web: true } },
        },
      },
      <FeatureGate
        feature="api_access"
        fallback={<span>nao disponivel</span>}
      >
        <button>API Keys</button>
      </FeatureGate>
    );
    expect(screen.getByText('nao disponivel')).toBeInTheDocument();
  });

  it('uses null fallback by default (renders nothing)', () => {
    renderWithAuth(
      { user: { id: 'u1', plan: { features: { api_access: false } } } },
      <FeatureGate feature="api_access">
        <button>API Keys</button>
      </FeatureGate>
    );
    // Sem fallback explicito, e API Keys oculto -> DOM vazio.
    expect(screen.queryByText('API Keys')).not.toBeInTheDocument();
  });
});
