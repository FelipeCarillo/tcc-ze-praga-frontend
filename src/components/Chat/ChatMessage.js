import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { Check, Mic } from 'lucide-react';
import DiagnosisCard from './DiagnosisCard';
import Markdown from '../common/Markdown';
import AuxiliarNotice from '../common/AuxiliarNotice';
import { copy } from '../../copy/ze';

/**
 * Passos do agente (m-Chat): o que já foi feito com ✓ e o passo atual girando.
 * Os rótulos vêm de `copy.chat.tools` (em andamento) e `copy.chat.toolsDone`.
 */
export function StepsList({ steps }) {
  if (!steps || !steps.length) return null;
  return (
    <Box
      component="ul"
      aria-label="O que o Zé fez"
      sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}
    >
      {steps.map((s, i) => {
        const label = s.done
          ? copy.chat.toolsDone[s.name] || copy.chat.toolsDone._fallback
          : copy.chat.tools[s.name] || copy.chat.tools._fallback;
        return (
          <Box
            key={`${s.name}-${i}`}
            component={motion.li}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem', color: 'text.secondary' }}
          >
            {s.done ? (
              <Box component="span" sx={{ display: 'flex', color: 'primary.main' }} aria-label="feito">
                <Check size={16} strokeWidth={3} />
              </Box>
            ) : (
              <Box
                component={motion.span}
                aria-label="em andamento"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                sx={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid', borderColor: 'primary.main', borderTopColor: 'transparent', flexShrink: 0 }}
              />
            )}
            <Box component="span" sx={{ color: s.done ? 'text.secondary' : 'text.primary' }}>
              {label}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const steps = !isUser ? message.steps || [] : [];

  // Antes do primeiro token não há balão: os passos do agente mostram o
  // progresso. Sem passos ainda, quem cobre é o TypingIndicator do ChatWindow.
  if (!isUser && message.isStreaming && !message.content && !steps.length) {
    return null;
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 1.25, mb: 1.25 }}
    >
      {!isUser && <StepsList steps={steps} />}

      {(isUser || message.content) && (
        <Box
          sx={{
            maxWidth: isUser ? { xs: '78%', md: '60%' } : { xs: '88%', md: '78%' },
            borderRadius: isUser ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
            bgcolor: isUser ? 'primary.main' : 'background.paper',
            color: isUser ? '#FFFFFF' : 'text.primary',
            border: isUser ? 'none' : '1px solid',
            borderColor: 'divider',
            p: isUser && message.imageUrl ? 0.75 : 0,
            overflow: 'hidden',
          }}
        >
          {message.imageUrl && (
            <Box
              component="img"
              src={message.imageUrl}
              alt="Foto enviada"
              sx={{ width: '100%', maxHeight: 220, borderRadius: '15px', display: 'block', objectFit: 'cover' }}
            />
          )}
          {isUser ? (
            message.content && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, px: message.imageUrl ? 1 : 2, pt: message.imageUrl ? 0.75 : 1.5, pb: message.imageUrl ? 0.75 : 1.5 }}>
                {/* Marca que o texto veio do áudio, não do teclado. */}
                {message.isTranscript && <Mic size={13} style={{ flexShrink: 0, marginTop: 4, opacity: 0.75 }} />}
                <Typography component="div" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.4, fontSize: '1rem' }}>
                  {message.content}
                </Typography>
              </Box>
            )
          ) : (
            // Markdown também durante o streaming: formata o texto ao vivo.
            <Box sx={{ px: 1.75, py: 1.5, lineHeight: 1.45, fontSize: '0.9375rem', '& p': { m: 0 }, '& p + p': { mt: 1 } }}>
              <Markdown>{message.content}</Markdown>
            </Box>
          )}
        </Box>
      )}

      {/* Toda resposta concluída do Zé carrega o aviso de auxiliar. */}
      {!isUser && !message.isStreaming && message.content && !message.diagnosis && (
        <Box sx={{ maxWidth: { xs: '88%', md: '78%' } }}>
          <AuxiliarNotice compact />
        </Box>
      )}

      {!isUser && message.diagnosis && (
        <Box sx={{ width: { xs: '88%', md: '78%' } }}>
          <DiagnosisCard diagnosis={message.diagnosis} />
        </Box>
      )}
    </Box>
  );
}

export default ChatMessage;
