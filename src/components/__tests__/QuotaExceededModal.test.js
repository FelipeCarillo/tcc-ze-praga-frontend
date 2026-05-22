import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';

const mockNavigate = jest.fn();
jest.mock(
  'react-router-dom',
  () => ({
    __esModule: true,
    useNavigate: () => mockNavigate,
  }),
  { virtual: true }
);

const QuotaExceededModal = require('../common/QuotaExceededModal').default;

beforeEach(() => {
  mockNavigate.mockReset();
});

describe('QuotaExceededModal', () => {
  it('opens when the quota-exceeded event fires and shows the feature counter', () => {
    render(<QuotaExceededModal />);

    expect(screen.queryByTestId('quota-exceeded-modal')).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new CustomEvent('quota-exceeded', {
          detail: { feature: 'chat', used: 10, limit: 10 },
        })
      );
    });

    expect(screen.getByTestId('quota-exceeded-modal')).toBeInTheDocument();
    expect(screen.getByText(/Limite de uso atingido/i)).toBeInTheDocument();
    expect(screen.getByTestId('quota-feature')).toHaveTextContent(/Chat/i);
    expect(screen.getByTestId('quota-counter')).toHaveTextContent('10/10');
  });

  it('closes when the Fechar button is clicked', async () => {
    render(<QuotaExceededModal />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent('quota-exceeded', {
          detail: { feature: 'inference', used: 5, limit: 5 },
        })
      );
    });

    // Dialog is open: role="dialog" element present
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Fechar/i));

    // MUI Dialog uses a transition; assert the dialog disappears (or
    // becomes hidden via aria-hidden) once the transition finishes.
    await waitFor(() => {
      const dialog = screen.queryByRole('dialog');
      // Either fully removed, or marked hidden by MUI's exit transition.
      expect(
        dialog === null || dialog.getAttribute('aria-hidden') === 'true'
      ).toBe(true);
    });
  });

  it('navigates to /planos when the CTA is clicked', () => {
    render(<QuotaExceededModal />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent('quota-exceeded', {
          detail: { feature: 'chat', used: 10, limit: 10 },
        })
      );
    });

    fireEvent.click(screen.getByTestId('quota-cta-plans'));

    expect(mockNavigate).toHaveBeenCalledWith('/planos');
  });

  it('falls back to a generic message when no detail is provided', () => {
    render(<QuotaExceededModal />);

    act(() => {
      window.dispatchEvent(new CustomEvent('quota-exceeded'));
    });

    expect(screen.getByTestId('quota-exceeded-modal')).toBeInTheDocument();
    expect(screen.queryByTestId('quota-feature')).not.toBeInTheDocument();
  });
});
