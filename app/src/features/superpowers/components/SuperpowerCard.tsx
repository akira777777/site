import React, { useCallback, useMemo } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import type { Superpower } from '../types';

interface SuperpowerCardProps {
  power: Superpower;
  isActive: boolean;
  onSelect: (id: string, price: number) => void;
}

/**
 * SuperpowerCard
 * 
 * Individual card component for a superpower.
 * Uses MUI v7 with sx prop for styling.
 */
export const SuperpowerCard: React.FC<SuperpowerCardProps> = ({ power, isActive, onSelect }) => {
  
  const handleSelect = useCallback(() => {
    onSelect(power.id, power.price);
  }, [power.id, power.price, onSelect]);

  const handleButtonClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handleSelect();
  }, [handleSelect]);

  const buttonText = useMemo(() => 
    isActive ? 'System Equipped' : 'Initialize Protocol', 
    [isActive]
  );

  return (
    <Paper
      onClick={handleSelect}
      className="group"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'rgba(10, 8, 20, 0.7)',
        backdropFilter: 'blur(10px)',
        borderColor: isActive ? 'primary.main' : 'rgba(255,255,255,0.05)',
        borderWidth: isActive ? 2 : 1,
        borderStyle: 'solid',
        transform: isActive ? 'translateY(-8px) scale(1.02)' : 'translateY(0)',
        boxShadow: isActive 
          ? '0 0 40px rgba(176,38,255,0.2), inset 0 0 20px rgba(176,38,255,0.1)'
          : '0 8px 32px rgba(0, 0, 0, 0.4)',
        '&:hover': {
          borderColor: isActive ? 'primary.main' : 'rgba(176,38,255,0.6)',
          transform: isActive ? 'translateY(-8px) scale(1.02)' : 'translateY(-4px)',
          boxShadow: isActive 
            ? '0 0 50px rgba(176,38,255,0.3)'
            : '0 12px 40px rgba(176,38,255,0.15), inset 0 0 10px rgba(176,38,255,0.05)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: isActive ? 'linear-gradient(90deg, transparent, #B026FF, transparent)' : 'transparent',
          opacity: isActive ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }
      }}
    >
      {/* Background Gradient Layer */}
      <Box 
        className={`bg-gradient-to-br ${power.color}`}
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: isActive ? 0.2 : 0,
          transition: 'opacity 0.5s ease',
          '&:hover': {
            opacity: 0.1,
          }
        }}
      />
      
      {/* Scanline Effect */}
      <Box 
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.1) 50%)',
          backgroundSize: '100% 4px',
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box 
            sx={{ 
              fontSize: '2.5rem', 
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px', 
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid',
              borderColor: isActive ? 'primary.main' : 'rgba(255,255,255,0.1)',
              boxShadow: isActive ? '0 0 20px rgba(176,38,255,0.3)' : 'none',
              transition: 'all 0.3s ease',
              '.group:hover &': {
                borderColor: 'primary.main',
                transform: 'scale(1.1) rotate(5deg)'
              }
            }}
          >
            {power.icon}
          </Box>
          <Box 
            sx={{ 
              fontFamily: '"Space Mono", monospace',
              color: '#00FFCC',
              fontWeight: 700,
              fontSize: '1rem',
              px: 2,
              py: 0.5,
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 255, 204, 0.05)',
              border: '1px solid rgba(0, 255, 204, 0.3)',
              textShadow: '0 0 10px rgba(0, 255, 204, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <span style={{ fontSize: '0.8em' }}>CR</span> {power.price.toLocaleString()}
          </Box>
        </Box>

        <Typography 
          variant="h3" 
          sx={{ 
            fontSize: '1.5rem', 
            mb: 1.5, 
            color: '#FFFFFF',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textShadow: isActive ? '0 0 15px rgba(255,255,255,0.3)' : 'none'
          }}
        >
          {power.title}
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            mb: 4, 
            flexGrow: 1,
            lineHeight: 1.7,
            fontSize: '0.95rem',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {power.description}
        </Typography>

        <Button
          fullWidth
          variant={isActive ? "contained" : "outlined"}
          color="primary"
          onClick={handleButtonClick}
          sx={{
            py: 1.5,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            borderRadius: '4px',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: isActive ? 'primary.main' : 'transparent',
            borderColor: isActive ? 'primary.main' : 'rgba(176,38,255,0.5)',
            color: isActive ? '#FFFFFF' : 'primary.main',
            boxShadow: isActive ? '0 0 20px rgba(176,38,255,0.5)' : 'none',
            '&:hover': {
              backgroundColor: isActive ? '#C04BFF' : 'rgba(176,38,255,0.1)',
              borderColor: '#C04BFF',
              boxShadow: '0 0 25px rgba(176,38,255,0.6)',
            },
            '&::after': isActive ? {
              content: '""',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(rgba(255,255,255,0.2), transparent)',
              transform: 'rotate(45deg)',
              pointerEvents: 'none',
            } : {}
          }}
        >
          {buttonText}
        </Button>
      </Box>
    </Paper>
  );
};

export default SuperpowerCard;
