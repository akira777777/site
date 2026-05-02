import React, { useRef } from 'react';
import { Box, Grid } from '@mui/material';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSuperpowers } from '../hooks/useSuperpowers';
import { SuperpowerCard } from './SuperpowerCard';
import { useSuperpowerContext } from '../context/superpowerContextValue';
import type { Superpower } from '../types';

gsap.registerPlugin(ScrollTrigger);

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
    
    const cards = containerRef.current.querySelectorAll('.superpower-card-wrapper');
    
    gsap.fromTo(cards,
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
          toggleActions: 'play none none reverse'
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, { scope: containerRef });

  return (
    <Box ref={containerRef} sx={{ mt: 8 }}>
      <Grid container spacing={4}>
        {(powers as Superpower[]).map((power) => (
          <Grid key={power.id} size={{ xs: 12, md: 6 }}>
            <div className="superpower-card-wrapper">
              <SuperpowerCard
                power={power}
                isActive={equippedPowerId === power.id}
                onSelect={(id) => equipPower(id, power.price)}
              />
            </div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SuperpowerList;
