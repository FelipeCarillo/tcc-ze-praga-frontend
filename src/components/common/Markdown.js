import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

const markdownComponents = {
  p: ({ children }) => (
    <Typography variant="body2" sx={{ mb: 0.75, lineHeight: 1.6, fontSize: '0.9rem', '&:last-child': { mb: 0 } }}>
      {children}
    </Typography>
  ),
  a: ({ href, children }) => (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </Link>
  ),
  ul: ({ children }) => (
    <Box component="ul" sx={{ pl: 2.5, my: 0.5 }}>
      {children}
    </Box>
  ),
  ol: ({ children }) => (
    <Box component="ol" sx={{ pl: 2.5, my: 0.5 }}>
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Typography component="li" variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.9rem' }}>
      {children}
    </Typography>
  ),
  code: ({ inline, children }) => {
    if (inline) {
      return (
        <Box
          component="code"
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            bgcolor: 'action.hover',
            borderRadius: '4px',
            px: 0.5,
            py: 0.1,
          }}
        >
          {children}
        </Box>
      );
    }
    return (
      <Box
        component="code"
        sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
      >
        {children}
      </Box>
    );
  },
  pre: ({ children }) => (
    <Box
      component="pre"
      sx={{
        overflow: 'auto',
        bgcolor: 'action.hover',
        borderRadius: '6px',
        p: 1.5,
        my: 1,
        fontSize: '0.82rem',
        fontFamily: 'monospace',
        lineHeight: 1.5,
      }}
    >
      {children}
    </Box>
  ),
  h1: ({ children }) => (
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.4 }}>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.4 }}>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.4 }}>
      {children}
    </Typography>
  ),
  strong: ({ children }) => (
    <Box component="strong" sx={{ fontWeight: 600 }}>
      {children}
    </Box>
  ),
  em: ({ children }) => (
    <Box component="em" sx={{ fontStyle: 'italic' }}>
      {children}
    </Box>
  ),
};

function Markdown({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {children}
    </ReactMarkdown>
  );
}

export default Markdown;
