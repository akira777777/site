'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function AuraGlow({
  color,
  radius,
  position = [0, 0, 0],
}: {
  color: string;
  radius: number;
  position?: [number, number, number];
}) {
  return (
    <mesh position={position} renderOrder={2}>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.065}
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

// 1. Crown of the Blind Martyr
export function CrownRelic3D({ scale = 1 }: { scale?: number }) {
  const crownRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (crownRef.current) {
      crownRef.current.rotation.y = t * 0.4;
      crownRef.current.position.y = Math.sin(t * 1.5) * 0.1;
    }
  });

  return (
    <group ref={crownRef} scale={[scale, scale, scale]}>
      <AuraGlow color="#e83a57" radius={2.05} />
      {/* Main thorny circlet - lustrous dark steel */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1.5, 0.14, 16, 64]} />
        <meshStandardMaterial color="#424454" roughness={0.25} metalness={0.85} />
      </mesh>
      {/* Secondary entwined gold ring */}
      <mesh rotation={[0.2, 0.4, 0]}>
        <torusGeometry args={[1.45, 0.09, 12, 48]} />
        <meshStandardMaterial color="#d4973b" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Upward Thorn Spikes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 1.5;
        const z = Math.sin(angle) * 1.5;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, -angle, 0.15]}>
            <mesh position={[0, 0.6, 0]} castShadow>
              <coneGeometry args={[0.12, 1.3, 8]} />
              <meshStandardMaterial color="#4a4c5e" roughness={0.2} metalness={0.9} />
            </mesh>
            {/* Glowing Blood Ruby at base */}
            <mesh position={[0, 0.05, 0]}>
              <octahedronGeometry args={[0.16, 0]} />
              <meshStandardMaterial
                color="#ff1a3c"
                emissive="#e63946"
                emissiveIntensity={3.2}
                roughness={0.1}
              />
            </mesh>
          </group>
        );
      })}

      <pointLight color="#ff3366" intensity={5.8} distance={9} decay={2} />
    </group>
  );
}

// 2. Oculus of the Void Leviathan
export function OculusRelic3D({ scale = 1 }: { scale?: number }) {
  const oculusRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (oculusRef.current) {
      oculusRef.current.position.y = Math.sin(t * 1.3) * 0.12;
    }
    if (ringRef1.current) ringRef1.current.rotation.x = t * 0.8;
    if (ringRef2.current) ringRef2.current.rotation.y = t * 0.6;
  });

  return (
    <group ref={oculusRef} scale={[scale, scale, scale]}>
      <AuraGlow color="#2cc9e5" radius={2.15} />
      {/* Central Void Crystal Sphere */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshStandardMaterial
          color="#1e2640"
          roughness={0.1}
          metalness={0.8}
          emissive="#2b4c7e"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Internal glowing Iris core */}
      <mesh>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial
          color="#48cae4"
          emissive="#00b4d8"
          emissiveIntensity={4.0}
        />
      </mesh>

      {/* Orbiting Gyro Rings */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[1.6, 0.06, 16, 64]} />
        <meshStandardMaterial color="#4a5568" roughness={0.25} metalness={0.9} />
      </mesh>
      <mesh ref={ringRef2}>
        <torusGeometry args={[1.85, 0.05, 16, 64]} />
        <meshStandardMaterial color="#d4973b" roughness={0.2} metalness={0.95} />
      </mesh>

      <pointLight color="#00b4d8" intensity={6.2} distance={9} decay={2} />
    </group>
  );
}

// 3. Chalice of the Weeping Archon
export function ChaliceRelic3D({ scale = 1 }: { scale?: number }) {
  const chaliceRef = useRef<THREE.Group>(null);
  const bloodRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (chaliceRef.current) {
      chaliceRef.current.rotation.y = t * 0.35;
      chaliceRef.current.position.y = Math.sin(t * 1.4) * 0.08;
    }
    if (bloodRef.current) {
      bloodRef.current.position.y = 1.1 + Math.sin(t * 3) * 0.02;
    }
  });

  return (
    <group ref={chaliceRef} scale={[scale, scale, scale]}>
      <AuraGlow color="#e34859" radius={1.55} position={[0, 0.4, 0]} />
      {/* Base */}
      <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 1.1, 0.25, 24]} />
        <meshStandardMaterial color="#5a4e3e" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.3, 1.4, 16]} />
        <meshStandardMaterial color="#483e32" roughness={0.35} metalness={0.8} />
      </mesh>
      {/* Stem Knots */}
      <mesh position={[0, -0.4, 0]}>
        <torusGeometry args={[0.35, 0.1, 12, 24]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.95} />
      </mesh>
      {/* Bowl / Cup */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 0.4, 1.2, 24, 1, true]} />
        <meshStandardMaterial
          color="#524536"
          roughness={0.25}
          metalness={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Sanguine Fluid Surface */}
      <mesh ref={bloodRef} position={[0, 1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.05, 32]} />
        <meshStandardMaterial
          color="#c1121f"
          emissive="#e63946"
          emissiveIntensity={2.8}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      <pointLight position={[0, 1.2, 0]} color="#ff4d6d" intensity={5.4} distance={8} decay={2} />
    </group>
  );
}

// 4. Heart of the Iron Colossus
export function CoreRelic3D({ scale = 1 }: { scale?: number }) {
  const coreRef = useRef<THREE.Group>(null);
  const emberCoreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.3;
      coreRef.current.rotation.y = t * 0.45;
      coreRef.current.position.y = Math.sin(t * 1.6) * 0.1;
    }
    if (emberCoreRef.current) {
      const beat = Math.pow(Math.sin(t * 4.2), 6) * 0.35 + 1.0;
      emberCoreRef.current.scale.set(beat, beat, beat);
    }
  });

  return (
    <group ref={coreRef} scale={[scale, scale, scale]}>
      <AuraGlow color="#ff6b16" radius={1.85} />
      {/* Outer Wrought Iron Geodesic Cage */}
      <mesh castShadow receiveShadow>
        <dodecahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          color="#424452"
          roughness={0.4}
          metalness={0.85}
          wireframe
        />
      </mesh>

      {/* Secondary Iron Shell */}
      <mesh>
        <icosahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color="#d4973b"
          roughness={0.3}
          metalness={0.9}
          wireframe
        />
      </mesh>

      {/* Pulsating Molten Core */}
      <mesh ref={emberCoreRef}>
        <sphereGeometry args={[0.75, 24, 24]} />
        <meshStandardMaterial
          color="#ff7b00"
          emissive="#ff5400"
          emissiveIntensity={4.2}
          roughness={0.15}
        />
      </mesh>

      <pointLight color="#ff8500" intensity={6.8} distance={10} decay={2} />
    </group>
  );
}

export function SingleRelicViewer({ relicId, scale = 1.2 }: { relicId: string; scale?: number }) {
  switch (relicId) {
    case 'crown-of-thorns':
      return <CrownRelic3D scale={scale} />;
    case 'abyssal-eye':
      return <OculusRelic3D scale={scale} />;
    case 'sanguine-chalice':
      return <ChaliceRelic3D scale={scale} />;
    case 'corrupted-core':
    default:
      return <CoreRelic3D scale={scale} />;
  }
}
