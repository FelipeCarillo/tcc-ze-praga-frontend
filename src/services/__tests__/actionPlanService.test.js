/**
 * Tests for src/services/actionPlanService.js
 *
 * O plano de ação existia só no mock: nenhum service chamava
 * /api/v1/action-plans, então `diagnosis.actionPlan` era sempre undefined fora
 * do modo mock e o componente ActionPlan nunca renderizava nada real. Estes
 * testes travam o mapeamento entre o formato do backend (lista de níveis) e o
 * que o componente consome (objeto com uma chave por nível).
 */

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  },
}));

jest.mock('../authService', () => ({
  getAuthHeaders: () => ({ Authorization: 'Bearer t' }),
}));

const api = require('../api').default;
const { getActionPlan } = require('../actionPlanService');

const BACKEND_RESPONSE = {
  disease_id: 'ferrugem-asiatica',
  levels: [
    { level: 'essencial', actions: ['Aplicar fungicida', 'Monitorar 7 dias'] },
    { level: 'campo', actions: ['Aplicação preventiva no raio de 500m'] },
  ],
  sources: [
    { id: 's1', name: 'EMBRAPA', detail: 'Circular técnica', url: 'https://x', display_order: 0 },
  ],
  allowed_levels: ['essencial', 'campo'],
};

beforeEach(() => {
  api.get.mockReset();
});

describe('getActionPlan', () => {
  it('converte a lista de níveis do backend em um objeto por nível', async () => {
    api.get.mockResolvedValueOnce({ data: BACKEND_RESPONSE });

    const plan = await getActionPlan('ferrugem-asiatica');

    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/action-plans/ferrugem-asiatica',
      expect.anything()
    );
    expect(plan.essencial).toEqual(['Aplicar fungicida', 'Monitorar 7 dias']);
    expect(plan.campo).toEqual(['Aplicação preventiva no raio de 500m']);
    expect(plan.especialista).toBeUndefined();
  });

  it('preserva as fontes e os níveis liberados pelo plano', async () => {
    api.get.mockResolvedValueOnce({ data: BACKEND_RESPONSE });

    const plan = await getActionPlan('ferrugem-asiatica');

    expect(plan.sources).toHaveLength(1);
    expect(plan.sources[0].name).toBe('EMBRAPA');
    // É o que permite à UI mostrar 'especialista' como upsell em vez de sumir.
    expect(plan.allowedLevels).toEqual(['essencial', 'campo']);
  });

  it('devolve null quando a doença não tem plano cadastrado (404)', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 404 } });

    await expect(getActionPlan('doenca-sem-plano')).resolves.toBeNull();
  });

  it('propaga erros que não são 404', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 500 } });

    await expect(getActionPlan('ferrugem-asiatica')).rejects.toMatchObject({
      response: { status: 500 },
    });
  });

  it('não chama a API sem diseaseId', async () => {
    await expect(getActionPlan(null)).resolves.toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });
});
