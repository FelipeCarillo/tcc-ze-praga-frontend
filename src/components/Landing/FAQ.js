import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'Preciso pagar?', a: 'Não. O Zé é de graça pro produtor, pra sempre. Quem quiser ajudar a manter no ar vira Compadre por R$ 19/mês — mas é opcional.' },
  { q: 'Funciona offline?', a: 'A análise precisa de internet, mas eu guardo sua última conversa e o histórico no aparelho. Sem sinal, eu te aviso e mando assim que voltar.' },
  { q: 'E se você errar?', a: 'Eu mostro minha confiança e as outras hipóteses que considerei. Se a foto tiver pouca luz ou estiver borrada, eu falo "não sei" em vez de chutar.' },
  { q: 'Tá disponível pra outras culturas?', a: 'Hoje cuido de soja (8 classes). Milho, café e algodão estão no roadmap pra 2026.' },
  { q: 'Minha foto fica salva?', a: 'Só se você quiser. Depois do diagnóstico eu pergunto se guardo no seu histórico. Você manda apagar quando quiser.' },
  { q: 'É igual receita de agrônomo?', a: 'É um apoio rápido pra orientar a decisão no campo. Pra casos sérios, leve meu diagnóstico (dá pra exportar em PDF) pro seu agrônomo.' },
];

function FAQ() {
  return (
    <Box sx={{ py: { xs: 7, md: 9 }, px: { xs: 3, md: 7 }, backgroundColor: 'background.default' }}>
      <Box sx={{ maxWidth: 760, mx: 'auto' }}>
        <Typography variant="h2" sx={{ textAlign: 'center', mb: 4 }}>
          Dúvidas que aparecem
        </Typography>
        {faqs.map((f) => (
          <Accordion
            key={f.q}
            disableGutters
            elevation={0}
            sx={{
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              mb: 1.5,
              '&:before': { display: 'none' },
              overflow: 'hidden',
            }}
          >
            <AccordionSummary expandIcon={<ChevronDown size={18} />}>
              <Typography sx={{ fontFamily: (t) => t.typography.fontFamilyDisplay, fontWeight: 600, fontSize: '1rem' }}>
                {f.q}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                {f.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}

export default FAQ;
