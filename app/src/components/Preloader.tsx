import { useEffect, useState } from 'react';

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const duration = 1800;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const p = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.floor(eased * 100));

      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onDone, 600);
        }, 300);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[1000] bg-casino-ink flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <h1 className="font-serif text-4xl md:text-5xl text-casino-ivory uppercase tracking-tight mb-8">
        Atriom
      </h1>
      <div className="w-48 h-px bg-casino-ivory/10 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-casino-ember transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="font-mono text-xs text-casino-muted mt-4 tracking-widest uppercase">
        Loading {progress}%
      </p>
    </div>
  );
}
