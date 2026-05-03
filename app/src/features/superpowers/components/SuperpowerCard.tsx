import { useCallback, useMemo } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { CheckCircle2, LockKeyhole, Sparkles } from 'lucide-react';
import type { Superpower } from '../types';

interface SuperpowerCardProps {
  power: Superpower;
  isActive: boolean;
  canAfford: boolean;
  onSelect: (id: string, price: number) => void;
}

export function SuperpowerCard({ power, isActive, canAfford, onSelect }: SuperpowerCardProps) {
  const isUnavailable = !isActive && !canAfford;

  const handleSelect = useCallback(() => {
    if (isUnavailable) return;
    onSelect(power.id, power.price);
  }, [isUnavailable, onSelect, power.id, power.price]);

  const handleButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handleSelect();
  }, [handleSelect]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleSelect();
  }, [handleSelect]);

  const buttonText = useMemo(
    () => (isActive ? 'Protocol Equipped' : canAfford ? 'Initialize Protocol' : 'Insufficient Credits'),
    [canAfford, isActive],
  );

  return (
    <article
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isUnavailable ? -1 : 0}
      aria-disabled={isUnavailable}
      aria-pressed={isActive}
      className={`group relative flex h-full flex-col overflow-hidden border bg-casino-charcoal/70 p-6 backdrop-blur transition duration-300 focus:outline-none focus:ring-2 focus:ring-casino-cyber md:p-7 ${
        isActive
          ? 'border-casino-cyber shadow-[0_0_42px_rgba(0,255,204,0.17)]'
          : 'border-casino-ivory/10 hover:border-casino-neon/60 hover:shadow-[0_0_34px_rgba(176,38,255,0.14)]'
      } ${isUnavailable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:-translate-y-1'}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${power.color} opacity-0 transition group-hover:opacity-10 ${isActive ? 'opacity-20' : ''}`} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.16)_50%)] bg-[length:100%_4px] opacity-25" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div className={`grid h-16 w-16 place-items-center border bg-black/55 text-4xl transition group-hover:rotate-3 group-hover:scale-105 ${
            isActive ? 'border-casino-cyber shadow-[0_0_24px_rgba(0,255,204,0.22)]' : 'border-casino-ivory/10'
          }`}
          >
            <span aria-hidden="true">{power.icon}</span>
          </div>
          <div className="inline-flex items-center gap-2 border border-casino-cyber/30 bg-casino-cyber/5 px-3 py-1 font-mono text-xs font-bold text-casino-cyber [text-shadow:0_0_10px_rgba(0,255,204,0.45)]">
            <Sparkles className="h-3.5 w-3.5" />
            {power.price.toLocaleString()} CR
          </div>
        </div>

        <h3 className="font-serif text-3xl uppercase leading-none text-casino-ivory transition group-hover:text-casino-gold">
          {power.title}
        </h3>
        <p className="mt-4 flex-1 text-sm leading-6 text-casino-muted">
          {power.description}
        </p>

        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isUnavailable}
          className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest transition focus:outline-none focus:ring-2 focus:ring-casino-cyber disabled:cursor-not-allowed disabled:border-casino-ivory/10 disabled:text-casino-muted ${
            isActive
              ? 'border-casino-cyber bg-casino-cyber text-casino-ink shadow-[0_0_24px_rgba(0,255,204,0.35)]'
              : 'border-casino-neon/60 text-casino-neon hover:bg-casino-neon hover:text-casino-ivory'
          }`}
        >
          {isUnavailable ? <LockKeyhole className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {buttonText}
        </button>
      </div>
    </article>
  );
}

export default SuperpowerCard;
