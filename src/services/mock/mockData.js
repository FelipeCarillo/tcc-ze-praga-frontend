export const actionPlanLevels = [
  { id: 'essencial', label: 'Essencial', description: 'Ações imediatas e objetivas' },
  { id: 'campo', label: 'Estratégia de Campo', description: 'Manejo completo com cronograma' },
  { id: 'especialista', label: 'Visão Especialista', description: 'Análise técnica aprofundada' },
];

export const diseases = [
  {
    id: 'ferrugem-asiatica',
    name: 'Ferrugem Asiática',
    scientificName: 'Phakopsora pachyrhizi',
    confidence: 0.92,
    severity: 'alta',
    description:
      'Doença fúngica severa que causa lesões amareladas a marrom-escuras na face inferior das folhas. É a principal doença da soja no Brasil, podendo causar desfolha precoce e perdas de até 80% na produtividade.',
    actionPlan: {
      essencial: [
        'Aplicar fungicida à base de triazol + estrobilurina imediatamente',
        'Monitorar a evolução da doença a cada 7 dias',
        'Registrar a ocorrência no sistema de alerta fitossanitário',
      ],
      campo: [
        'Aplicação imediata de fungicida sistêmico (triazol + estrobilurina) — ex: Epoxiconazol + Piraclostrobina, dose conforme bula',
        'Aplicação preventiva nas áreas adjacentes num raio de 500m para conter a dispersão de esporos',
        'Monitoramento semanal com coleta de folhas do terço inferior, médio e superior da planta',
        'Verificar calendário do vazio sanitário da região e garantir conformidade',
        'Planejar segunda aplicação em 14-21 dias com rotação de princípio ativo (ex: carboxamida + estrobilurina)',
        'Avaliar a necessidade de antecipação da colheita caso a desfolha ultrapasse 50%',
        'Registrar ocorrência no Consórcio Antiferrugem para contribuir com o sistema de alerta nacional',
      ],
      especialista: [
        'Identificação — Lesões "tan" (castanho-claras) com urédias na face abaxial da folha. A esporulação abundante diferencia da ferrugem americana (P. meibomiae). Confirmar com lupa de campo (10-20x) ou envio de amostra para laboratório',
        'Epidemiologia — Phakopsora pachyrhizi é um patógeno biotrófico obrigatório, disseminado por esporos transportados pelo vento a longas distâncias (até 600 km). Condições ótimas: temperatura 18-26°C, molhamento foliar >6h, umidade relativa >80%',
        'Controle químico — Rotacionar grupos químicos para evitar resistência: (1a aplicação) triazol + estrobilurina; (2a aplicação) carboxamida + estrobilurina; (3a aplicação) triazol + carboxamida. Respeitar intervalo de 14-21 dias entre aplicações',
        'Tecnologia de aplicação — Volume de calda mínimo de 150 L/ha. Bicos com gotas finas a médias. Aplicar preferencialmente no início da manhã ou final da tarde para melhor deposição. Adicionar adjuvante para melhor cobertura na face inferior das folhas',
        'Manejo integrado — Utilizar cultivares de ciclo precoce para escape. Semear no início da janela recomendada. Eliminar soja voluntária ("tiguera") durante o vazio sanitário. Diversificar com milho safrinha para quebra do ciclo',
        'Análise econômica — O custo médio de 3 aplicações gira em torno de R$ 250-350/ha. Sem controle, perdas podem atingir 80% da produtividade. O retorno do investimento em fungicidas para ferrugem é tipicamente de 5:1 a 8:1',
        'Monitoramento avançado — Utilizar armadilhas de esporos (caça-esporos) para detecção precoce. Consultar o sistema de alerta do Consórcio Antiferrugem (www.embrapa.br/ferrugem). Considerar uso de imagens de satélite (NDVI) para mapeamento de áreas afetadas',
      ],
      sources: [
        { name: 'EMBRAPA Soja', detail: 'Circular Técnica 104 — Ferrugem Asiática da Soja', url: 'https://www.embrapa.br/soja' },
        { name: 'Consórcio Antiferrugem', detail: 'Sistema de alerta e monitoramento nacional', url: 'https://www.embrapa.br/ferrugem' },
        { name: 'FRAC - Fungicide Resistance Action Committee', detail: 'Guia de rotação de mecanismos de ação', url: 'https://www.frac.info' },
        { name: 'Godoy, C.V. et al. (2016)', detail: 'Asian soybean rust in Brazil: past, present, and future. Pesquisa Agropecuaria Brasileira, 51(5), 407-421' },
        { name: 'PlantVillage - Penn State University', detail: 'Dataset de imagens para treinamento dos modelos de classificação', url: 'https://plantvillage.psu.edu' },
      ],
    },
  },
  {
    id: 'mancha-alvo',
    name: 'Mancha-Alvo',
    scientificName: 'Corynespora cassiicola',
    confidence: 0.87,
    severity: 'media',
    description:
      'Doença fúngica caracterizada por lesões circulares com anéis concêntricos que lembram um alvo. Causa desfolha prematura e redução na produtividade, especialmente em cultivares suscetíveis.',
    actionPlan: {
      essencial: [
        'Aplicar fungicida específico para Corynespora',
        'Evitar cultivares suscetíveis na próxima safra',
        'Monitorar a lavoura a cada 10 dias',
      ],
      campo: [
        'Aplicar fungicida multissítio (ex: mancozebe ou clorotalonil) em mistura com sistêmico (carboxamida + estrobilurina) para maior eficácia',
        'Realizar rotação de culturas com milho ou algodão por pelo menos 2 safras para redução do inóculo no solo',
        'Selecionar cultivares com tolerância comprovada a Corynespora para a próxima safra — consultar ensaios regionais',
        'Monitoramento quinzenal com atenção especial ao terço inferior da planta, onde os sintomas iniciam',
        'Manejar a densidade de plantio para melhor circulação de ar entre plantas e redução da umidade foliar',
        'Planejar adubação equilibrada — excesso de nitrogênio aumenta a suscetibilidade',
      ],
      especialista: [
        'Identificação — Lesões circulares (3-15 mm) com anéis concêntricos e halo amarelado. C. cassiicola produz conídios longos e septados, visíveis em microscopia. Hospedeiro de ampla gama: soja, tomate, pepino, seringueira — atenção em áreas com múltiplos cultivos',
        'Epidemiologia — Fungo necrotrófico com sobrevivência saprofita em restos culturais por até 2 anos. Disseminação por respingos de chuva e vento. Temperatura ótima: 25-30°C. O patógeno produz a toxina cassiicolin, responsável pela necrose rápida dos tecidos',
        'Resistência a fungicidas — Populações brasileiras de C. cassiicola apresentam casos de resistência a estrobilurinas (mutação G143A) e redução de sensibilidade a carboxamidas. Priorizar fungicidas multissítios na mistura e realizar rotação de mecanismos de ação',
        'Manejo de solo e restos culturais — Incorporar restos culturais com grade após a colheita para acelerar a decomposição. Evitar plantio direto sobre palhada de soja em áreas com histórico severo da doença',
        'Impacto econômico — Perdas variam de 15-30% em cultivares suscetíveis. O custo de controle químico é de R$ 120-180/ha por aplicação. Cultivares tolerantes reduzem a necessidade de aplicações em 1-2 pulverizações/safra',
        'Estratégia de longo prazo — Integrar controle biológico com Trichoderma spp. no tratamento de sementes e solo. Acompanhar os programas de melhoramento genético para lançamento de cultivares com resistência poligênica',
      ],
      sources: [
        { name: 'EMBRAPA Soja', detail: 'Documentos 340 — Manejo da Mancha-Alvo na Cultura da Soja', url: 'https://www.embrapa.br/soja' },
        { name: 'Godoy, C.V. et al. (2018)', detail: 'Target spot: an emerging disease in soybean. Tropical Plant Pathology, 43, 197-203' },
        { name: 'AGROFIT - MAPA', detail: 'Sistema de agrotóxicos fitossanitários — produtos registrados para Corynespora', url: 'https://agrofit.agricultura.gov.br' },
        { name: 'PlantVillage - Penn State University', detail: 'Dataset de imagens para treinamento dos modelos de classificação', url: 'https://plantvillage.psu.edu' },
      ],
    },
  },
  {
    id: 'mancha-olho-de-ra',
    name: 'Mancha Olho-de-rã',
    scientificName: 'Cercospora sojina',
    confidence: 0.78,
    severity: 'media',
    description:
      'Doença fúngica foliar que forma lesões circulares com centro acinzentado e bordas marrom-avermelhadas, lembrando um olho de rã. Em cultivares suscetíveis e sob alta pressão, a desfolha precoce pode reduzir a produtividade de forma significativa.',
    actionPlan: {
      essencial: [
        'Aplicar fungicida com estrobilurina + triazol ao detectar as primeiras lesões',
        'Anotar a cultivar da área — a resistência genética é o controle mais eficaz',
        'Monitorar a cada 7-10 dias, olhando o terço médio da planta',
      ],
      campo: [
        'Aplicar fungicida sistêmico (estrobilurina + triazol) no aparecimento das primeiras lesões, tipicamente entre R1 e R3',
        'Priorizar cultivares com resistência a Cercospora sojina no planejamento da próxima safra — é o controle de melhor custo-benefício',
        'Rotacionar com milho ou outra não hospedeira por 1-2 safras para reduzir o inóculo nos restos culturais',
        'Evitar semeadura sobre palhada de soja infectada sem incorporação ou decomposição adequada',
        'Programar segunda aplicação em 14-21 dias com rotação de grupo químico, se a pressão persistir',
        'Registrar a cultivar e a severidade por talhão — a raça do patógeno varia por região',
      ],
      especialista: [
        'Identificação — Lesões circulares a angulares de 1-5 mm, centro cinza-claro e halo marrom-avermelhado bem definido. Diferencia-se da mancha-alvo (Corynespora cassiicola) pela ausência dos anéis concêntricos e pelo tamanho menor da lesão',
        'Epidemiologia — Cercospora sojina sobrevive em restos culturais e sementes infectadas. Conídios são disseminados por vento e respingos de chuva. Condições favoráveis: temperatura 25-30°C e períodos prolongados de molhamento foliar',
        'Resistência genética — É o principal método de manejo. A resistência é governada por genes Rcs, mas a existência de múltiplas raças do patógeno exige acompanhamento regional do monitoramento de raças',
        'Controle químico e resistência a QoI — Populações resistentes a estrobilurinas (mutação G143A) já foram relatadas no Brasil e nos EUA. Não usar estrobilurina isolada; sempre em mistura com triazol ou carboxamida, e limitar o número de aplicações do mesmo grupo por safra',
        'Tecnologia de aplicação — Volume de calda de 150 L/ha com gotas finas a médias. A cobertura do terço médio e inferior do dossel é crítica, pois é onde as lesões se estabelecem primeiro',
        'Impacto — Perdas típicas de 10-30% em cultivares suscetíveis sob alta pressão, principalmente por desfolha precoce e redução no enchimento de grãos',
      ],
      sources: [
        { name: 'EMBRAPA Soja', detail: 'Manejo de doenças foliares da soja — mancha olho-de-rã', url: 'https://www.embrapa.br/soja' },
        { name: 'Zhang, G. et al. (2018)', detail: 'Frogeye leaf spot of soybean: pathogen biology and QoI resistance. Plant Disease, 102(12)' },
        { name: 'ASDID (Zenodo, DOI 10.5281/zenodo.7304859)', detail: 'Dataset de imagens usado no treinamento dos modelos — classe mancha-olho-de-ra', url: 'https://doi.org/10.5281/zenodo.7304859' },
      ],
    },
  },
  {
    id: 'cercosporiose',
    name: 'Cercosporiose',
    scientificName: 'Cercospora kikuchii',
    confidence: 0.84,
    severity: 'media',
    description:
      'Doença fúngica que causa manchas púrpuras nas folhas e sementes. O fungo sobrevive nas sementes infectadas e nos restos culturais, sendo favorecido por temperaturas entre 23-27 graus e alta umidade.',
    actionPlan: {
      essencial: [
        'Aplicar fungicida à base de benzimidazol ou estrobilurina',
        'Utilizar sementes certificadas e tratadas',
        'Eliminar restos culturais após a colheita',
      ],
      campo: [
        'Aplicar fungicida sistêmico (benzimidazol + estrobilurina) na fase R3-R4, quando os sintomas foliares se intensificam',
        'Realizar segunda aplicação em R5.1 para proteger as vagens em formação contra a "mancha púrpura da semente"',
        'Utilizar sementes com certificação de sanidade — lotes com menos de 3% de sementes manchadas',
        'Tratar sementes com carboxim + tiram para eliminar o inóculo presente no tegumento',
        'Incorporar restos culturais com grade para acelerar a decomposição e redução do inóculo',
        'Realizar rotação com milho, sorgo ou culturas não hospedeiras por pelo menos 1 safra',
      ],
      especialista: [
        'Identificação — Cercospora kikuchii causa dois sintomas distintos: (1) crestamento foliar — lesões angulares púrpura-avermelhadas no limbo foliar; (2) mancha púrpura da semente — descoloração púrpura no tegumento. A toxina cercosporina (fotoativada) é responsável pela necrose tecidual',
        'Epidemiologia — Patógeno necrotrófico com fase saprofita em restos culturais. A cercosporina é produzida sob luz e causa peroxidação lipídica nas células vegetais. Condições ótimas: 23-27°C, alta umidade, e períodos alternados de sol e chuva. Disseminação por esporos transportados pelo vento e respingos',
        'Resistência e sensibilidade — Populações de C. kikuchii no Brasil mantêm boa sensibilidade a benzimidazóis e estrobilurinas. Porém, monitorar a eficácia — há relatos de redução de sensibilidade a QoIs (estrobilurinas) em outras espécies de Cercospora. Uso de multissítios como parceiro de mistura é recomendado',
        'Impacto na qualidade comercial — A mancha púrpura da semente não afeta significativamente a germinação, mas causa desclassificação do lote para produção de sementes. Em mercados de exportação, grãos manchados sofrem deságio de 5-15% no preço. O impacto econômico total (produtividade + qualidade) pode chegar a 20-30%',
        'Manejo integrado avançado — Combinar: (1) cultivares com tolerância; (2) tratamento de sementes biológico (Bacillus amyloliquefaciens) + químico; (3) aplicação foliar estratégica em R3 e R5.1; (4) rotação de culturas com gramíneas; (5) eliminação de soja voluntária',
        'Pesquisa e tendências — Novos fungicidas do grupo SDHI (carboxamidas) mostram excelente controle. Estudos com indutores de resistência (acibenzolar-S-metílico) apresentam redução de 25-40% na severidade quando aplicados preventivamente. Cultivares com gene de resistência Rcs3 estão em fase de validação',
      ],
      sources: [
        { name: 'EMBRAPA Soja', detail: 'Documentos 351 — Cercosporiose da Soja: epidemiologia e manejo', url: 'https://www.embrapa.br/soja' },
        { name: 'Almeida, A.M.R. et al. (2005)', detail: 'Doenças da soja. In: Manual de Fitopatologia, 4a ed., Agronômica Ceres' },
        { name: 'FRAC - Fungicide Resistance Action Committee', detail: 'Monitoramento de resistência a fungicidas em Cercospora spp.', url: 'https://www.frac.info' },
        { name: 'PlantVillage - Penn State University', detail: 'Dataset de imagens para treinamento dos modelos de classificação', url: 'https://plantvillage.psu.edu' },
      ],
    },
  },
  {
    id: 'mildio',
    name: 'Míldio',
    scientificName: 'Peronospora manshurica',
    confidence: 0.81,
    severity: 'baixa',
    description:
      'Doença fúngica que causa manchas verde-claras a amareladas na face superior das folhas, com esporulação acinzentada na face inferior. Normalmente não causa perdas significativas, mas pode indicar condições favoráveis a outras doenças.',
    actionPlan: {
      essencial: [
        'Monitorar a evolução da doença',
        'Aplicar fungicida preventivo se a incidência aumentar',
        'Preferir cultivares com resistência genética',
      ],
      campo: [
        'Monitoramento semanal — o míldio sozinho raramente causa perdas expressivas, mas pode indicar microclima favorável a doenças mais severas',
        'Se a incidência foliar ultrapassar 25%, aplicar fungicida à base de metalaxil ou cimoxanil + mancozebe',
        'Selecionar cultivares com genes Rpm (resistência a Peronospora) para as próximas safras',
        'Ajustar a época de semeadura para evitar coincidir o estágio vegetativo com períodos de alta umidade',
        'Manejar o espaçamento entre linhas para favorecer a ventilação e redução da umidade na copa',
      ],
      especialista: [
        'Identificação — Manchas verde-claras a amareladas (cloróticas) na face adaxial, com esporulação cinza-esbranquiçada (esporangióforos e esporângios) na face abaxial. Em infecções severas, as manchas coalescem e causam necrose. Sementes infectadas apresentam crosta esbranquiçada de oósporos no tegumento',
        'Epidemiologia — Oomiceto biotrófico obrigatório. Sobrevive como oósporos em sementes e restos culturais por até 3 anos. A infecção sistêmica a partir de sementes contaminadas resulta em plantas com nanismo e esporulação generalizada. Condições ótimas: 20-22°C, umidade relativa >90%, orvalho prolongado',
        'Relevância agronômica — Embora considerado de menor importância econômica isoladamente (perdas de 2-8%), o míldio é um indicador biológico de condições favoráveis a patógenos mais agressivos (ferrugem, septoriose). Sua presença deve motivar intensificação do monitoramento geral da lavoura',
        'Controle e manejo — O controle químico raramente se justifica economicamente para míldio isolado. Quando necessário, fungicidas do grupo fenilamidas (metalaxil-M) são mais eficazes. A principal estratégia é o uso de cultivares resistentes — mais de 30 genes Rpm já foram identificados em germoplasma de soja',
        'Manejo de sementes — Lotes com mais de 10% de sementes com crosta de oósporos devem ser descartados para uso como semente. O tratamento com metalaxil reduz mas não elimina a transmissão. Preferir sementes certificadas de lotes sadios',
      ],
      sources: [
        { name: 'EMBRAPA Soja', detail: 'Circular Técnica 62 — Míldio da Soja: etiologia e controle', url: 'https://www.embrapa.br/soja' },
        { name: 'Hartman, G.L. et al. (2015)', detail: 'Compendium of Soybean Diseases and Pests, 5th Ed., APS Press' },
        { name: 'AGROFIT - MAPA', detail: 'Produtos registrados para Peronospora manshurica em soja', url: 'https://agrofit.agricultura.gov.br' },
        { name: 'PlantVillage - Penn State University', detail: 'Dataset de imagens para treinamento dos modelos de classificação', url: 'https://plantvillage.psu.edu' },
      ],
    },
  },
  {
    id: 'saudavel',
    name: 'Folha Saudável',
    scientificName: 'Glycine max',
    confidence: 0.95,
    severity: 'nenhuma',
    description:
      'Nenhuma doença ou praga detectada. A folha apresenta coloração e textura normais, indicando bom estado fitossanitário da planta.',
    actionPlan: {
      essencial: [
        'Continuar o monitoramento regular da lavoura',
        'Manter o programa preventivo de manejo integrado de pragas',
      ],
      campo: [
        'Manter monitoramento semanal com caminhamento em zigue-zague pela lavoura',
        'Realizar amostragens com pano de batida para detecção de pragas (lagartas e percevejos)',
        'Manter calendário de aplicações preventivas de fungicidas conforme estágio fenológico',
        'Avaliar o estado nutricional com análise foliar em V4-V6 para correção de micronutrientes',
      ],
      especialista: [
        'Status fitossanitário — A folha apresenta coloração verde uniforme, turgidez adequada e ausência de lesões, cloroses ou deformações. Indicativo de bom equilíbrio nutricional e sanitário da planta',
        'Manejo preventivo recomendado — Mesmo em ausência de sintomas, manter: (1) monitoramento semanal com coleta de 30 pontos por talhão; (2) uso de armadilhas (feromônio para Helicoverpa, pano de batida para percevejos); (3) aplicação preventiva de fungicida em R1 conforme histórico da área',
        'Nutrição e defesa da planta — Plantas bem nutridas apresentam maior resistência a patógenos. Garantir níveis adequados de potássio (aumenta espessura da parede celular), manganês (cofator de enzimas de defesa) e silício (barreira física). Considerar uso de bioestimulantes à base de Ascophyllum nodosum',
        'Registro e histórico — Documentar a condição saudável neste ponto da lavoura para construção de histórico espacial. Dados de áreas sadias vs. afetadas ao longo das safras permitem identificar padrões e zonas de risco para manejo localizado',
      ],
      sources: [
        { name: 'EMBRAPA Soja', detail: 'Tecnologias de Produção de Soja — Região Central do Brasil', url: 'https://www.embrapa.br/soja' },
        { name: 'Fundação MT', detail: 'Boletim de Pesquisa — Manejo Integrado de Pragas da Soja', url: 'https://www.fundacaomt.com.br' },
        { name: 'PlantVillage - Penn State University', detail: 'Dataset de imagens para treinamento dos modelos de classificação', url: 'https://plantvillage.psu.edu' },
      ],
    },
  },
];

