import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('../ChatMessage', () => ({ message }) => <div>{message.content}</div>);
jest.mock('../TypingIndicator', () => () => <div data-testid="typing-indicator" />);
jest.mock('../InterruptPrompt', () => () => <div />);

const ChatWindow = require('../ChatWindow').default;

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

const firstMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Oi! Como posso ajudar?',
};

function renderWindow(messages) {
  return render(
    <ChatWindow
      messages={messages}
      isLoading
      onSelectFile={jest.fn()}
      onSaveDiagnosis={jest.fn()}
      pendingInterrupt={null}
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
});
