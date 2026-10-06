import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('../DiagnosisCard', () => () => <div data-testid="diagnosis-card" />);
jest.mock('../../common/Markdown', () => ({ children }) => <div>{children}</div>);
jest.mock('../../../assets/brand/marca.svg', () => ({ ReactComponent: () => <svg /> }));

const ChatMessage = require('../ChatMessage').default;

describe('ChatMessage — aviso de auxiliar', () => {
  it('toda resposta concluída do Zé leva o aviso', () => {
    render(<ChatMessage message={{ id: '1', role: 'assistant', content: 'É ferrugem.' }} />);
    expect(screen.getByRole('note')).toHaveTextContent(/não fonte da verdade/);
  });

  it('não pisca o aviso durante o streaming', () => {
    render(
      <ChatMessage message={{ id: '2', role: 'assistant', content: 'É fer', isStreaming: true }} />,
    );
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('mensagem do usuário não tem aviso', () => {
    render(<ChatMessage message={{ id: '3', role: 'user', content: 'Que doença é?' }} />);
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });
});

jest.mock('../TalhaoCriadoCard', () => ({ talhao }) => <div data-testid="talhao-criado">{talhao.nome}</div>);

describe('ChatMessage — análise de foto (m-Chat-Analisando)', () => {
  it('foto sozinha vira o balão, com a varredura enquanto o Zé analisa', () => {
    render(<ChatMessage message={{ id: 'u', role: 'user', content: '', imageUrl: 'blob:f' }} scanning />);
    expect(screen.getByRole('img', { name: 'Foto enviada' })).toBeInTheDocument();
    expect(screen.queryByText(/Imagem enviada/)).not.toBeInTheDocument();
  });

  it('cartão "Olhando sua folha…" mostra feito, em andamento e o que vem', () => {
    render(
      <ChatMessage
        message={{ id: 'a', role: 'assistant', content: '', isStreaming: true, hasImage: true, steps: [{ name: 'inspect_image', done: true }, { name: 'analyze_image', done: false }] }}
      />,
    );
    expect(screen.getByText('Olhando sua folha…')).toBeInTheDocument();
    expect(screen.getByText('Foto conferida')).toBeInTheDocument();
    expect(screen.getByText('Rodando o diagnóstico')).toBeInTheDocument();
    expect(screen.getByText('Montar o plano de ação')).toBeInTheDocument();
  });

  it('terminado, os passos recolhem em "N passos concluídos"', () => {
    render(
      <ChatMessage message={{ id: 'b', role: 'assistant', content: 'Ferrugem.', steps: [{ name: 'inspect_image', done: true }, { name: 'analyze_image', done: true }] }} />,
    );
    const toggle = screen.getByRole('button', { name: /2 passos concluídos/ });
    expect(screen.queryByText('Foto conferida')).not.toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.getByText('Foto conferida')).toBeInTheDocument();
  });

  it('talhão criado pelo Zé aparece como cartão', () => {
    render(<ChatMessage message={{ id: 'c', role: 'assistant', content: 'Cadastrei.', talhao: { id: 't9', nome: 'Talhão 9', created: true } }} />);
    expect(screen.getByTestId('talhao-criado')).toHaveTextContent('Talhão 9');
  });

  it('mensagem de voz mostra o microfone, sem emoji', () => {
    render(<ChatMessage message={{ id: 'v', role: 'user', content: 'Mensagem de voz', isVoice: true }} />);
    expect(screen.getByText('Mensagem de voz')).toBeInTheDocument();
  });
});

  it('pergunta do Zé já respondida fica como fala na conversa', () => {
    render(<ChatMessage message={{ id: 'q', role: 'assistant', content: '', question: 'Em qual talhão?' }} />);
    expect(screen.getByText('Em qual talhão?')).toBeInTheDocument();
  });

  it('pergunta pendente não duplica o InterruptPrompt', () => {
    render(<ChatMessage message={{ id: 'q', role: 'assistant', content: '', question: 'Em qual talhão?' }} hideQuestion />);
    expect(screen.queryByText('Em qual talhão?')).not.toBeInTheDocument();
  });
