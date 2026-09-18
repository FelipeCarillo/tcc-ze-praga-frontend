/**
 * Copy centralizada — voz do Zé (auditoria de design, seção 06).
 *
 * Princípios: primeira pessoa sempre; verbo antes de substantivo; concreto, não
 * abstrato; calor sem caricatura. Todo texto de UI voltado ao produtor deve sair
 * daqui (permite revisão de copy isolada, A/B test e tradução futura).
 *
 * Uso: `import { copy } from '../copy/ze';` → `copy.chat.greeting`.
 */
export const copy = {
  brand: {
    name: 'Zé Praga',
    tagline: 'Observação de doenças foliares de soja',
  },

  cta: {
    sendPhoto: 'Analisar uma folha',
    sendPhotoShort: 'Analisar folha',
    takePhoto: 'Tirar foto agora',
    fromGallery: 'Escolher da galeria',
    seeHowItWorks: 'Ver como funciona',
    seeRecipe: 'Ver orientações',
    anotherPhoto: 'Outra foto',
    save: 'Salvar',
  },

  landing: {
    kicker: 'Oi, sou o Zé.',
    heroTitle: 'Manda a foto da folha. Eu te digo que praga é e o que fazer.',
    heroSubtitle:
      'Consultor fitossanitário de bolso pra produtor de soja. Foto, hipótese de análise e orientações em português. Entre na sua conta para guardar os resultados.',
    steps: [
      { title: 'Manda a foto', desc: 'Direto da câmera ou da galeria. Folha aproximada, luz natural.' },
      { title: 'Eu analiso', desc: 'O modelo analisa os padrões visuais da foto.' },
      { title: 'Você age', desc: 'Diagnóstico + receita prática + quando refazer a leitura.' },
    ],
  },

  chat: {
    greeting: 'Oi, compadre!',
    prompt: 'Escolha uma foto da folha. Confira a imagem antes de começar a análise.',
    placeholder: 'Pergunta ou manda foto…',
    statusHere: 'aqui agora',
    statusLooking: 'olhando a foto…',
    thinking: ['Análise em andamento…'],
    quickReplies: {
      save: 'Salvar',
      fullRecipe: 'Orientações completas',
      anotherPhoto: 'Outra foto',
    },
    // O que mostrar quando o agente chama uma ferramenta. O stream manda o nome
    // técnico (`analyze_image`); aqui ele vira a voz do Zé. Nome desconhecido
    // cai no fallback e a UI não quebra quando o backend ganhar tools novas.
    tools: {
      inspect_image: 'Olhando a foto…',
      analyze_image: 'Rodando o diagnóstico…',
      deep_diagnose: 'Analisando as fotos…',
      get_disease_info: 'Consultando o caderno de doenças…',
      get_action_plan: 'Consultando próximos cuidados…',
      search_my_diagnoses: 'Procurando no seu histórico…',
      compare_diagnoses: 'Comparando os modelos…',
      search_web: 'Dando uma pesquisada…',
      search_scientific: 'Vendo o que dizem os artigos…',
      identify_crop: 'Vendo que cultura é essa…',
      _fallback: 'Análise em andamento…',
    },
  },

  diagnosis: {
    recipeTitle: 'Próximos cuidados',
    explainsTitle: 'Sobre esta hipótese',
    alternativesTitle: 'Pode ser outra coisa?',
    notMatch: 'Não bate',
  },

  history: {
    title: 'Histórico',
    emptyTitle: 'Caderno em branco.',
    emptyDesc:
      'Manda a primeira foto que eu começo a anotar tudo aqui pra você consultar depois.',
  },

  login: {
    kicker: 'Caderno de campo',
    title: 'Entre para guardar suas análises.',
    subtitle: 'Use seu e-mail e senha para iniciar uma análise e consultar seus registros.',
    sendLink: 'Entrar',
    sentTitle: 'Link voando pra você.',
    sentSignoff: 'Te espero por aqui.',
    optionalNote: 'Sua conta mantém os registros associados ao seu perfil.',
  },

  plans: {
    title: 'Recursos para cada etapa da observação.',
    subtitle:
      'Quem quiser, ajuda a manter o Zé no ar com um apoio mensal. Quem não puder, usa de graça pra sempre.',
    supporterCta: 'Apoiar o Zé',
    freeCta: 'Começar agora',
  },

  payment: {
    successKicker: 'Pronto, compadre!',
    successTitle: 'Você virou Compadre.',
    waitingPix: 'Esperando seu Pix… Confirma em até 30s.',
  },

  feedback: {
    saved: 'Pronto, guardei aqui pra você.',
    clearHistoryConfirm: 'Vou jogar fora tudo. Tem certeza?',
    offline: 'Tô sem sinal — guardo aqui e mando assim que voltar.',
    lowConfidence: 'Essa foto tá difícil pra mim. Manda outra com mais luz?',
  },
};

export default copy;
