import React from 'react';
import { render, screen } from '@testing-library/react';
import AuxiliarNotice from '../AuxiliarNotice';
import { copy } from '../../../copy/ze';

// Rebrand 2026: o aviso de que o Zé é auxiliar (não fonte da verdade) é
// obrigatório em toda resposta e laudo.
describe('AuxiliarNotice', () => {
  it('mostra título e corpo completos por padrão', () => {
    render(<AuxiliarNotice />);
    const note = screen.getByRole('note');
    expect(note).toHaveTextContent(copy.notice.title);
    expect(note).toHaveTextContent(copy.notice.body);
  });

  it('usa a versão curta no modo compacto', () => {
    render(<AuxiliarNotice compact />);
    const note = screen.getByRole('note');
    expect(note).toHaveTextContent(copy.notice.short);
    expect(note).not.toHaveTextContent(copy.notice.body);
  });

  it('deixa claro que não substitui o agrônomo', () => {
    expect(copy.notice.short).toMatch(/não fonte da verdade/);
    expect(copy.notice.body).toMatch(/engenheiro-agrônomo/);
  });
});
