import { useState } from 'react';
import Navigation from '../components/Navigation';
import FooterSection from '../sections/FooterSection';

const SUPERPOWERS = [
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
];

export default function Superpowers() {
  const [activePower, setActivePower] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-casino-ink text-casino-ivory font-sans">
      <Navigation onReserve={() => {}} />

      <main className="pt-32 pb-20 px-[6vw] max-w-7xl mx-auto">
        <div className="mb-16">
          <h1 className="font-serif text-5xl md:text-7xl text-casino-neon uppercase mb-6 [text-shadow:0_0_20px_rgba(176,38,255,0.6)]">
            Cybernetic Superpowers
          </h1>
          <p className="font-mono text-casino-muted text-lg max-w-2xl">
            Upgrade your slot experience. Purchase and equip cybernetic enhancements to alter the odds and bend the casino to your will.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SUPERPOWERS.map((power) => (
            <div 
              key={power.id}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer ${
                activePower === power.id 
                  ? 'border-casino-ivory scale-[1.02] [box-shadow:0_0_30px_rgba(255,255,255,0.2)]' 
                  : 'border-casino-neon/20 hover:border-casino-neon/50 bg-casino-charcoal'
              }`}
              onClick={() => setActivePower(power.id)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${power.color} opacity-10`} />
              
              <div className="relative p-8 z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-4xl bg-casino-ink/50 p-4 rounded-xl border border-casino-ivory/10">
                    {power.icon}
                  </div>
                  <div className="font-mono text-casino-gold text-xl font-bold bg-casino-gold/10 px-4 py-2 rounded-full border border-casino-gold/20">
                    {power.price} CR
                  </div>
                </div>

                <h3 className="font-serif text-3xl mb-4 text-white uppercase">{power.title}</h3>
                <p className="text-casino-muted/90 font-sans flex-grow leading-relaxed">
                  {power.description}
                </p>

                <button 
                  className={`mt-8 w-full py-4 rounded-xl font-mono uppercase tracking-widest transition-all duration-300 ${
                    activePower === power.id
                      ? 'bg-casino-ivory text-casino-ink hover:bg-white'
                      : 'bg-casino-neon/10 text-casino-neon border border-casino-neon/50 hover:bg-casino-neon hover:text-white'
                  }`}
                >
                  {activePower === power.id ? 'Equipped' : 'Equip Enhancement'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <FooterSection onReserve={() => {}} />
    </div>
  );
}
