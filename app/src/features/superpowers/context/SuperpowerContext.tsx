import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { SUPERPOWERS } from '../data/superpowers';
import { SuperpowerContext } from './superpowerContextValue';

export const SuperpowerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [equippedPowerId, setEquippedPowerId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('casino_equipped_superpower');
    } catch {
      return null;
    }
  });
  const [credits, setCredits] = useState<number>(() => {
    try {
      const savedCredits = Number(localStorage.getItem('casino_superpower_credits'));
      return Number.isFinite(savedCredits) && savedCredits >= 0 ? savedCredits : 5000;
    } catch {
      return 5000;
    }
  });

  const equipPower = useCallback((id: string, price: number) => {
    if (equippedPowerId === id) {
      setEquippedPowerId(null);
      setCredits((currentCredits) => currentCredits + price);
      return;
    }

    setCredits((currentCredits) => {
      if (currentCredits < price) {
        return currentCredits;
      }

      setEquippedPowerId(id);
      return currentCredits - price;
    });
  }, [equippedPowerId]);

  useEffect(() => {
    try {
      localStorage.setItem('casino_superpower_credits', credits.toString());
      if (equippedPowerId) {
        localStorage.setItem('casino_equipped_superpower', equippedPowerId);
      } else {
        localStorage.removeItem('casino_equipped_superpower');
      }
    } catch {
      // localStorage unavailable
    }
  }, [credits, equippedPowerId]);

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
