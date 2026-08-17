'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RUNES_CHARSET } from '@/lib/utils';
import { sound } from '@/components/audio/SoundEngine';

interface ScrambleTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  triggerOnHover?: boolean;
  autoStart?: boolean;
  speed?: number;
  playSound?: boolean;
}

export function ScrambleText({
  text,
  className = '',
  as: Component = 'span',
  triggerOnHover = true,
  autoStart = false,
  speed = 35,
  playSound = false,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);
    if (playSound) sound.playRuneGlow();

    let iteration = 0;
    const maxIterations = text.length;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(() => {
        return text
          .split('')
          .map((char, index) => {
            if (char === ' ' || char === '\n') return char;
            if (index < iteration) {
              return text[index];
            }
            return RUNES_CHARSET[Math.floor(Math.random() * RUNES_CHARSET.length)];
          })
          .join('');
      });

      if (iteration >= maxIterations) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsScrambling(false);
      }

      iteration += 1 / 2;
    }, speed);
  };

  useEffect(() => {
    if (autoStart) {
      startScramble();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, autoStart]);

  return (
    <Component
      className={`inline-block transition-colors select-none ${className} ${
        isScrambling ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(212,151,59,0.8)]' : ''
      }`}
      onMouseEnter={() => {
        if (triggerOnHover) startScramble();
      }}
    >
      {displayText}
    </Component>
  );
}
