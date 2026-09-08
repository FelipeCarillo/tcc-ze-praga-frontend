# Entrega de UX/UI local — Zé Praga

Data: 08/09/2026. Escopo: refatoração do frontend para celular, preservando uso
em desktop, identidade visual e contratos REST/SSE. Complementa a
[auditoria de 06/09](AUDITORIA-TCC-2026-09-06.md), que permanece como registro
histórico do estado anterior. Não houve publicação nem alteração de infraestrutura
de produção.

## Rodar no computador

### Demonstração da interface

No PowerShell, dentro de `frontend/`:

```powershell
npm.cmd ci
npm.cmd run start:demo
```

Acesse **http://127.0.0.1:3100/**. Na entrada, use a opção de demonstração.
Fotos, conversas, histórico e plano ficam no navegador, com análises simuladas
identificadas na interface e nos PDFs. Não é necessário fornecer dados pessoais,
cartão ou credenciais externas. Os resultados demonstrativos não classificam a foto.
Uma imagem que não seja uma planta também pode receber um resultado simulado.

Os scripts definem as flags explicitamente sem editar `.env`:

- `start:demo`: autenticação mock e dados mock.
- `start:local`: autenticação `api` e dados reais via API em `127.0.0.1:8000`.
- `build:local`: build com o mesmo contrato da API local.

### API e banco isolados para testar contratos

Requisitos: Docker Desktop em execução e `uv`. Na pasta `backend/`:

```powershell
docker compose -p zepraga-ux-local up -d db
uv run python -m scripts.local_dev setup
uv run python -m scripts.local_dev serve
```

O projeto Compose usa volume próprio. `setup` aplica migrations e catálogos
somente no PostgreSQL local configurado pelo helper. A porta 5432 precisa estar
disponível para esse banco. Não execute outro banco nessa mesma porta ao usar
esse roteiro.

Em outro terminal, ainda em `backend/`, verifique os contratos:

```powershell
uv run python -m scripts.smoke_local
```

Esse smoke cria uma conta sintética, 25 registros e um talhão; remove os registros
e o talhão ao concluir. A conta e sua assinatura de teste permanecem no banco
local. Ele não executa inferência ONNX nem conversa com o agente.

Para abrir o frontend ligado à API em uma segunda porta, em `frontend/`:

```powershell
$env:PORT='3101'
npm.cmd run start:local
```

Acesse **http://127.0.0.1:3101/**. Cadastre uma conta local própria para inspecionar
autenticação, perfil, planos e estados vazios. O helper da API desativa acesso a
LLM, Storage e e-mail externos, portanto esse ambiente **não oferece o fluxo real
completo de diagnóstico pelo agente**. A chave JWT é efêmera: após reiniciar a API,
entre novamente. Os dados do PostgreSQL persistem no volume local.

Serviços ficam restritos a `127.0.0.1`. A revisão de celular usou viewport de
navegador; um telefone físico não acessa esse endereço do computador.

## O que mudou e por quê

| Auditoria | Entrega / justificativa | Critério de aceitação e evidência |
|---|---|---|
| UX-002, 012 | Resultado como hipótese; confiança explicada; severidade não apresentada como medição visual; remoção de promessas de aprendizado e prazos garantidos | Resultado e PDF deixam explícitos os limites; inspeção visual e revisão dos textos |
| UX-003 | Service worker guarda somente assets estáticos com hash; limpeza dos caches antigos do aplicativo | Respostas privadas e HTML não entram no cache; revisão do código. Offline não promete fila automática |
| UX-004 | Proteção de rotas, retorno ao destino após login e entrada de demonstração explícita | Acesso ao chat exige sessão; navegação e retorno inspecionados no navegador |
| UX-005, 006 | Histórico usa paginação, total e busca do servidor; exclusão confirmada e resultado validado | Smoke HTTP com 25 registros, páginas 2/3, busca e exclusão; testes do serviço |
| UX-007 | Exportação de histórico e registro com AutoTable compatível, paginação e carregamento sob demanda | Testes do exportador; PDFs de 3 e 4 páginas gerados pelo código real e todas as páginas inspecionadas |
| UX-008 | Reabertura de sessão carrega diagnóstico por ID quando necessário e recupera pergunta pendente | Reabertura de conversa demonstrativa inspecionada; testes de sessão e proteção contra respostas fora de ordem |
| UX-009 | Cancelamento, isolamento entre turnos e sessões, bloqueio de envio duplo, SSE sem atraso artificial | Testes de abort, encerramento sem evento final, concorrência, sessão antiga e retomada HITL |
| UX-010 | Foto passa por prévia e confirmação; validação comum; voz pode ser ouvida/descartada; rascunho preservado em falha | Testes do componente e do validador; upload e análise simulada no navegador. Hardware de voz/câmera pendente |
| UX-011 | Plano de ação tem carregamento, falha recuperável e chave por doença | Testes de troca rápida de doença e nova tentativa |
| UX-014 | Plano atualizado após ativação; seletores respeitam recursos; ausência de plano aplica ResNet-50 | Ativação Pro simulada inspecionada; smoke HTTP valida recursos reais; testes de plano e envio |
| UX-015, 016 | Tokens de contraste, foco visível, alvos de toque, navegação inferior, hierarquia de resultado, títulos e redução de movimento | Inspeção em 390×844 e 1366×900, claro/escuro, teclado; foco de botão confirmado com contorno de 3 px |
| UX-017 | Ativação acadêmica sem formulário de cartão; perfil/talhões com estados e confirmação; vínculo com análises não prometido | Ativação no navegador e CRUD de talhão via HTTP local |
| UX-018 | Scripts locais, CI com testes e build, testes de regressão, documentação e grafo atualizados | Comandos reproduzíveis e evidências abaixo |

