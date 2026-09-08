import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { ReactComponent as Marca } from '../../assets/brand/marca.svg';
import DiagnosisCard from './DiagnosisCard';
import Markdown from '../common/Markdown';
import { copy } from '../../copy/ze';

function ChatMessage({ message, onSaveDiagnosis }) {
  const theme = useTheme();
  const isUser = message.role === 'user';
  const isDark = theme.palette.mode === 'dark';

  // Placeholder de streaming ainda sem conteúdo: não renderiza um balão vazio —
  // quem cobre o estado "pensando" é o TypingIndicator do ChatWindow.
  if (!isUser && message.isStreaming && !message.content) {
    return null;
  }

  // Tool chamada DEPOIS que o balão já tem texto: o TypingIndicator do
  // ChatWindow some assim que o stream começa, então sem isto o usuário fica
  // sem sinal enquanto o agente busca plano de ação ou pesquisa na web. Antes
  // do primeiro token quem mostra o estado é o TypingIndicator — renderizar
  // aqui também duplicaria o spinner.
  const activeTool =
    message.isStreaming && message.content ? message.toolCall : null;

  const renderToolBadge = () => {
    if (!activeTool) return null;
    const label = copy.chat.tools[activeTool] || copy.chat.tools._fallback;
    return (
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          mt: message.content ? 1 : 0,
        }}
      >
        <Box
          component={motion.div}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          sx={{
            width: 11,
            height: 11,
            borderRadius: '50%',
            border: '2px solid',
            borderColor: 'secondary.main',
            borderTopColor: 'transparent',
            flexShrink: 0,
          }}
        />
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'secondary.main' }}>
          {label}
        </Typography>
      </Box>
    );
  };

  const renderAssistantContent = () => {
    if (!message.content) return null;
    // Renderiza Markdown também durante o streaming — o react-markdown lida bem
    // com conteúdo parcial, então o texto formata ao vivo em vez de só no fim.
    return (
      <Box sx={{ lineHeight: 1.6, fontSize: '0.9rem' }}>
        <Markdown>{message.content}</Markdown>
      </Box>
    );
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', mb: 2 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          maxWidth: { xs: '100%', md: '82%' },
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        {!isUser && (
          <Box sx={{ width: 30, height: 30, borderRadius: '9px', overflow: 'hidden', flexShrink: 0 }}>
            <Marca style={{ width: 30, height: 30, display: 'block' }} />
          </Box>
        )}

        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
            backgroundColor: isUser ? 'primary.main' : 'background.paper',
            color: isUser ? '#FFFFFF' : 'text.primary',
            border: isUser ? 'none' : '1px solid',
            borderColor: 'divider',
            boxShadow: isUser ? 'none' : (t) => `0 1px 8px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(28,42,32,0.06)'}`,
          }}
        >
          {message.imageUrl && (
            <Box
              component="img"
              src={message.imageUrl}
              alt="Imagem enviada"
              sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: '10px', display: 'block', mb: message.content ? 1 : 0, objectFit: 'cover' }}
            />
          )}
          {isUser ? (
            message.content && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                {/* Marca que o texto veio do áudio, não do teclado — sem isso a
                    transcrição parece algo que o usuário digitou. */}
                {message.isTranscript && (
                  <Mic size={13} style={{ flexShrink: 0, marginTop: 4, opacity: 0.75 }} />
                )}
                <Typography
                  variant="body2"
                  component="div"
                  sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.9rem' }}
                >
                  {message.content}
                </Typography>
              </Box>
            )
          ) : (
            <>
              {renderAssistantContent()}
              {renderToolBadge()}
            </>
          )}
        </Box>
      </Box>

      {!isUser && message.diagnosis && (
        <Box sx={{ maxWidth: { xs: '100%', md: '82%' }, width: '100%', pl: { xs: 0, md: '38px' } }}>
          <DiagnosisCard diagnosis={message.diagnosis} onSave={onSaveDiagnosis} />
        </Box>
      )}

      <Typography
        variant="caption"
        sx={{ color: 'text.disabled', fontSize: '0.66rem', mt: 0.5, px: isUser ? 0.5 : '38px' }}
      >
        {new Date(message.timestamp || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </Typography>
    </Box>
  );
}

export default ChatMessage;
