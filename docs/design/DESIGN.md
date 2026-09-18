# Direção visual — Zé Praga

## Decisão

**Campo próximo** é a direção adotada. O produto se apresenta como um caderno de
campo para observar folhas de soja: fotografia → hipótese do modelo → próximos
cuidados → registro. A conversa continua uma ferramenta de investigação, não a
estrutura dominante da tela.

## Propostas comparadas

| Proposta | Uso | Decisão |
| --- | --- | --- |
| Campo próximo | fotografia documental, ficha de observação, divisórias e espaço generoso | Escolhida |
| Atlas sóbrio | tabelas e nomenclatura botânica como linguagem principal | Reservada a Modelos/API |

Campo próximo foi escolhido porque mantém a entrada na tarefa real (uma folha)
e permite que a mesma referência visual siga do envio ao histórico. O atlas é
útil para explicar método, mas denso demais para iniciar uma análise.

## Sistema

- Fundo: papel e papel sombreado; estruturas em mata/solo; superfície branca
  apenas quando uma ficha precisa se separar do caderno.
- Tipografia: Bricolage Grotesque nos títulos e DM Sans em leitura. Caveat não
  entra em status, formulário ou dados.
- Espaço: 4, 8, 12, 16, 24, 32, 48 e 64 px. Conteúdo até 1200 px.
- Raio: controles 8 px, fichas 12 px e pílulas apenas para chips.
- Movimentos: 120–240 ms para mudança de estado. Sem contadores temporizados,
  varredura sobre lesão ou digitação/apagamento de progresso. `prefers-reduced-motion`
  reduz animações já suportadas pelo tema e pelo Framer Motion.

## Regras de conteúdo

- “Hipótese” e “confiança do modelo” nunca significam confirmação de campo.
- Severidade do catálogo não é medida da imagem; não é apresentada como tal.
- O resultado simulado é identificado em demo.
- Foto da análise usa `contain`; thumbnail pode usar `cover` somente como resumo.
- A foto editorial não é requisito para a tarefa e tem fallback textual.

## Direção por rota

Home abre a observação e mostra como capturar; autenticação prioriza o formulário;
análise usa bancada com fotografia e ficha; detalhe e histórico são páginas do
caderno; perfil, planos e conteúdos técnicos recebem a mesma estrutura de título,
divisória e fichas, sem hero fotográfico repetido.
