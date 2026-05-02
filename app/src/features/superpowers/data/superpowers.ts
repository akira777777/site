import type { Superpower } from '../types';

export const SUPERPOWERS: Superpower[] = [
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
  },
];
