import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SuperpowerContextType {
  equippedPowerId: string | null;
  equipPower: (id: string) => void;
  credits: number;
}

const SuperpowerContext = createContext<SuperpowerContextType | undefined>(undefined);

export const SuperpowerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [equippedPowerId, setEquippedPowerId] = useState<string | null>(null);
  const [credits] = useState<number>(5000); // Starting credits

  const equipPower = (id: string) => {
    // In a real app, we'd check if they have enough credits to buy it, or if it's already bought
    setEquippedPowerId((prev) => (prev === id ? null : id));
  };

  return (
    <SuperpowerContext.Provider value={{ equippedPowerId, equipPower, credits }}>
      {children}
    </SuperpowerContext.Provider>
  );
};

export const useSuperpowerContext = () => {
  const context = useContext(SuperpowerContext);
  if (context === undefined) {
    throw new Error('useSuperpowerContext must be used within a SuperpowerProvider');
  }
  return context;
};
