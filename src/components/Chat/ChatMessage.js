import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { Check, ChevronDown, Mic } from 'lucide-react';
import DiagnosisCard from './DiagnosisCard';
import TalhaoCriadoCard from './TalhaoCriadoCard';
import Markdown from '../common/Markdown';
import AuxiliarNotice from '../common/AuxiliarNotice';
import { copy } from '../../copy/ze';

// Etapas esperadas numa análise de foto (m-Chat-Analisando).
const IMAGE_FLOW = ['inspect_image', 'analyze_image', 'get_action_plan'];

function Spinner() {
  return (
    <Box
      component={motion.span}
      aria-label="em andamento"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      sx={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid', borderColor: 'primary.main', borderTopColor: 'transparent', flexShrink: 0 }}
    />
  );
}

/**
 * Passos do agente (m-Chat): o que já foi feito com ✓, o passo atual girando
 * e — numa análise de foto — o que ainda vem pela frente, em cinza.
 * Os rótulos vêm de `copy.chat.tools` / `toolsDone` / `toolsNext`.
 */
export function StepsList({ steps, upcoming = [] }) {
  if ((!steps || !steps.length) && !upcoming.length) return null;
  return (
    <Box component="ul" aria-label="O que o Zé fez" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 0.9 }}>
      {(steps || []).map((s, i) => {
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
            sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem', color: s.done ? 'text.secondary' : 'text.primary' }}
          >
            {s.done ? (
              <Box component="span" sx={{ display: 'flex', color: 'primary.main' }} aria-label="feito">
                <Check size={16} strokeWidth={3} />
              </Box>
            ) : (
              <Spinner />
            )}
            <span>{label}</span>
          </Box>
        );
      })}
      {upcoming.map((name) => (
        <Box key={'next-' + name} component="li" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
          <Box component="span" aria-label="a seguir" sx={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #8A9B86', boxSizing: 'border-box', flexShrink: 0 }} />
          <span>{copy.chat.toolsNext[name] || name}</span>
        </Box>
      ))}
    </Box>
  );
}

