'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EmberParticlesProps {
  count?: number;
  area?: [number, number, number];
  color?: string;
  speed?: number;
}

export function EmberParticles({
  count = 250,
  area = [25, 20, 25],
  color = '#f59e0b',
  speed = 1.0,
}: EmberParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, scales, randomness] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sc = new Float32Array(count);
    const rand = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * area[0];
      pos[i * 3 + 1] = (Math.random() - 0.5) * area[1];
      pos[i * 3 + 2] = (Math.random() - 0.5) * area[2];

      sc[i] = Math.random() * 0.12 + 0.04;

      rand[i * 3 + 0] = Math.random() * Math.PI * 2;
      rand[i * 3 + 1] = Math.random() * 0.5 + 0.5; // vertical speed
      rand[i * 3 + 2] = Math.random() * 0.8 + 0.2; // wobble frequency
    }

    return [pos, sc, rand];
  }, [count, area]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const vy = randomness[idx + 1] * delta * 1.5 * speed;
      const wobble = Math.sin(time * randomness[idx + 2] + randomness[idx]) * 0.015;

      array[idx + 0] += wobble;
      array[idx + 1] += vy;
      array[idx + 2] += Math.cos(time * randomness[idx + 2] + randomness[idx]) * 0.012;

      // Wrap around if too high
      if (array[idx + 1] > area[1] / 2) {
        array[idx + 1] = -area[1] / 2;
        array[idx + 0] = (Math.random() - 0.5) * area[0];
        array[idx + 2] = (Math.random() - 0.5) * area[2];
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-scale"
          args={[scales, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={new THREE.Color(color)}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
