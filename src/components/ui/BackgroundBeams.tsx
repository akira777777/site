'use client';

import React from 'react';

export function BackgroundBeams({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] ${className}`}
    >
      <div className="absolute -inset-[10px] opacity-30">
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 800 800"
        >
          <defs>
            <radialGradient id="beamGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#d4973b" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#681313" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#060608" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="400" cy="400" r="380" fill="url(#beamGrad)" />
        </svg>
      </div>
    </div>
  );
}