export const chatResponses = {
  greeting:
    'Olá! Sou o Zé Praga, seu assistente de diagnóstico fitossanitário. Envie uma foto da folha de soja para que eu possa analisar, ou pergunte sobre pragas e doenças da cultura.',
  noImage:
    'Para realizar um diagnóstico preciso, preciso que você envie uma foto da folha de soja. Você pode tirar uma foto ou selecionar uma imagem da galeria.',
  about:
    'Sou uma ferramenta de inteligência artificial desenvolvida para auxiliar produtores rurais na detecção de pragas e doenças em lavouras de soja. Utilizo modelos de visão computacional treinados com milhares de imagens para identificar as principais doenças da cultura.',
  ferrugem:
    'A ferrugem asiática (Phakopsora pachyrhizi) é a doença mais destrutiva da soja no Brasil. Ela pode causar perdas de até 80% da produtividade. O monitoramento constante e a aplicação preventiva de fungicidas são essenciais para o controle.',
  mancha:
    'A mancha-alvo (Corynespora cassiicola) é uma doença fúngica que tem se tornado cada vez mais importante nas lavouras brasileiras. O uso de cultivares resistentes e a rotação de culturas são estratégias importantes de controle.',
  default:
    'Entendo sua dúvida! Para uma análise mais detalhada, recomendo enviar uma foto da folha afetada. Posso identificar a doença e sugerir um plano de ação específico.',
};
