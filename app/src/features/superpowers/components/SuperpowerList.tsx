import React, { useRef } from 'react';
import { Box, Grid } from '@mui/material';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useSuperpowers } from '../hooks/useSuperpowers';
import { SuperpowerCard } from './SuperpowerCard';
import { useSuperpowerContext } from '../context/SuperpowerContext';

/**
 * SuperpowerList
 * 
 * Container component that fetches and displays the list of superpowers.
 * Relies on Suspense for the loading state.
 */
export const SuperpowerList: React.FC = () => {
  const { data: powers } = useSuperpowers();
  const { equippedPowerId, equipPower } = useSuperpowerContext();
  
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    
    gsap.fromTo('.superpower-card-wrapper', 
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8, 
        stagger: 0.15, 
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        }
      }
    );
  }, { scope: containerRef });

  return (
    <Box ref={containerRef} sx={{ mt: 8 }}>
      <Grid container spacing={4}>
        {powers.map((power) => (
          <Grid className="superpower-card-wrapper" size={{ xs: 12, md: 6 }} key={power.id}>
            <SuperpowerCard
              power={power}
              isActive={equippedPowerId === power.id}
              onSelect={equipPower}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SuperpowerList;
