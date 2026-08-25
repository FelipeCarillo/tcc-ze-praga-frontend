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
    tagline: 'Consulta de pragas',
  },

  cta: {
    sendPhoto: 'Mandar foto agora',
    sendPhotoShort: 'Mandar foto',
    takePhoto: 'Tirar foto agora',
    fromGallery: 'Escolher da galeria',
    seeHowItWorks: 'Ver como funciona',
    seeRecipe: 'Ver receita',
    anotherPhoto: 'Outra foto',
    save: 'Salvar',
  },

  landing: {
    kicker: 'Oi, sou o Zé.',
    heroTitle: 'Manda a foto da folha. Eu te digo que praga é e o que fazer.',
    heroSubtitle:
      'Consultor fitossanitário de bolso pra produtor de soja. Foto, diagnóstico em 5 segundos, plano de ação em português. Sem cadastro, sem instalar nada.',
    steps: [
      { title: 'Manda a foto', desc: 'Direto da câmera ou da galeria. Folha aproximada, luz natural.' },
      { title: 'Eu analiso', desc: 'Cinco segundos. Comparo com 30 mil imagens de pragas reais.' },
      { title: 'Você age', desc: 'Diagnóstico + receita prática + quando refazer a leitura.' },
    ],
  },

  chat: {
    greeting: 'Oi, compadre!',
    prompt: 'Manda uma foto da folha aí que eu dou uma olhada. Em 5 segundos te digo o que é.',
    placeholder: 'Pergunta ou manda foto…',
    statusHere: 'aqui agora',
    statusLooking: 'olhando a foto…',
    // microcopy do estado "Zé pensando" — rotacionar a cada ~1.2s
    thinking: [
      'Deixa eu olhar com calma…',
      'Hmm, tem alguma coisa aí…',
      'Comparando com o que já vi…',
      'Quase fechando…',
      'Olha que coisa interessante…',
      'Pronto, achei.',
    ],
    quickReplies: {
      save: 'Salvar',
      fullRecipe: 'Receita completa',
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
      get_action_plan: 'Montando a receita…',
      search_my_diagnoses: 'Procurando no seu histórico…',
      compare_diagnoses: 'Comparando os modelos…',
      search_web: 'Dando uma pesquisada…',
      search_scientific: 'Vendo o que dizem os artigos…',
      identify_crop: 'Vendo que cultura é essa…',
      _fallback: 'Trabalhando nisso…',
    },
  },

  diagnosis: {
    recipeTitle: 'Receita do Zé',
    explainsTitle: 'Como eu cheguei nisso',
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
    kicker: 'Oi de novo!',
    title: 'Quem é você, compadre?',
    subtitle: 'Entra com seu email e senha pra eu guardar seu histórico.',
    sendLink: 'Entrar',
    sentTitle: 'Link voando pra você.',
    sentSignoff: 'Te espero por aqui.',
    optionalNote: 'Não precisa de conta pra usar o chat.',
  },

  plans: {
    title: 'O Zé sempre vai ser de graça pro produtor.',
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
