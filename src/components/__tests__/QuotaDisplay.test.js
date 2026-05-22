import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';

const mockGetUsageSummary = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('../../services/usageService', () => ({
  __esModule: true,
  getUsageSummary: (...args) => mockGetUsageSummary(...args),
}));

jest.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  useAuth: () => mockUseAuth(),
}));

const QuotaDisplay = require('../Layout/QuotaDisplay').default;

beforeEach(() => {
  mockGetUsageSummary.mockReset();
  mockUseAuth.mockReset();
});

describe('QuotaDisplay', () => {
  it('renders nothing when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { container } = render(<QuotaDisplay />);
    expect(container).toBeEmptyDOMElement();
    expect(mockGetUsageSummary).not.toHaveBeenCalled();
  });

  it('fetches and renders chat + inference counters', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } });
    mockGetUsageSummary.mockResolvedValue({
      chat: { used: 3, limit: 10, remaining: 7 },
      inference: { used: 1, limit: 5, remaining: 4 },
      api: { used: 0, limit: 0, remaining: 0 },
    });

    render(<QuotaDisplay />);

    await waitFor(() => {
      expect(screen.getByTestId('quota-chip-chat')).toBeInTheDocument();
    });
    expect(screen.getByTestId('quota-chip-chat')).toHaveTextContent('Chat 3/10');
    expect(screen.getByTestId('quota-chip-inference')).toHaveTextContent('Inferência 1/5');
  });

  it('renders nothing when the API request fails', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } });
    mockGetUsageSummary.mockRejectedValue(new Error('offline'));

    const { container } = render(<QuotaDisplay />);

    // Wait for the rejected promise to settle
    await waitFor(() => {
      expect(mockGetUsageSummary).toHaveBeenCalled();
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('refetches when quota-updated event fires', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } });
    mockGetUsageSummary
      .mockResolvedValueOnce({
        chat: { used: 1, limit: 10, remaining: 9 },
        inference: { used: 0, limit: 5, remaining: 5 },
        api: { used: 0, limit: 0, remaining: 0 },
      })
      .mockResolvedValueOnce({
        chat: { used: 2, limit: 10, remaining: 8 },
        inference: { used: 0, limit: 5, remaining: 5 },
        api: { used: 0, limit: 0, remaining: 0 },
      });

    render(<QuotaDisplay />);

    await waitFor(() => {
      expect(screen.getByTestId('quota-chip-chat')).toHaveTextContent('Chat 1/10');
    });

    act(() => {
      window.dispatchEvent(new CustomEvent('quota-updated'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('quota-chip-chat')).toHaveTextContent('Chat 2/10');
    });
    expect(mockGetUsageSummary).toHaveBeenCalledTimes(2);
  });

  it('renders "ilimitado" when limit is null', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } });
    mockGetUsageSummary.mockResolvedValue({
      chat: { used: 42, limit: null, remaining: null },
      inference: { used: 0, limit: 5, remaining: 5 },
      api: { used: 0, limit: null, remaining: null },
    });

    render(<QuotaDisplay />);

    await waitFor(() => {
      expect(screen.getByTestId('quota-chip-chat')).toHaveTextContent('ilimitado');
    });
  });
});
