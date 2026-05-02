import React, { Suspense } from 'react';
import { SuperpowerProvider } from './context/SuperpowerContext';
import { SuperpowerList } from './components/SuperpowerList';

/**
 * Superpowers Feature Entry
 * 
 * Publicly exported component that handles lazy loading and feature-level orchestration.
 */
export const SuperpowersFeature: React.FC = () => {
  return (
    <SuperpowerProvider>
      <Suspense fallback={<div>Loading superpowers...</div>}>
        <SuperpowerList />
      </Suspense>
    </SuperpowerProvider>
  );
};
