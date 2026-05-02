import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Superpower } from '../types';

interface SuperpowerContextType {
  equippedPowerId: string | null;
  equipPower: (id: string, price: number) => void;
  credits: number;
  availablePowers: Superpower[];
}

const SuperpowerContext = createContext<SuperpowerContextType | undefined>(undefined);

export const SuperpowerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [equippedPowerId, setEquippedPowerId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(5000); // Starting credits
  const [availablePowers] = useState<Superpower[]>([
    {
      id: 'neon-multiplier',
      title: 'Neon Multiplier',
      description: 'Guarantees a 2x multiplier on your next 5 winning spins. The neon glow intensifies with every win.',
      price: 500,
      icon: '⚡',
      color: 'from-[#B026FF] to-[#FF007F]',
    },
    {
      id: 'time-warp',
      title: 'Time Warp',
      description: 'Rewind the reels on a losing spin. Gives you a second chance at hitting the jackpot.',
      price: 1200,
      icon: '⏳',
      color: 'from-[#00FFCC] to-[#0088FF]',
    },
    {
      id: 'glitch-hack',
      title: 'Glitch Hack',
      description: 'Hack the mainframe to force one reel to land on a Wild symbol. Highly volatile, highly rewarding.',
      price: 2500,
      icon: '👾',
      color: 'from-[#FFD700] to-[#FF5500]',
    },
    {
      id: 'shield-protocol',
      title: 'Shield Protocol',
      description: 'Protects your balance. If you lose more than 500 credits in 10 spins, 50% is refunded.',
      price: 800,
      icon: '🛡️',
      color: 'from-[#00FF00] to-[#005500]',
    }
  ]);

  const equipPower = useCallback((id: string, price: number) => {
    setEquippedPowerId((prev) => {
      // If already equipped, unequip it and refund credits
      if (prev === id) {
        setCredits((c) => c + price);
        return null;
      }
      
      // Check if we have enough credits
      setCredits((c) => {
        if (c >= price) {
          return c - price;
        }
        return c;
      });
      
      return id;
    });
  }, []);

  return (
    <SuperpowerContext.Provider value={{ equippedPowerId, equipPower, credits, availablePowers }}>
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
