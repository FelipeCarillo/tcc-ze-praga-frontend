# Prompt para executar a refatoração visual com Terra

Cole o texto abaixo em uma tarefa Terra que tenha acesso a `C:\Users\felip\Projects\tcc`. Se a conversa não tiver acesso a arquivos, forneça também o plano e o código necessário; este prompt sozinho não concede acesso ao workspace.

---

Quero que você execute a refatoração visual completa do Zé Praga descrita em `frontend/docs/PLANO-IDENTIDADE-VISUAL-2026-09-17.md`. O objetivo é uma interface própria de um produto de observação de doenças foliares de soja, com fotografia documental e um caderno de campo visual. A conversa continua funcional, mas foto, hipótese e plano de ação passam a organizar a experiência. Preserve a identificação do uso de modelos e suas limitações.

Comece lendo AGENTS.md da raiz e do frontend, a auditoria de 06/09, a entrega de UX de 08/09 e o plano novo inteiro. Confirme o estado atual do código: o plano foi escrito sobre frontend `bbe8a9d`, e os arquivos podem ter evoluído. Preserve mudanças locais. Use Graphify para localizar relações e confirme as relações importantes no código. Não trate a auditoria antiga como lista integral de problemas ainda abertos.

Execute as etapas A–I do plano. Registre progresso, decisões, verificações e pendências em `frontend/docs/design/EXECUCAO.md`, com cobertura por rota. Não pare depois da home nem entregue somente um protótipo isolado. Faça incrementos pequenos e continue pelas partes independentes quando houver um bloqueio externo. Use a direção Campo próximo como decisão padrão, sem pedir aprovação de cada escolha reversível.

Mantenha React, CRA, MUI, tokens de marca e Framer Motion existentes. Não migre para Next.js/Tailwind/shadcn, não acrescente motores de animação sem justificativa e não redesenhe backend/banco para viabilizar uma mudança visual. Use uma skill principal de direção visual se estiver disponível, mais revisão React e verificação no navegador. Leia o SKILL.md ao usar uma skill. Skills externas citadas no plano foram pesquisadas, não instaladas; não são pré-requisito. Este briefing prevalece sobre sugestões estéticas genéricas.

Implemente composição e hierarquia, não apenas troca de cor/fonte. Revise início, login/cadastro/redefinição, análise, resultado, plano de ação, histórico, perfil, planos/ativação, modelos, sobre, API, 404 e componentes globais. Preserve todos os fluxos existentes, incluindo texto livre, voz, SSE, cancelamento, recuperação, perguntas HITL, sessões, quotas e gates de plano. Não associe resultado antigo a foto nova, não duplique chamadas de inferência e não crie progresso fictício.

Use fotografias reais autorizadas e registre origem/crédito em ASSETS.md. Não gere imagens para fingir documentação real, membros da equipe ou evidência diagnóstica. Se faltar mídia final, implemente o restante com acervo autorizado e registre a pendência com o brief de captura; não declare esse item concluído. Vídeo é opcional, com poster, controle e redução de movimento. Corrija textos incompatíveis com a implementação, incluindo a promessa de chat anônimo no login se ainda existir.

Valide em navegador 360/390/768/1366 px, claro/escuro, teclado, zoom e os estados descritos no plano. Rode os testes e build do frontend. Teste a associação foto/resultado e visibilidade de HITL. Separe explicitamente inspeção visual, testes automatizados, integração local, inferência real e produção. Mock não comprova inferência; não execute seeds/migrations destrutivos nem exponha segredos. Atualize o grafo localmente por AST se as relações mudarem.

Conclua com arquivos alterados, como rodar, evidências antes/depois, resultados dos testes e pendências reais. Não faça deploy nem crie outra tarefa automaticamente. O trabalho está concluído quando as rotas e critérios do plano estiverem atendidos, com qualquer dependência externa ainda não resolvida claramente identificada.
