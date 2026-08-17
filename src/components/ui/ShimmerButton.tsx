'use client';

import React from 'react';
import { sound } from '@/components/audio/SoundEngine';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ShimmerButton({
  shimmerColor = '#f59e0b',
  shimmerSize = '0.1em',
  shimmerDuration = '3s',
  borderRadius = '8px',
  background = 'rgba(14, 14, 18, 0.95)',
  className = '',
  children,
  onClick,
  onMouseEnter,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      style={
        {
          '--spread': '90deg',
          '--shimmer-color': shimmerColor,
          '--radius': borderRadius,
          '--speed': shimmerDuration,
          '--cut': shimmerSize,
          '--bg': background,
        } as React.CSSProperties
      }
      className={`group relative z-10 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-8 py-3.5 text-[#e2d5be] font-cinzel text-sm font-semibold tracking-[0.2em] uppercase transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] border border-amber-500/40 hover:border-amber-400 hover:shadow-[0_0_28px_rgba(212,151,59,0.4)] ${className}`}
      onClick={(e) => {
        sound.playGong();
        onClick?.(e);
      }}
      onMouseEnter={(e) => {
        sound.playChime();
        onMouseEnter?.(e);
      }}
      {...props}
    >
      {/* Spark / Rotating Shimmer Ray */}
      <div className="absolute inset-0 overflow-visible [container-type:size]">
        <div className="absolute inset-0 h-[100cqh] animate-shimmer [aspect-ratio:1] [border-radius:0] [mask:none]">
          <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
        </div>
      </div>

      {/* Backdrop */}
      <div className="absolute inset-[1px] rounded-[inherit] bg-[#0c0c10]/95 transition-colors group-hover:bg-[#15151c]" />

      {/* Inner Content */}
      <span className="relative z-10 flex items-center gap-2 drop-shadow-[0_0_12px_rgba(212,151,59,0.5)]">
        {children}
      </span>
    </button>
  );
}
