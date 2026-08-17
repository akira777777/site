'use client';

import React, { useRef, useState, MouseEvent } from 'react';
import { GothicCorner } from './Filigree';
import { sound } from '@/components/audio/SoundEngine';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowColor?: string;
  onClick?: () => void;
}

export function TiltCard({
  children,
  className = '',
  maxTilt = 12,
  glowColor = 'rgba(212, 151, 59, 0.25)',
  onClick,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState('');
  const [glareStyle, setGlareStyle] = useState({ opacity: 0, x: 50, y: 50 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const tiltX = ((y / rect.height) * 2 - 1) * -maxTilt;
    const tiltY = ((x / rect.width) * 2 - 1) * maxTilt;

    setTransformStyle(`perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlareStyle({ opacity: 0.6, x: xPercent, y: yPercent });
  };

  const handleMouseEnter = () => {
    sound.playHover();
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlareStyle({ opacity: 0, x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (onClick) {
          sound.playClick();
          onClick();
        }
      }}
      style={{
        transform: transformStyle,
        transition: 'transform 0.18s ease-out, border-color 0.3s ease, box-shadow 0.3s ease',
        transformStyle: 'preserve-3d',
      }}
      className={`relative group cursor-pointer overflow-hidden rounded-sm border border-[#c5b396]/20 bg-[#121216]/80 backdrop-blur-md p-6 hover:border-amber-500/50 hover:shadow-[0_0_35px_rgba(212,151,59,0.15)] ${className}`}
    >
      {/* Dynamic Specular Glare */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-20 mix-blend-overlay"
        style={{
          opacity: glareStyle.opacity,
          background: `radial-gradient(circle at ${glareStyle.x}% ${glareStyle.y}%, ${glowColor} 0%, transparent 65%)`,
        }}
      />

      {/* Gothic Filigree Corners */}
      <GothicCorner className="absolute -top-1 -left-1 rotate-0 transition-colors group-hover:text-amber-400" />
      <GothicCorner className="absolute -top-1 -right-1 rotate-90 transition-colors group-hover:text-amber-400" />
      <GothicCorner className="absolute -bottom-1 -right-1 rotate-180 transition-colors group-hover:text-amber-400" />
      <GothicCorner className="absolute -bottom-1 -left-1 -rotate-90 transition-colors group-hover:text-amber-400" />

      {/* Card Content with 3D depth */}
      <div style={{ transform: 'translateZ(25px)' }} className="relative z-10">
        {children}
      </div>
    </div>
  );
}
