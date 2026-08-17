'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural Volumetric God-Ray Light Shafts for Gothic Cathedral Nave

export function VolumetricLightBeams() {
  const beamGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (beamGroupRef.current) {
      // Subtle atmospheric shimmer
      beamGroupRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.08 + Math.sin(t * 1.5 + i * 1.8) * 0.03;
        }
      });
    }
  });

  return (
    <group ref={beamGroupRef}>
      {/* 1. Main Sunbeam Angle from Upper Right Clerestory Arches */}
      <mesh
        position={[4, 10, -4]}
        rotation={[0.35, 0, -0.45]}
      >
        <cylinderGeometry args={[0.8, 3.8, 22, 16, 1, true]} />
        <meshBasicMaterial
          color="#fde68a"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 2. Secondary Sunbeam from Rose Window Nave End */}
      <mesh
        position={[0, 11, -18]}
        rotation={[-0.4, 0, 0]}
      >
        <cylinderGeometry args={[1.2, 5.2, 24, 16, 1, true]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Cold Moonbeam Cross-Shaft from Left High Arch */}
      <mesh
        position={[-5, 9, -10]}
        rotation={[0.3, 0, 0.5]}
      >
        <cylinderGeometry args={[0.6, 3.2, 18, 16, 1, true]} />
        <meshBasicMaterial
          color="#93c5fd"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
