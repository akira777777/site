import { useCallback, useMemo, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CircuitBoard, Coins, Cpu, ShieldCheck } from 'lucide-react';
import { useSuperpowers } from '../hooks/useSuperpowers';
import { useSuperpowerContext } from '../context/superpowerContextValue';
import { SuperpowerCard } from './SuperpowerCard';

gsap.registerPlugin(ScrollTrigger);

export function SuperpowerList() {
  const { data: powers } = useSuperpowers();
  const { credits, equippedPowerId, equipPower } = useSuperpowerContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const equippedPower = useMemo(
    () => powers.find((power) => power.id === equippedPowerId),
    [equippedPowerId, powers],
  );

  const handleSelect = useCallback((id: string, price: number) => {
    equipPower(id, price);
  }, [equipPower]);

  useGSAP(() => {
    if (!containerRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = gsap.utils.toArray<HTMLElement>('.superpower-card-wrapper', containerRef.current);
    const animation = gsap.fromTo(
      cards,
      { y: 42, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.72,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      },
    );

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="mt-10" aria-labelledby="superpowers-heading">
      <div className="mb-7 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-stretch">
        <div className="border border-casino-cyber/25 bg-casino-cyber/5 p-5 md:p-6">
          <div className="mb-3 flex items-center gap-3 text-casino-cyber">
            <CircuitBoard className="h-5 w-5" />
            <h2 id="superpowers-heading" className="font-mono text-xs uppercase tracking-[0.24em]">
              Augmentation Console
            </h2>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-casino-muted md:text-base">
            Spend demo credits to equip one protocol at a time. Re-select the active protocol to refund its credits and clear the slot.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:min-w-[28rem]">
          <div className="border border-casino-gold/25 bg-black/30 p-5" aria-live="polite">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-casino-gold">
              <Coins className="h-4 w-4" />
              Credit Balance
            </div>
            <p className="mt-2 font-serif text-4xl text-casino-ivory">{credits.toLocaleString()} CR</p>
          </div>
          <div className="border border-casino-ivory/10 bg-black/30 p-5" aria-live="polite">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-casino-muted">
              {equippedPower ? <ShieldCheck className="h-4 w-4 text-casino-cyber" /> : <Cpu className="h-4 w-4" />}
              Equipped
            </div>
            <p className="mt-2 text-lg font-semibold text-casino-ivory">
              {equippedPower?.title ?? 'No active protocol'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {powers.map((power) => (
          <div key={power.id} className="superpower-card-wrapper min-h-full">
            <SuperpowerCard
              power={power}
              isActive={equippedPowerId === power.id}
              canAfford={credits >= power.price}
              onSelect={handleSelect}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default SuperpowerList;
