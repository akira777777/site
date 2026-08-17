'use client';

import React from 'react';

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  duration?: string;
  [key: string]: unknown;
}

export function Marquee({
  className = '',
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  duration = '35s',
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      style={{ '--duration': duration } as React.CSSProperties}
      className={`group flex overflow-hidden p-2 [--gap:1.5rem] [gap:var(--gap)] ${
        vertical ? 'flex-col' : 'flex-row'
      } ${className}`}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={`flex shrink-0 justify-around [gap:var(--gap)] ${
            vertical
              ? 'animate-marquee-vertical flex-col'
              : reverse
              ? 'animate-marquee-reverse flex-row'
              : 'animate-marquee flex-row'
          } ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
