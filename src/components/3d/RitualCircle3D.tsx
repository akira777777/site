'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function RitualCircle3D({ isSealed = false }: { isSealed?: boolean }) {
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const ring3Ref = useRef<THREE.Group>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const speedMult = isSealed ? 2.5 : 1.0;

    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.15 * speedMult;
    if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.25 * speedMult;
    if (ring3Ref.current) ring3Ref.current.rotation.z = t * 0.1 * speedMult;

    if (coreLightRef.current) {
      const pulse = isSealed
        ? Math.sin(t * 12) * 1.5 + 4.0
        : Math.sin(t * 3.0) * 0.6 + 1.8;
      coreLightRef.current.intensity = pulse;
    }
  });

  return (
    <group position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Outer Slender Circle Ring */}
      <group ref={ring1Ref}>
        <mesh>
          <ringGeometry args={[2.8, 2.85, 64]} />
          <meshStandardMaterial
            color={isSealed ? '#ff1a3c' : '#9b1c1c'}
            emissive={isSealed ? '#ff0033' : '#681313'}
            emissiveIntensity={isSealed ? 3.5 : 1.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Runes Nodes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 2.82, Math.sin(a) * 2.82, 0.02]}>
              <octahedronGeometry args={[0.06, 0]} />
              <meshBasicMaterial color="#ff4d6d" />
            </mesh>
          );
        })}
      </group>

      {/* Middle Golden Octagram Ring */}
      <group ref={ring2Ref}>
        <mesh>
          <ringGeometry args={[2.0, 2.05, 48]} />
          <meshStandardMaterial
            color="#d4973b"
            emissive="#f59e0b"
            emissiveIntensity={isSealed ? 3.0 : 1.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Star spokes */}
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
            <boxGeometry args={[4.0, 0.02, 0.01]} />
            <meshBasicMaterial color="#d4973b" opacity={0.5} transparent />
          </mesh>
        ))}
      </group>

      {/* Inner Core Blood Ring */}
      <group ref={ring3Ref}>
        <mesh>
          <ringGeometry args={[1.1, 1.14, 32]} />
          <meshStandardMaterial
            color="#e63946"
            emissive="#a4133c"
            emissiveIntensity={2.0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Central Blood Dais Inset */}
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[1.08, 32]} />
        <meshStandardMaterial
          color="#200505"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      <pointLight
        ref={coreLightRef}
        position={[0, 0, 0.5]}
        color={isSealed ? '#ff0033' : '#e63946'}
        intensity={2.2}
        distance={7}
      />
    </group>
  );
}
