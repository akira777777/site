import React, { useState, useCallback } from 'react';
import { Box, Grid } from '@mui/material';
import { useSuperpowers } from '../hooks/useSuperpowers';
import { SuperpowerCard } from './SuperpowerCard';

/**
 * SuperpowerList
 * 
 * Container component that fetches and displays the list of superpowers.
 * Relies on Suspense for the loading state.
 */
export const SuperpowerList: React.FC = () => {
  const { data: powers } = useSuperpowers();
  const [activePower, setActivePower] = useState<string | null>(null);

  const handleSelect = useCallback((id: string) => {
    setActivePower((prev) => (prev === id ? null : id));
  }, []);

  return (
    <Box sx={{ mt: 8 }}>
      <Grid container spacing={4}>
        {powers.map((power) => (
          <Grid size={{ xs: 12, md: 6 }} key={power.id}>
            <SuperpowerCard
              power={power}
              isActive={activePower === power.id}
              onSelect={handleSelect}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SuperpowerList;
