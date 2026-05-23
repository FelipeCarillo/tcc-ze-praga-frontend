import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InterruptDialog from '../InterruptDialog';

function makeInterrupt(overrides = {}) {
  return {
    kind: 'ask_user',
    question: 'Qual cultivo?',
    response_kind: 'choice',
    options: ['soja', 'milho'],
    asked_at: '2026-05-22T12:00:00+00:00',
    ...overrides,
  };
}

describe('InterruptDialog', () => {
  it('does not render when interrupt is null', () => {
    const { queryByRole } = render(
      <InterruptDialog open interrupt={null} threadId="t1" onSubmit={jest.fn()} />
    );
    expect(queryByRole('dialog')).toBeNull();
  });

  it('renders question and choice options', () => {
    render(
      <InterruptDialog
        open
        interrupt={makeInterrupt()}
        threadId="t1"
        onSubmit={jest.fn()}
      />
    );
    expect(screen.getByText('Qual cultivo?')).toBeInTheDocument();
    expect(screen.getByTestId('interrupt-options')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'soja' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'milho' })).toBeInTheDocument();
  });

  it('dispatches the selected option to onSubmit', () => {
    const onSubmit = jest.fn();
    render(
      <InterruptDialog
        open
        interrupt={makeInterrupt()}
        threadId="thread-X"
        onSubmit={onSubmit}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'milho' }));
    expect(onSubmit).toHaveBeenCalledWith('milho', 'thread-X');
  });

  it('renders boolean response with Sim/Nao buttons', () => {
    const onSubmit = jest.fn();
    render(
      <InterruptDialog
        open
        interrupt={makeInterrupt({
          response_kind: 'boolean',
          question: 'Confirma?',
          options: null,
        })}
        threadId="t1"
        onSubmit={onSubmit}
      />
    );
    expect(screen.getByTestId('interrupt-boolean')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sim' }));
    expect(onSubmit).toHaveBeenCalledWith('sim', 't1');

    onSubmit.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Não' }));
    expect(onSubmit).toHaveBeenCalledWith('nao', 't1');
  });

  it('renders confirm response with Continuar button', () => {
    const onSubmit = jest.fn();
    render(
      <InterruptDialog
        open
        interrupt={makeInterrupt({
          response_kind: 'confirm',
          question: 'Pronto pra continuar?',
          options: null,
        })}
        threadId="t1"
        onSubmit={onSubmit}
      />
    );
    expect(screen.getByTestId('interrupt-confirm')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(onSubmit).toHaveBeenCalledWith('ok', 't1');
  });

  it('renders text response and submits on Enviar click', async () => {
    const onSubmit = jest.fn();
    render(
      <InterruptDialog
        open
        interrupt={makeInterrupt({
          response_kind: 'text',
          question: 'Me conta mais',
          options: null,
        })}
        threadId="t1"
        onSubmit={onSubmit}
      />
    );
    const input = screen.getByPlaceholderText(/sua resposta/i);
    fireEvent.change(input, { target: { value: 'mais detalhes' } });

    const enviar = screen.getByRole('button', { name: 'Enviar' });
    expect(enviar).not.toBeDisabled();
    fireEvent.click(enviar);
    expect(onSubmit).toHaveBeenCalledWith('mais detalhes', 't1');
  });

  it('disables Enviar when text input is empty', () => {
    render(
      <InterruptDialog
        open
        interrupt={makeInterrupt({ response_kind: 'text', options: null })}
        threadId="t1"
        onSubmit={jest.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
  });

  it('submits text on Enter without shift', () => {
    const onSubmit = jest.fn();
    render(
      <InterruptDialog
        open
        interrupt={makeInterrupt({ response_kind: 'text', options: null })}
        threadId="t1"
        onSubmit={onSubmit}
      />
    );
    const input = screen.getByPlaceholderText(/sua resposta/i);
    fireEvent.change(input, { target: { value: 'detalhe' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    expect(onSubmit).toHaveBeenCalledWith('detalhe', 't1');
  });

  it('falls back to text input when response_kind unknown', () => {
    render(
      <InterruptDialog
        open
        interrupt={makeInterrupt({ response_kind: 'foo', options: null })}
        threadId="t1"
        onSubmit={jest.fn()}
      />
    );
    expect(screen.getByTestId('interrupt-text')).toBeInTheDocument();
  });

  it('all action buttons are disabled when busy=true', () => {
    render(
      <InterruptDialog
        open
        busy
        interrupt={makeInterrupt()}
        threadId="t1"
        onSubmit={jest.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'soja' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'milho' })).toBeDisabled();
  });

  it('Cancelar button calls onClose', () => {
    const onClose = jest.fn();
    render(
      <InterruptDialog
        open
        interrupt={makeInterrupt()}
        threadId="t1"
        onSubmit={jest.fn()}
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose on backdrop/Esc when prop provided', () => {
    const onClose = jest.fn();
    render(
      <InterruptDialog
        open
        interrupt={makeInterrupt()}
        threadId="t1"
        onSubmit={jest.fn()}
        onClose={onClose}
      />
    );
    // backdrop click — MUI Dialog only forwards reason; we assert
    // press Escape and confirm no close.
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('clears text input when interrupt asked_at changes (new interrupt)', async () => {
    const { rerender } = render(
      <InterruptDialog
        open
        interrupt={makeInterrupt({ response_kind: 'text', options: null })}
        threadId="t1"
        onSubmit={jest.fn()}
      />
    );
    const input = screen.getByPlaceholderText(/sua resposta/i);
    fireEvent.change(input, { target: { value: 'old text' } });
    expect(input).toHaveValue('old text');

    rerender(
      <InterruptDialog
        open
        interrupt={makeInterrupt({
          response_kind: 'text',
          options: null,
          asked_at: '2026-05-22T13:00:00+00:00',
        })}
        threadId="t1"
        onSubmit={jest.fn()}
      />
    );
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/sua resposta/i)).toHaveValue('')
    );
  });
});
