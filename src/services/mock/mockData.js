export const diseases = [
  {
    id: 'ferrugem-asiatica',
    name: 'Ferrugem Asiatica',
    scientificName: 'Phakopsora pachyrhizi',
    confidence: 0.92,
    severity: 'alta',
    description:
      'Doenca fungica severa que causa lesoes amareladas a marrom-escuras na face inferior das folhas. E a principal doenca da soja no Brasil, podendo causar desfolha precoce e perdas de ate 80% na produtividade.',
    actionPlan: [
      'Aplicar fungicida a base de triazol + estrobilurina imediatamente',
      'Monitorar a evolucao da doenca a cada 7 dias',
      'Considerar aplicacao preventiva nas areas adjacentes',
      'Verificar o vazio sanitario na regiao',
      'Registrar a ocorrencia no sistema de alerta fitossanitario',
    ],
  },
  {
    id: 'mancha-alvo',
    name: 'Mancha Alvo',
    scientificName: 'Corynespora cassiicola',
    confidence: 0.87,
    severity: 'media',
    description:
      'Doenca fungica caracterizada por lesoes circulares com aneis concentricos que lembram um alvo. Causa desfolha prematura e reducao na produtividade, especialmente em cultivares suscetiveis.',
    actionPlan: [
      'Aplicar fungicida especifico para Corynespora',
      'Evitar o plantio de cultivares suscetiveis na proxima safra',
      'Realizar rotacao de culturas para reduzir o inoculo no solo',
      'Monitorar a cada 10 dias',
    ],
  },
  {
    id: 'antracnose',
    name: 'Antracnose',
    scientificName: 'Colletotrichum truncatum',
    confidence: 0.78,
    severity: 'media',
    description:
      'Doenca fungica que afeta hastes, vagens e folhas da soja. Causa manchas escuras e necrose dos tecidos, podendo levar a morte prematura das plantas em condicoes de alta umidade.',
    actionPlan: [
      'Aplicar fungicida protetor + sistemico',
      'Utilizar sementes tratadas na proxima safra',
      'Garantir boa drenagem na area de cultivo',
      'Monitorar a cada 7-10 dias',
    ],
  },
  {
    id: 'cercosporiose',
    name: 'Cercosporiose',
    scientificName: 'Cercospora kikuchii',
    confidence: 0.84,
    severity: 'media',
    description:
      'Doenca fungica que causa manchas purpuras nas folhas e sementes. O fungo sobrevive nas sementes infectadas e nos restos culturais, sendo favorecido por temperaturas entre 23-27 graus e alta umidade.',
    actionPlan: [
      'Aplicar fungicida a base de benzimidazol ou estrobilurina',
      'Utilizar sementes certificadas e tratadas',
      'Realizar rotacao de culturas',
      'Eliminar restos culturais apos a colheita',
    ],
  },
  {
    id: 'mildio',
    name: 'Mildio',
    scientificName: 'Peronospora manshurica',
    confidence: 0.81,
    severity: 'baixa',
    description:
      'Doenca fungica que causa manchas verde-claras a amareladas na face superior das folhas, com esporulacao acinzentada na face inferior. Normalmente nao causa perdas significativas, mas pode indicar condicoes favoraveis a outras doencas.',
    actionPlan: [
      'Monitorar a evolucao da doenca',
      'Aplicar fungicida preventivo se necessario',
      'Preferir cultivares com resistencia genetica',
    ],
  },
  {
    id: 'saudavel',
    name: 'Folha Saudavel',
    scientificName: 'Glycine max',
    confidence: 0.95,
    severity: 'nenhuma',
    description:
      'Nenhuma doenca ou praga detectada. A folha apresenta coloracao e textura normais, indicando bom estado fitossanitario da planta.',
    actionPlan: [
      'Continuar o monitoramento regular da lavoura',
      'Manter o programa preventivo de manejo integrado de pragas',
    ],
  },
];

export const chatResponses = {
  greeting:
    'Ola! Sou o Ze Praga, seu assistente de diagnostico fitossanitario. Envie uma foto da folha de soja para que eu possa analisar, ou pergunte sobre pragas e doencas da cultura.',
  noImage:
    'Para realizar um diagnostico preciso, preciso que voce envie uma foto da folha de soja. Voce pode tirar uma foto ou selecionar uma imagem da galeria.',
  about:
    'Sou uma ferramenta de inteligencia artificial desenvolvida para auxiliar produtores rurais na deteccao de pragas e doencas em lavouras de soja. Utilizo modelos de visao computacional treinados com milhares de imagens para identificar as principais doencas da cultura.',
  ferrugem:
    'A ferrugem asiatica (Phakopsora pachyrhizi) e a doenca mais destrutiva da soja no Brasil. Ela pode causar perdas de ate 80% da produtividade. O monitoramento constante e a aplicacao preventiva de fungicidas sao essenciais para o controle.',
  mancha:
    'A mancha alvo (Corynespora cassiicola) e uma doenca fungica que tem se tornado cada vez mais importante nas lavouras brasileiras. O uso de cultivares resistentes e a rotacao de culturas sao estrategias importantes de controle.',
  default:
    'Entendo sua duvida! Para uma analise mais detalhada, recomendo enviar uma foto da folha afetada. Posso identificar a doenca e sugerir um plano de acao especifico.',
};
