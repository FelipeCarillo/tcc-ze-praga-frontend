import React from 'react';
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

const mockUseAuth = jest.fn();

jest.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  useAuth: () => mockUseAuth(),
}));

const {
  FeaturesProvider,
  useFeatures,
  useTier,
} = require('../FeaturesContext');

beforeEach(() => {
  mockUseAuth.mockReset();
});

function wrap(authValue) {
  mockUseAuth.mockReturnValue(authValue);
  return ({ children }) => <FeaturesProvider>{children}</FeaturesProvider>;
}

describe('useFeatures', () => {
  it('returns null when user is null', () => {
    const { result } = renderHook(() => useFeatures(), {
      wrapper: wrap({ user: null }),
    });
    expect(result.current).toBeNull();
  });

  it('returns null when user has no plan', () => {
    const { result } = renderHook(() => useFeatures(), {
      wrapper: wrap({ user: { id: 'u1' } }),
    });
    expect(result.current).toBeNull();
  });

  it('returns null when user.plan has no features', () => {
    const { result } = renderHook(() => useFeatures(), {
      wrapper: wrap({ user: { id: 'u1', plan: {} } }),
    });
    expect(result.current).toBeNull();
  });

  it('returns features object when present', () => {
    const features = {
      tier_name: 'pro',
      llm_model: 'gpt-4o',
      search_web: true,
      api_access: false,
    };
    const { result } = renderHook(() => useFeatures(), {
      wrapper: wrap({ user: { id: 'u1', plan: { features } } }),
    });
    expect(result.current).toEqual(features);
  });
});

describe('useTier', () => {
  it('returns null when no plan', () => {
    const { result } = renderHook(() => useTier(), {
      wrapper: wrap({ user: { id: 'u1' } }),
    });
    expect(result.current).toBeNull();
  });

  it('returns tier_name from features', () => {
    const { result } = renderHook(() => useTier(), {
      wrapper: wrap({
        user: {
          id: 'u1',
          plan: { features: { tier_name: 'enterprise' } },
        },
      }),
    });
    expect(result.current).toBe('enterprise');
  });
});

describe('FeaturesProvider', () => {
  it('renders children', () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { getByText } = render(
      <FeaturesProvider>
        <span>kid</span>
      </FeaturesProvider>
    );
    expect(getByText('kid')).toBeInTheDocument();
  });
});
