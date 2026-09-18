import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('../ChatMessage', () => ({ message }) => <div>{message.content}</div>);
jest.mock('../TypingIndicator', () => () => <div data-testid="typing-indicator" />);
jest.mock('../InterruptPrompt', () => ({ interrupt }) => (
  <div data-testid="interrupt-prompt">{interrupt.question}</div>
));

const ChatWindow = require('../ChatWindow').default;

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

const firstMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Oi! Como posso ajudar?',
};

function renderWindow(messages, isLoading = true, pendingInterrupt = null) {
  return render(
    <ChatWindow
      messages={messages}
      isLoading={isLoading}
      onSelectFile={jest.fn()}
      onSaveDiagnosis={jest.fn()}
      pendingInterrupt={pendingInterrupt}
      onAnswerInterrupt={jest.fn()}
    />,
  );
}

describe('ChatWindow durante o streaming', () => {
  it('mostra o indicador enquanto ainda não recebeu o primeiro token', () => {
    renderWindow([
      firstMessage,
      { id: 'user', role: 'user', content: 'O que é ferrugem?' },
      { id: 'stream', role: 'assistant', content: '', isStreaming: true },
    ]);

    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
  });

  it('remove o indicador quando a resposta começa a aparecer', () => {
    renderWindow([
      firstMessage,
      { id: 'user', role: 'user', content: 'O que é ferrugem?' },
      {
        id: 'stream',
        role: 'assistant',
        content: 'A ferrugem asiática é uma doença fúngica.',
        isStreaming: true,
      },
    ]);

    expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
  });

  it('não associa o diagnóstico anterior à foto mais recente', () => {
    renderWindow([
      firstMessage,
      { id: 'photo-a', role: 'user', content: 'primeira folha', imageUrl: 'blob:photo-a' },
      { id: 'result-a', role: 'assistant', content: '', diagnosis: { disease: 'Ferrugem antiga' } },
      { id: 'photo-b', role: 'user', content: 'segunda folha', imageUrl: 'blob:photo-b' },
      { id: 'waiting', role: 'assistant', content: 'Vou observar esta nova folha.' },
    ], false);

    expect(screen.getByText('Aguardando observação')).toBeInTheDocument();
    expect(screen.queryByText('Ferrugem antiga')).not.toBeInTheDocument();
  });

  it('mostra a hipótese que pertence à foto mais recente', () => {
    renderWindow([
      firstMessage,
      { id: 'photo', role: 'user', content: 'folha atual', imageUrl: 'blob:photo' },
      { id: 'result', role: 'assistant', content: '', diagnosis: { disease: 'Ferrugem asiática', modelUsed: 'Ensemble' } },
    ]);

    expect(screen.getByText('Ferrugem asiática')).toBeInTheDocument();
    expect(screen.getByText(/Hipótese do modelo · Ensemble/)).toBeInTheDocument();
  });

  it('mantém a pergunta HITL visível junto da foto em análise', () => {
    renderWindow(
      [
        firstMessage,
        { id: 'photo', role: 'user', content: 'folha atual', imageUrl: 'blob:photo' },
      ],
      false,
      { question: 'As manchas aparecem também nas folhas novas?' },
    );

    expect(screen.getByText('Uma resposta sua é necessária.')).toBeInTheDocument();
    expect(screen.getByTestId('interrupt-prompt')).toHaveTextContent(
      'As manchas aparecem também nas folhas novas?',
    );
  });
});
