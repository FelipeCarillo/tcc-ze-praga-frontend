// Regra do painel do laudo (d-Chat): o laudo mostrado é o da foto mais recente.
jest.mock('react-router-dom', () => ({ Link: 'a' }), { virtual: true });
jest.mock('../../../hooks/useActionPlan', () => ({ useActionPlan: () => ({ actionPlan: null, loading: false }) }));
const { pickLaudo } = require('../LaudoPanel');

test('foto nova sem resultado não herda o laudo da foto anterior', () => {
  const r = pickLaudo([
    { role: 'user', imageUrl: 'blob:a' },
    { role: 'assistant', diagnosis: { disease: 'Ferrugem antiga' } },
    { role: 'user', imageUrl: 'blob:b' },
    { role: 'assistant', content: 'Vou observar esta nova folha.' },
  ]);
  expect(r.diagnosis).toBeNull();
  expect(r.waiting).toBe(true);
  expect(r.photo).toBe('blob:b');
});

test('mostra o laudo que pertence à foto mais recente', () => {
  const r = pickLaudo([
    { role: 'user', imageUrl: 'blob:b' },
    { role: 'assistant', diagnosis: { disease: 'Ferrugem asiática', imageUrl: 'https://s/b.jpg' } },
  ]);
  expect(r.diagnosis.disease).toBe('Ferrugem asiática');
  expect(r.photo).toBe('https://s/b.jpg');
});

test('conversa reaberta, sem fotos nas mensagens, mostra o último laudo', () => {
  const r = pickLaudo([
    { role: 'assistant', diagnosis: { disease: 'Míldio' } },
    { role: 'assistant', diagnosis: { disease: 'Cercosporiose' } },
  ]);
  expect(r.diagnosis.disease).toBe('Cercosporiose');
  expect(r.waiting).toBe(false);
});
