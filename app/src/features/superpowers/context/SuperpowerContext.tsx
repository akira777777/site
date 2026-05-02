import React, { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { SUPERPOWERS } from '../data/superpowers';
import { SuperpowerContext } from './superpowerContextValue';

export const SuperpowerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [equippedPowerId, setEquippedPowerId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(5000); // Starting credits

  const equipPower = useCallback((id: string, price: number) => {
    setCredits((currentCredits) => {
      if (equippedPowerId === id) {
        setEquippedPowerId(null);
        return currentCredits + price;
      }

      if (currentCredits < price) {
        return currentCredits;
      }

      setEquippedPowerId(id);
      return currentCredits - price;
    });
  }, [equippedPowerId]);

  const contextValue = useMemo(() => ({
    equippedPowerId,
    equipPower,
    credits,
    availablePowers: SUPERPOWERS,
  }), [credits, equipPower, equippedPowerId]);

  return (
    <SuperpowerContext.Provider value={contextValue}>
      {children}
    </SuperpowerContext.Provider>
  );
};