/** "Olhando sua folha…" — o cartão da análise em andamento (m-Chat-Analisando). */
function AnalysisCard({ steps }) {
  const seen = new Set((steps || []).map((s) => s.name));
  const upcoming = IMAGE_FLOW.filter((n) => !seen.has(n));
  return (
    <Box
      role="status"
      aria-label="O Zé está analisando a foto"
      sx={{
        width: { xs: '86%', md: 420 },
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '20px 20px 20px 6px',
        px: 2,
        py: 1.75,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        '@keyframes zpBar': { '0%': { left: '-40%' }, '100%': { left: '100%' } },
      }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>Olhando sua folha…</Typography>
      <Box sx={{ position: 'relative', height: 6, borderRadius: 999, bgcolor: 'surface.muted', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, bottom: 0, width: '40%', borderRadius: 999, bgcolor: 'primary.main', animation: 'zpBar 1.4s ease-in-out infinite', '@media (prefers-reduced-motion: reduce)': { animation: 'none', left: 0 } }} />
      </Box>
      <StepsList steps={steps} upcoming={upcoming} />
    </Box>
  );
}

/** Passos de um turno concluído, recolhidos: "3 passos concluídos ▾". */
function DoneSteps({ steps }) {
  const [open, setOpen] = useState(false);
  if (!steps || !steps.length) return null;
  return (
    <Box>
      <Box
        component="button"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        sx={{ border: 0, bgcolor: 'transparent', p: 0.5, fontFamily: 'inherit', fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer' }}
      >
        <Check size={14} strokeWidth={3} color="currentColor" style={{ color: 'inherit' }} aria-hidden="true" />
        {steps.length} {steps.length === 1 ? 'passo concluído' : 'passos concluídos'}
        <ChevronDown size={12} strokeWidth={2.6} style={{ transform: open ? 'rotate(180deg)' : 'none' }} aria-hidden="true" />
      </Box>
      {open && (
        <Box sx={{ pl: 0.5, pt: 0.75 }}>
          <StepsList steps={steps} />
        </Box>
      )}
    </Box>
  );
}

/** Foto enviada, com a varredura enquanto o Zé analisa. */
function PhotoBubble({ src, scanning, children }) {
  return (
    <Box sx={{ width: { xs: '72%', md: 340 }, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: '22px 22px 6px 22px', p: 0.75, overflow: 'hidden' }}>
      <Box sx={{ position: 'relative', borderRadius: '17px', overflow: 'hidden' }}>
        <Box component="img" src={src} alt="Foto enviada" sx={{ width: '100%', height: scanning ? 200 : 'auto', maxHeight: 240, objectFit: 'cover', display: 'block' }} />
        {scanning && (
          <>
            <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(11,21,16,.18)' }} />
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                left: 6,
                right: 6,
                height: 2,
                bgcolor: '#C8F169',
                boxShadow: '0 0 14px 3px rgba(200,241,105,.85)',
                '@keyframes zpScan': { '0%': { top: '4%' }, '50%': { top: '94%' }, '100%': { top: '4%' } },
                animation: 'zpScan 2.4s ease-in-out infinite',
                '@media (prefers-reduced-motion: reduce)': { animation: 'none', top: '50%' },
              }}
            />
          </>
        )}
      </Box>
      {children}
    </Box>
  );
}

function ChatMessage({ message, scanning = false, hideQuestion = false }) {
  const isUser = message.role === 'user';
  const steps = !isUser ? message.steps || [] : [];
  const analyzing = !isUser && message.isStreaming && message.hasImage && !message.content;

  // Antes do primeiro token não há balão: os passos do agente mostram o
  // progresso. Sem passos ainda, quem cobre é o TypingIndicator do ChatWindow.
  if (!isUser && message.isStreaming && !message.content && !steps.length && !message.hasImage && !message.question) {
    return null;
  }

  const text = isUser && message.content && (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, px: message.imageUrl ? 1 : 2, pt: message.imageUrl ? 0.75 : 1.25, pb: message.imageUrl ? 0.5 : 1.25 }}>
      {/* Marca que o texto veio do áudio, não do teclado. */}
      {(message.isTranscript || message.isVoice) && <Mic size={14} style={{ flexShrink: 0, marginTop: 4, opacity: 0.8 }} aria-hidden="true" />}
      <Typography component="div" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.4, fontSize: '1rem' }}>
        {message.content}
      </Typography>
    </Box>
  );

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 1.25, mb: 1.25 }}
    >
      {isUser && message.imageUrl && <PhotoBubble src={message.imageUrl} scanning={scanning}>{text}</PhotoBubble>}
      {isUser && !message.imageUrl && message.content && (
        <Box sx={{ maxWidth: { xs: '80%', md: '60%' }, borderRadius: '20px 20px 6px 20px', bgcolor: 'primary.main', color: 'primary.contrastText' }}>{text}</Box>
      )}

      {analyzing ? (
        <AnalysisCard steps={steps} />
      ) : !isUser && message.isStreaming ? (
        <StepsList steps={steps} />
      ) : (
        !isUser && <DoneSteps steps={steps} />
      )}

      {/* A pergunta do Zé (ask_user) já respondida continua na conversa. */}
      {!isUser && message.question && !message.content && !hideQuestion && (
        <Box sx={{ maxWidth: { xs: '88%', md: '78%' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '20px 20px 20px 6px', px: 1.75, py: 1.5, fontSize: '0.9375rem', lineHeight: 1.45 }}>
          {message.question}
        </Box>
      )}

      {!isUser && message.talhao?.created && <TalhaoCriadoCard talhao={message.talhao} />}

      {!isUser && message.content && (
        <Box
          sx={{
            maxWidth: { xs: '88%', md: '78%' },
            borderRadius: '20px 20px 20px 6px',
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: '1px solid',
            borderColor: message.isError ? 'error.main' : 'divider',
          }}
        >
          {/* Markdown também durante o streaming: formata o texto ao vivo. */}
          <Box sx={{ px: 1.75, py: 1.5, lineHeight: 1.45, fontSize: '0.9375rem', '& p': { m: 0 }, '& p + p': { mt: 1 } }}>
            <Markdown>{message.content}</Markdown>
          </Box>
        </Box>
      )}

      {/* Toda resposta concluída do Zé carrega o aviso de auxiliar. */}
      {!isUser && !message.isStreaming && message.content && !message.diagnosis && (
        <Box sx={{ maxWidth: { xs: '88%', md: '78%' } }}>
          <AuxiliarNotice compact />
        </Box>
      )}

      {!isUser && message.diagnosis && (
        <Box sx={{ width: { xs: '90%', md: '78%' } }}>
          <DiagnosisCard diagnosis={message.diagnosis} />
        </Box>
      )}
    </Box>
  );
}

export default ChatMessage;
