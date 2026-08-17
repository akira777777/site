'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CathedralScene } from './CathedralScene';
import { RitualCircle3D } from './RitualCircle3D';
import { WeaponForge3D } from './WeaponForge3D';
import { GothicEnvironment } from './GothicEnvironment';
import { ElementType } from '@/lib/types';

interface CameraScrollerProps {
  scrollProgress: number;
  mousePos: { x: number; y: number };
}

function CameraController({ scrollProgress, mousePos }: CameraScrollerProps) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 3.2, 8.5));
  const currentLookAt = useRef(new THREE.Vector3(0, 2.2, 0));
  const targetPos = useRef(new THREE.Vector3(0, 3.2, 8.5));
  const targetLookAt = useRef(new THREE.Vector3(0, 2.2, 0));

  useFrame((_, delta) => {
    const p = Math.max(0, Math.min(1, scrollProgress));
    const tPos = targetPos.current;
    const tLook = targetLookAt.current;

    if (p < 0.2) {
      // Chamber I: The Sunken Reliquary (Direct view of Monolith & Cathedral nave)
      const t = p / 0.2;
      tPos.set(0, 3.2 - t * 0.4, 8.5 - t * 3.5);
      tLook.set(0, 2.2, 0);
    } else if (p < 0.44) {
      // Chamber II: The Crypt of Sins (Side aisle view, framing cards with pillars, zero center obstruction)
      const t = (p - 0.2) / 0.24;
      tPos.set(4.0 * (1 - t * 0.2), 3.0 + t * 0.3, -5.0 - t * 5.0);
      tLook.set(-1.0, 1.8, -10.0 - t * 2.0);
    } else if (p < 0.68) {
      // Chamber III: The Grim Chronicle (Left aisle view looking across nave at lit torches)
      const t = (p - 0.44) / 0.24;
      tPos.set(-3.8 * (1 - t * 0.2), 2.8 + t * 0.2, -12.0 - t * 5.0);
      tLook.set(1.0, 1.8, -16.0 - t * 2.0);
    } else if (p < 0.88) {
      // Chamber IV: The Abyssal Forge (Viewing 3D armory forge & backdrop)
      const t = (p - 0.68) / 0.2;
      tPos.set(2.6 * (1 - t * 0.5), 2.6 + t * 0.4, -18.0 - t * 3.5);
      tLook.set(0, 1.4, -23.0);
    } else {
      // Chamber V: The Blood Covenant (Elevated perspective looking down onto flat ritual altar)
      const t = (p - 0.88) / 0.12;
      tPos.set(0, 4.2 + t * 0.5, -21.5 - t * 2.0);
      tLook.set(0, 0.1, -26.5);
    }

    // Add subtle mouse parallax
    const parallaxX = (mousePos.x - 0.5) * 0.6;
    const parallaxY = (mousePos.y - 0.5) * 0.4;
    tPos.x += parallaxX;
    tPos.y -= parallaxY;

    // Smooth lerp camera
    const lerpSpeed = Math.min(delta * 3.5, 1);
    currentPos.current.lerp(tPos, lerpSpeed);
    currentLookAt.current.lerp(tLook, lerpSpeed);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

interface SceneCanvasProps {
  scrollProgress: number;
  activeElement: ElementType;
  isCovenantSealed: boolean;
}

export function SceneCanvas({
  scrollProgress,
  activeElement,
  isCovenantSealed,
}: SceneCanvasProps) {
  const mousePos = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mousePos.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#060608]">
      <Canvas
        camera={{ position: [0, 3.2, 8.5], fov: 46, near: 0.1, far: 90 }}
        shadows="soft"
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          depth: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.02,
        }}
        dpr={[1, 1.5]}
      >
        {/* Solid Dark Abyss background */}
        <color attach="background" args={['#050507']} />

        {/* Low-cost studio reflections keep metal readable without lifting the black levels. */}
        <GothicEnvironment intensity={0.62} />

        <CameraController scrollProgress={scrollProgress} mousePos={mousePos.current} />

        {/* Global Dark Cathedral Environment */}
        <CathedralScene />

        {/* Chamber IV: Forge 3D Weapon Display at z = -23 */}
        <group position={[0, 1.4, -23]}>
          <WeaponForge3D weaponId="soulcleaver" element={activeElement} scale={0.95} />
        </group>

        {/* Chamber V: Blood Covenant Summoning Altar at z = -26.5 */}
        <group position={[0, 0, -26.5]}>
          <RitualCircle3D isSealed={isCovenantSealed} />
        </group>

        {/* Volumetric Atmosphere Fog */}
        <fogExp2 attach="fog" args={['#050507', 0.018]} />
      </Canvas>
    </div>
  );
}
