import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * SuspenseLoader
 * 
 * Mandatory loader component for all Suspense boundaries.
 * Provides a consistent, themed loading experience.
 */
export const SuspenseLoader: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        width: '100%',
        gap: 3,
      }}
    >
      <CircularProgress 
        size={60} 
        thickness={2}
        sx={{ 
          color: '#B026FF', // casino-neon
          filter: 'drop-shadow(0 0 10px rgba(176,38,255,0.4))'
        }} 
      />
      <Typography 
        variant="button" 
        sx={{ 
          fontFamily: 'monospace',
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.5)',
          animation: 'pulse 2s infinite'
        }}
      >
        Hacking Mainframe...
      </Typography>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default SuspenseLoader;
