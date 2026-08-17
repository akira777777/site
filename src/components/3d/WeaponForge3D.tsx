'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ElementType } from '@/lib/types';
import { getDamascusSteelTextures } from './ProceduralTextures';

interface WeaponForgeProps {
  weaponId: string;
  element: ElementType;
  scale?: number;
  autoRotate?: boolean;
}

export function WeaponForge3D({
  weaponId,
  element,
  scale = 1.0,
  autoRotate = true,
}: WeaponForgeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);
  const damascusTex = useMemo(() => getDamascusSteelTextures(), []);

  const getElementColor = (elem: ElementType) => {
    switch (elem) {
      case 'blood':
        return { primary: '#ff1a3c', emissive: '#e63946', light: '#ff3366' };
      case 'frost':
        return { primary: '#48cae4', emissive: '#00b4d8', light: '#90e0ef' };
      case 'ember':
      default:
        return { primary: '#ffb703', emissive: '#f59e0b', light: '#ffcc00' };
    }
  };

  const elemColors = getElementColor(element);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      if (autoRotate) {
        groupRef.current.rotation.y = t * 0.5;
        groupRef.current.rotation.x = Math.sin(t * 0.8) * 0.1;
      }
      groupRef.current.position.y = Math.sin(t * 1.6) * 0.1;
    }
    if (glowMeshRef.current) {
      const pulse = Math.sin(t * 4.0) * 0.4 + 1.4;
      (glowMeshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * 2.8;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Dynamic Point Light matching active Element */}
      <pointLight
        position={[0, 0.5, 0.5]}
        color={elemColors.light}
        intensity={3.5}
        distance={10}
      />

      {weaponId === 'soulcleaver' && (
        <group rotation={[0, 0, -Math.PI / 4]}>
          {/* Greatsword Blade - Hand-forged Damascus steel */}
          <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 3.2, 0.06]} />
            <meshStandardMaterial
              map={damascusTex.map}
              color="#aeb6c8"
              roughness={0.22}
              metalness={1}
              normalMap={damascusTex.normalMap}
              roughnessMap={damascusTex.roughnessMap}
              metalnessMap={damascusTex.metalnessMap}
              normalScale={new THREE.Vector2(0.5, 0.5)}
            />
          </mesh>

          {/* Blade Tip Point */}
          <mesh position={[0, 3.45, 0]} rotation={[0, 0, Math.PI / 4]} castShadow receiveShadow>
            <boxGeometry args={[0.3, 0.3, 0.06]} />
            <meshStandardMaterial
              map={damascusTex.map}
              color="#aeb6c8"
              roughness={0.22}
              metalness={1}
              normalMap={damascusTex.normalMap}
              roughnessMap={damascusTex.roughnessMap}
              metalnessMap={damascusTex.metalnessMap}
            />
          </mesh>

          {/* Glowing Fuller (Blade Center Groove) */}
          <mesh ref={glowMeshRef} position={[0, 1.6, 0.04]}>
            <boxGeometry args={[0.12, 2.8, 0.02]} />
            <meshStandardMaterial
              color={elemColors.primary}
              emissive={elemColors.emissive}
              emissiveIntensity={3.5}
              roughness={0.1}
            />
          </mesh>

          {/* Crossguard - Dark Gold / Bronze */}
          <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 0.22, 0.2]} />
            <meshStandardMaterial color="#3a3842" roughness={0.3} metalness={0.9} />
          </mesh>
          {/* Crossguard Skull / Gem Ornament */}
          <mesh position={[0, -0.05, 0.12]}>
            <octahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial color={elemColors.primary} emissive={elemColors.emissive} emissiveIntensity={2.5} />
          </mesh>

          {/* Grip / Hilt */}
          <mesh position={[0, -0.6, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.9, 12]} />
            <meshStandardMaterial color="#4a3b2c" roughness={0.6} />
          </mesh>

          {/* Pommel */}
          <mesh position={[0, -1.15, 0]} castShadow>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#d4973b" roughness={0.25} metalness={0.95} />
          </mesh>
        </group>
      )}

      {weaponId === 'cathedral-flail' && (
        <group>
          {/* Flail Haft / Shaft */}
          <mesh position={[-0.8, -0.4, 0]} rotation={[0, 0, -0.6]} castShadow receiveShadow>
            <cylinderGeometry args={[0.09, 0.1, 2.2, 12]} />
            <meshStandardMaterial color="#4d3e33" roughness={0.6} />
          </mesh>

          {/* Chain Links - Bright Steel */}
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh
              key={i}
              position={[-0.1 + i * 0.18, 0.6 - i * 0.08, 0]}
              rotation={[i % 2 === 0 ? 0.7 : 0, 0, i * 0.2]}
              castShadow
            >
              <torusGeometry args={[0.13, 0.04, 8, 16]} />
              <meshStandardMaterial color="#5a6075" roughness={0.25} metalness={0.9} />
            </mesh>
          ))}

          {/* Spiked Censer / Flail Head */}
          <group position={[0.9, 0.3, 0]}>
            <mesh castShadow receiveShadow>
              <icosahedronGeometry args={[0.68, 1]} />
              <meshStandardMaterial
                map={damascusTex.map}
                color="#a3abbd"
                roughness={0.25}
                metalness={1}
                normalMap={damascusTex.normalMap}
                roughnessMap={damascusTex.roughnessMap}
                metalnessMap={damascusTex.metalnessMap}
              />
            </mesh>

            {/* Glowing Inner Molten Chamber */}
            <mesh ref={glowMeshRef}>
              <sphereGeometry args={[0.48, 16, 16]} />
              <meshStandardMaterial
                color={elemColors.primary}
                emissive={elemColors.emissive}
                emissiveIntensity={4.2}
              />
            </mesh>

            {/* Spikes */}
            {Array.from({ length: 12 }).map((_, i) => {
              const phi = Math.acos(-1 + (2 * i) / 12);
              const theta = Math.sqrt(12 * Math.PI) * phi;
              const x = Math.cos(theta) * Math.sin(phi) * 0.68;
              const y = Math.sin(theta) * Math.sin(phi) * 0.68;
              const z = Math.cos(phi) * 0.68;
              return (
                <mesh key={i} position={[x, y, z]} lookAt={new THREE.Vector3(x * 2, y * 2, z * 2)} castShadow>
                  <coneGeometry args={[0.09, 0.38, 6]} />
                  <meshStandardMaterial color="#555d74" metalness={0.92} roughness={0.2} />
                </mesh>
              );
            })}
          </group>
        </group>
      )}

      {weaponId === 'abyssal-scythe' && (
        <group rotation={[0, 0, 0.3]}>
          {/* Long Shaft */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.07, 0.09, 3.8, 12]} />
            <meshStandardMaterial color="#3a3d4d" roughness={0.5} metalness={0.7} />
          </mesh>

          {/* Scythe Head Fitting */}
          <mesh position={[0, 1.8, 0]} castShadow>
            <boxGeometry args={[0.22, 0.28, 0.22]} />
            <meshStandardMaterial color="#d4973b" roughness={0.25} metalness={0.95} />
          </mesh>

          {/* Curved Blade Spine */}
          <mesh position={[-0.8, 1.7, 0]} rotation={[0, 0, 0.4]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.2, 0.06]} />
            <meshStandardMaterial
              map={damascusTex.map}
              color="#a9b1c3"
              roughness={0.18}
              metalness={1}
              normalMap={damascusTex.normalMap}
              roughnessMap={damascusTex.roughnessMap}
              metalnessMap={damascusTex.metalnessMap}
            />
          </mesh>

          {/* Blade Crescent Tip */}
          <mesh position={[-1.7, 1.2, 0]} rotation={[0, 0, 1.2]} castShadow>
            <coneGeometry args={[0.18, 1.4, 4]} />
            <meshStandardMaterial
              map={damascusTex.map}
              color="#a9b1c3"
              roughness={0.18}
              metalness={1}
              normalMap={damascusTex.normalMap}
              roughnessMap={damascusTex.roughnessMap}
              metalnessMap={damascusTex.metalnessMap}
            />
          </mesh>

          {/* Spectral Glowing Blade Edge */}
          <mesh ref={glowMeshRef} position={[-0.85, 1.6, 0.03]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[1.4, 0.05, 0.02]} />
            <meshStandardMaterial
              color={elemColors.primary}
              emissive={elemColors.emissive}
              emissiveIntensity={4.2}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
