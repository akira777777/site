'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
}

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorRingRef = useRef<HTMLDivElement | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const magneticTarget = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const particles = useRef<Particle[]>([]);
  const animFrameId = useRef<number | null>(null);

  const COLORS = ['#f59e0b', '#d97706', '#ef4444', '#dc2626', '#fbbf24', '#f87171'];

  const spawnSpark = (x: number, y: number, count = 1, burst = false) => {
    for (let i = 0; i < count; i++) {
      const angle = burst ? Math.random() * Math.PI * 2 : Math.PI * 0.5 + (Math.random() - 0.5) * 1.5;
      const speed = burst ? Math.random() * 4 + 1.5 : Math.random() * 1.8 + 0.5;
      const maxLife = Math.random() * 35 + 25;

      particles.current.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: burst ? Math.cos(angle) * speed : (Math.random() - 0.5) * 1.2,
        vy: burst ? Math.sin(angle) * speed : -speed, // float upwards
        size: Math.random() * 2.8 + 1.2,
        alpha: 1,
        maxLife,
        life: maxLife,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    if (particles.current.length > 120) {
      particles.current.splice(0, particles.current.length - 120);
    }
  };

  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Spawn subtle ember trail on movement
      if (Math.random() > 0.4) {
        spawnSpark(e.clientX, e.clientY, 1);
      }

      // Check magnetic hover
      const target = e.target as HTMLElement | null;
      const magneticEl = target?.closest('.magnetic') as HTMLElement | null;
      if (magneticEl) {
        const rect = magneticEl.getBoundingClientRect();
        magneticTarget.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        };
      } else {
        magneticTarget.current = null;
      }

      // Check clickable hover
      const isClickable = !!target?.closest('a, button, [role="button"], input, textarea, .cursor-pointer, .tilt-card');
      setIsHoveringClickable(isClickable);
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      spawnSpark(e.clientX, e.clientY, 16, true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Canvas resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Main animation loop
    const render = () => {
      // Smooth ring interpolation (lerp)
      const targetX = magneticTarget.current ? magneticTarget.current.x : mousePos.current.x;
      const targetY = magneticTarget.current ? magneticTarget.current.y : mousePos.current.y;

      ringPos.current.x += (targetX - ringPos.current.x) * 0.18;
      ringPos.current.y += (targetY - ringPos.current.y) * 0.18;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      if (cursorRingRef.current) {
        const scale = isClicking ? 0.75 : isHoveringClickable ? 1.6 : 1;
        cursorRingRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) scale(${scale})`;
      }

      // Canvas particles render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.alpha = Math.max(0, p.life / p.maxLife);

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            if (p.life <= 0) {
              particles.current.splice(i, 1);
            }
          }
        }
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isClicking, isHoveringClickable]);

  return (
    <>
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[9998] transition-opacity duration-300"
        style={{ opacity: isVisible ? 1 : 0 }}
      />

      {/* Sharp Inner Crosshair Dot */}
      <div
        ref={cursorDotRef}
        className={`pointer-events-none fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-[10000] transition-opacity duration-150 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
      </div>

      {/* Smooth Outer Glowing Ring */}
      <div
        ref={cursorRingRef}
        className={`pointer-events-none fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-[9999] transition-opacity duration-200 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-full border border-amber-500/60 transition-colors duration-200 flex items-center justify-center ${
            isHoveringClickable
              ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
              : 'border-amber-500/40 bg-amber-500/5'
          }`}
        >
          {/* Subtle spinning gothic cross inside ring */}
          <div className="w-1.5 h-1.5 text-[8px] text-amber-400 flex items-center justify-center opacity-70">
            ✦
          </div>
        </div>
      </div>
    </>
  );
}
