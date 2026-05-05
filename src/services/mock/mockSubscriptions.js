import { v4 as uuidv4 } from 'uuid';
import { delay } from './delay';

export const SUBSCRIPTION_PLANS = [
  {
    id: 'plan-free',
    name: 'free',
    display_name: 'Gratuito',
    chat_daily_limit: 10,
    inference_daily_limit: 5,
    api_monthly_limit: 0,
  },
  {
    id: 'plan-pro',
    name: 'pro',
    display_name: 'Pro',
    chat_daily_limit: null,
    inference_daily_limit: null,
    api_monthly_limit: 500,
  },
  {
    id: 'plan-enterprise',
    name: 'enterprise',
    display_name: 'Enterprise',
    chat_daily_limit: null,
    inference_daily_limit: null,
    api_monthly_limit: null,
  },
];

export const PLAN_DETAILS = {
  free: {
    title: 'Plano Gratuito',
    price: 'R$ 0',
    period: '/mês',
    highlight: false,
    description: 'Para testar diagnósticos essenciais e validar o uso no dia a dia.',
    features: [
      '10 mensagens de chat por dia',
      '5 análises de imagem por dia',
      'Histórico local de diagnósticos',
      'Planos de ação essenciais',
    ],
  },
  pro: {
    title: 'Plano Pro',
    price: 'R$ 39',
    period: '/mês',
    highlight: true,
    description: 'Para produtores que acompanham lavouras com maior frequência.',
    features: [
      'Chat ilimitado',
      'Análises de imagem ilimitadas',
      '500 chamadas de API por mês',
      'Histórico por perfil autenticado',
    ],
  },
  enterprise: {
    title: 'Plano Plus',
    price: 'R$ 89',
    period: '/mês',
    highlight: false,
    description: 'Para equipes, consultorias e operações com alto volume de diagnóstico.',
    features: [
      'Chat e inferência ilimitados',
      'API ilimitada',
      'Suporte para múltiplas contas',
      'Prioridade em recursos avançados',
    ],
  },
};

export function usageFromPlan(plan) {
  return {
    chat: { used: 0, limit: plan.chat_daily_limit },
    inference: { used: 0, limit: plan.inference_daily_limit },
    api: { used: 0, limit: plan.api_monthly_limit },
  };
}

export async function listPlans() {
  await delay(300);
  return SUBSCRIPTION_PLANS;
}

export async function subscribe(userId, planName) {
  await delay(600);
  const plan = SUBSCRIPTION_PLANS.find((item) => item.name === planName);
  if (!plan) throw new Error('Plano não encontrado.');

  return {
    id: uuidv4(),
    user_id: userId,
    plan,
    started_at: new Date().toISOString(),
    expires_at: null,
    is_active: true,
  };
}
