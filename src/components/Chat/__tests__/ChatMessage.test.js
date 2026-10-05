import React from 'react';
import { render, screen } from '@testing-library/react';

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