Entrada, login, redefinição de senha, chat, resultado, histórico, perfil, planos,
ativação, projeto, modelos, documentação da API e página não encontrada receberam
revisões. Foto e próximo passo têm prioridade no celular; detalhes técnicos ficam
nas páginas de modelos/API e em controles secundários.

### Pontos parcialmente atendidos ou pendentes

- **UX-001 — bloqueador para diagnóstico real:** o backend ainda pode recorrer a
  inferência mock após falha. Antes de afirmar que a classificação real está pronta,
  remover esse sucesso aparente no modo real, retornar falha explícita e validar
  ONNX + agente + persistência + leitura da imagem, inclusive cenários de erro.
  A faixa de demonstração do frontend não detecta esse fallback do backend.
- **UX-013 — parcial:** documentação e experimentação usam endpoints atuais, mas
  ainda falta fechar o gerenciamento de chaves de API na interface. Isso é
  secundário ao fluxo de foto, resultado e histórico.
- **UX-008 — limite:** o teste visual de reabertura foi feito no modo demonstrativo;
  a recuperação completa com agente, perguntas persistidas e Storage real ainda
  precisa de ensaio integrado.
- **UX-015 — limite:** esta revisão não é certificação WCAG, teste com leitor de
  tela nem pesquisa de usabilidade com produtores. Faltam telefone físico,
  teclado virtual, câmera, microfone e Safari/iOS.
- Cadastro de talhões existe, mas associação de diagnósticos ao talhão não foi
  implementada nesta rodada. Não é necessário acrescentar essa função para
  demonstrar o fluxo principal, desde que o escopo seja explicado.

## Verificação e limites

| Camada | Evidência |
|---|---|
| Frontend automatizado | 76 testes, 14 suítes; inclui transporte SSE, concorrência, prévia, falha de envio, histórico, planos de ação e PDF |
| Build local para API | Build de produção com CI=true e sourcemaps desativados; bundle principal aproximadamente 332 kB gzip, contra 473,61 kB da auditoria (~30% menor) |
| Backend automatizado | 881 testes passaram, 4 live excluídos; cobertura 90,98%; mypy em 128 arquivos passou na rodada local anterior aos últimos ajustes de UI; Ruff app/tests e os dois helpers passou ao final |
| API + PostgreSQL reais locais | Cadastro, login, perfil, plano, 25 registros paginados, busca, detalhe, rejeição sem autenticação, planos de ação, talhão, confirmação de exclusão e interrupts passaram via HTTP |
| Navegador | Entrada/retorno ao chat, upload com prévia, espera, resultado simulado, reabertura, histórico, busca vazia, perfil, tema, plano, métricas e foco de teclado inspecionados |
| PDF | Amostras sintéticas de 30 orientações e 80 registros; 7 páginas renderizadas com Poppler e inspecionadas, sem cortes ou sobreposição |
| Download pelo navegador embutido | Botão acionado sem erro no console; a automação não recebeu evento de download dentro do prazo. Salvamento pelo navegador ainda precisa de confirmação manual; geração do arquivo validada diretamente pelo exportador |
| Inferência real | Não validada ponta a ponta nesta entrega; dados do smoke são sintéticos e a UI principal está em demonstração |
| Produção e serviços externos | Não validados nem publicados; nenhuma certificação de LLM, Storage, e-mail, busca externa ou cobrança |

Os avisos de ferramenta são Browserslist desatualizado e depreciação `fs.F_OK`
no toolchain CRA. O build convencional também pode informar sourcemaps ausentes
de `@microsoft/fetch-event-source`; o build de CI desativa sourcemaps.

Grafo atualizado por AST, sem extração semântica externa: **3.773 nós, 8.440
arestas consolidadas, 232 comunidades**. A atualização informou 9 arquivos sem nós;
o grafo não comprova execução de serviços.

## Roteiro de apresentação local

1. Abrir a entrada e explicar o objetivo: apoio à observação de doenças foliares de soja.
2. Entrar em demonstração, avisando que o fluxo exibido usa resultados simulados.
3. Selecionar uma foto, conferir a prévia e confirmar a análise.
4. Explicar hipótese, confiança, limites e orientações do catálogo.
5. Abrir o registro e encontrá-lo novamente pelo histórico.
6. Mostrar o plano Pro demonstrativo e a exportação; conferir manualmente o download antes do ensaio.
7. Apresentar métricas do ASDID como avaliação experimental, sem extrapolar para desempenho em campo.

Para a entrega científica completa, realizar depois um ensaio com inferência
real sem fallback, revisar coerência do artigo com as métricas e observar pessoas
usando o fluxo em um celular. As decisões desta rodada usam heurísticas de UX;
não substituem essa avaliação com usuários.
