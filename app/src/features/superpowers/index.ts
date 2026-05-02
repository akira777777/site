import React from 'react';

// Lazy load the entry component
const SuperpowerList = React.lazy(() => import('./components/SuperpowerList'));

/**
 * Superpowers Feature Entry
 * 
 * Publicly exported component that handles lazy loading and feature-level orchestration.
 */
export const SuperpowersFeature = SuperpowerList;

export * from './types';
export * from './api/superpowersApi';
export * from './hooks/useSuperpowers';
