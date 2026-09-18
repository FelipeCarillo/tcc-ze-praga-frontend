# Baseline da refatoração visual — 17/09/2026

Frontend em `bbe8a9d`; alterações locais prévias preservadas: somente
`docs/PLANO-IDENTIDADE-VISUAL-2026-09-17.md` e
`docs/PROMPT-TERRA-REFATORACAO-VISUAL.md`, ambos não rastreados.

## Evidência inicial

- Demo local em `http://127.0.0.1:3100`, rota `/`, carregou sem overlay de erro.
- Inspeção em navegador: home desktop clara, marca/nav, CTA “Analisar uma folha”,
  foto, orientação e aviso de demonstração presentes.
- A home anterior usava zoom e faixa luminosa em loop sobre `soybean-rust.jpg`.
- Login ainda afirmava que não era necessária conta para chat; o guard de rota
  exige sessão. Este texto é uma regressão de copy a corrigir, não uma função a
  liberar.
- Baseline automatizado: 15 suítes / 78 testes passaram.

## Inventário de rotas e destino

| Rota | Estado crítico | Destino desta execução |
| --- | --- | --- |
| `/` | CTA, tema, demo | abertura documental e guia de captura |
| `/login`, `/redefinir-senha` | cadastro, retorno, recuperação | formulário e copy coerentes |
| `/chat` | foto, SSE, abort, voz, HITL, sessão | bancada de análise sem novo transporte |
| `/historico`, `/historico/:id` | paginação, exclusão, PDF, imagem indisponível | fichas do caderno |
| `/perfil` | perfil, tema, talhões | grupos de configuração |
| `/planos`, `/planos/pagamento/:planName` | gate e ativação demonstrativa | comparação honesta |
| `/modelos`, `/sobre`, `/api-docs` | métrica, conteúdo e contratos | páginas editoriais/técnicas legíveis |
| `*` | retorno seguro | página de ausência integrada |

Não foi feita inferência ONNX real, produção, câmera/microfone físico ou ensaio
com pessoas nesta baseline.
