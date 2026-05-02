import React, { useCallback } from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import type { Superpower } from '../types';

interface SuperpowerCardProps {
  power: Superpower;
  isActive: boolean;
  onSelect: (id: string) => void;
}

/**
 * SuperpowerCard
 * 
 * Individual card component for a superpower.
 * Uses MUI v7 with sx prop for styling.
 */
export const SuperpowerCard: React.FC<SuperpowerCardProps> = ({ power, isActive, onSelect }) => {
  const theme = useTheme();

  const handleSelect = useCallback(() => {
    onSelect(power.id);
  }, [power.id, onSelect]);

  return (
    <Paper
      onClick={handleSelect}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'background.paper',
        borderColor: isActive ? 'primary.main' : 'rgba(176,38,255,0.1)',
        borderWidth: 1,
        borderStyle: 'solid',
        transform: isActive ? 'scale(1.02)' : 'none',
        boxShadow: isActive 
          ? `0 0 30px rgba(176,38,255,0.15)` 
          : theme.shadows[1],
        '&:hover': {
          borderColor: isActive ? 'primary.main' : 'rgba(176,38,255,0.4)',
          boxShadow: isActive 
            ? `0 0 30px rgba(176,38,255,0.2)` 
            : `0 0 20px rgba(176,38,255,0.05)`,
        },
      }}
    >
      {/* Background Gradient Layer */}
      <Box 
        className={`bg-gradient-to-br ${power.color}`}
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: isActive ? 0.15 : 0.05,
          transition: 'opacity 0.3s ease',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box 
            sx={{ 
              fontSize: '2.5rem', 
              p: 2, 
              borderRadius: '12px', 
              backgroundColor: 'rgba(8, 6, 18, 0.5)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            {power.icon}
          </Box>
          <Box 
            sx={{ 
              fontFamily: 'monospace',
              color: '#FFD700', // casino-gold
              fontWeight: 'bold',
              fontSize: '1.1rem',
              px: 2,
              py: 1,
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 215, 0, 0.05)',
              border: '1px solid rgba(255, 215, 0, 0.2)'
            }}
          >
            {power.price} CR
          </Box>
        </Box>

        <Typography 
          variant="h3" 
          sx={{ 
            fontSize: '1.75rem', 
            mb: 2, 
            color: '#FFFFFF',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {power.title}
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary', 
            mb: 4, 
            flexGrow: 1,
            lineHeight: 1.6,
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {power.description}
        </Typography>

        <Button
          fullWidth
          variant={isActive ? "contained" : "outlined"}
          color="primary"
          sx={{
            py: 1.5,
            fontWeight: 'bold',
            letterSpacing: '0.15em',
            backgroundColor: isActive ? 'primary.main' : 'rgba(176,38,255,0.05)',
            '&:hover': {
              backgroundColor: isActive ? '#C04BFF' : 'rgba(176,38,255,0.15)',
            }
          }}
        >
          {isActive ? 'Equipped' : 'Equip Enhancement'}
        </Button>
      </Box>
    </Paper>
  );
};

export default SuperpowerCard;
