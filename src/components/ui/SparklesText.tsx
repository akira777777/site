'use client';

import React from 'react';

interface SparklesTextProps {
  text: string;
  className?: string;
  sparklesCount?: number;
  colors?: {
    first: string;
    second: string;
  };
}

export function SparklesText({
  text,
  className = '',
  colors = { first: '#d4973b', second: '#f59e0b' },
}: SparklesTextProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Sparkles stars */}
      <span className="absolute -top-3 -left-3 text-amber-400 text-sm animate-pulse">✦</span>
      <span className="absolute -top-2 -right-4 text-amber-300 text-xs animate-ping" style={{ animationDuration: '3s' }}>✦</span>
      <span className="absolute -bottom-2 left-1/3 text-red-500 text-xs animate-pulse" style={{ animationDuration: '2s' }}>✦</span>

      {/* Main Gradient Typography */}
      <span
        style={{
          backgroundImage: `linear-gradient(135deg, #ffffff 0%, #fef3c7 30%, ${colors.first} 60%, ${colors.second} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
        className="relative z-10 block drop-shadow-[0_0_35px_rgba(212,151,59,0.5)]"
      >
        {text}
      </span>
    </div>
  );
}
