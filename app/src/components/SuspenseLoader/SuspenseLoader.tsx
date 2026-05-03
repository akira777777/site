import React from 'react';

/**
 * SuspenseLoader
 * 
 * Mandatory loader component for all Suspense boundaries.
 * Provides a consistent loading experience without pulling UI libraries into
 * the initial landing bundle.
 */
export const SuspenseLoader: React.FC = () => {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-6 bg-casino-ink text-casino-ivory">
      <div className="h-14 w-14 animate-spin rounded-full border-2 border-casino-neon/20 border-t-casino-neon [filter:drop-shadow(0_0_10px_rgba(176,38,255,0.4))]" />
      <p className="animate-pulse font-mono text-xs uppercase tracking-[0.22em] text-casino-muted">
        Hacking Mainframe...
      </p>
    </div>
  );
};

export default SuspenseLoader;
