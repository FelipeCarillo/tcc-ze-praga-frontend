import React from 'react';
import { render, screen } from '@testing-library/react';

// O CRA/Jest não resolve o react-router-dom v7: mock virtual, como nos demais.
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }), { virtual: true });
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

  it('mostra a pergunta do agente depois das mensagens', () => {
    renderWindow(
      [firstMessage, { id: 'photo', role: 'user', content: 'folha atual', imageUrl: 'blob:photo' }],
      false,
      { question: 'As manchas aparecem também nas folhas novas?' },
    );
    expect(screen.getByTestId('interrupt-prompt')).toHaveTextContent(
      'As manchas aparecem também nas folhas novas?',
    );
  });
});
