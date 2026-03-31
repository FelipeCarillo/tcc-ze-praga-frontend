import React, { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import { Copy, Check } from 'lucide-react';
import { useTheme } from '@mui/material/styles';

function CodeBlock({ examples }) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const theme = useTheme();

  const languages = Object.keys(examples);
  const currentCode = examples[languages[activeTab]];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: theme.palette.code.header,
          px: 1,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              color: theme.palette.code.tabInactive,
              fontWeight: 500,
              fontSize: '0.8rem',
              textTransform: 'none',
              py: 0,
            },
            '& .Mui-selected': {
              color: theme.palette.code.tabActive,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#52B788',
            },
          }}
        >
          {languages.map((lang) => (
            <Tab key={lang} label={lang} />
          ))}
        </Tabs>
        <Tooltip title={copied ? 'Copiado!' : 'Copiar'}>
          <IconButton onClick={handleCopy} size="small" sx={{ color: theme.palette.code.tabInactive }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        component="pre"
        sx={{
          backgroundColor: theme.palette.code.body,
          color: theme.palette.code.text,
          p: 2.5,
          m: 0,
          overflowX: 'auto',
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontSize: '0.8rem',
          lineHeight: 1.7,
        }}
      >
        <code>{currentCode}</code>
      </Box>
    </Box>
  );
}

export default CodeBlock;
