'use client';

import React from 'react';

export function GothicCorner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-6 h-6 text-amber-500/40 pointer-events-none ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M2 22V6C2 3.79086 3.79086 2 6 2H22" />
      <path d="M6 6L2 2" />
      <circle cx="6" cy="6" r="1.5" fill="currentColor" />
      <path d="M12 2C10 6 6 10 2 12" opacity="0.6" />
      <path d="M2 8H8V2" strokeWidth="0.8" />
    </svg>
  );
}

export function GothicDivider({
  title,
  subtitle,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center my-8 ${className}`}>
      <div className="flex items-center w-full max-w-lg gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-amber-500/80" />
        <div className="flex items-center gap-2 text-amber-500/80">
          <span className="text-xs">✦</span>
          <svg className="w-5 h-5 text-amber-500/80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" fillOpacity="0.2" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
          <span className="text-xs">✦</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/40 to-amber-500/80" />
      </div>
      {title && (
        <span className="mt-3 font-cinzel text-xs tracking-[0.3em] text-[#c5b396] uppercase">
          {title}
        </span>
      )}
      {subtitle && (
        <span className="text-[10px] tracking-widest text-[#c5b396]/50 font-mono mt-0.5">
          {subtitle}
        </span>
      )}
    </div>
  );
}

export function RunicBorder({
  children,
  className = '',
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`relative p-6 bg-[#0e0e12]/80 backdrop-blur-md border border-[#c5b396]/20 transition-all duration-500 ${
        glow ? 'border-amber-500/60 shadow-[0_0_30px_rgba(212,151,59,0.15)]' : 'hover:border-[#c5b396]/40'
      } ${className}`}
    >
      <GothicCorner className="absolute -top-1.5 -left-1.5 rotate-0" />
      <GothicCorner className="absolute -top-1.5 -right-1.5 rotate-90" />
      <GothicCorner className="absolute -bottom-1.5 -right-1.5 rotate-180" />
      <GothicCorner className="absolute -bottom-1.5 -left-1.5 -rotate-90" />
      {children}
    </div>
  );
}

export function CrestEmblem({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-8 h-8 text-amber-500 ${className}`} viewBox="0 0 32 32" fill="none" stroke="currentColor">
      {/* Outer seal */}
      <polygon points="16,2 30,16 16,30 2,16" strokeWidth="1.2" stroke="currentColor" fill="currentColor" fillOpacity="0.05" />
      <polygon points="16,6 26,16 16,26 6,16" strokeWidth="0.8" stroke="currentColor" strokeDasharray="2 2" />
      {/* Inner cross & sword */}
      <path d="M16 4V28M8 12H24" strokeWidth="1.5" strokeLinecap="square" />
      <path d="M12 8L20 8M13 24L19 24" strokeWidth="1" />
      <circle cx="16" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}
