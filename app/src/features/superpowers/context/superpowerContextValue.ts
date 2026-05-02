import { createContext, useContext } from 'react';
import type { Superpower } from '../types';

export interface SuperpowerContextType {
  equippedPowerId: string | null;
  equipPower: (id: string, price: number) => void;
  credits: number;
  availablePowers: Superpower[];
}

export const SuperpowerContext = createContext<SuperpowerContextType | undefined>(undefined);

export const useSuperpowerContext = () => {
  const context = useContext(SuperpowerContext);
  if (context === undefined) {
    throw new Error('useSuperpowerContext must be used within a SuperpowerProvider');
  }
  return context;
};
