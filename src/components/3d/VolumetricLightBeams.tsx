'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { SpotLight } from '@react-three/drei';
import * as THREE from 'three';

interface AtmosphericBeamProps {
  position: [number, number, number];
  target: [number, number, number];
  color: string;
  intensity: number;
  distance: number;
  angle: number;
  opacity: number;
  radiusBottom: number;
}

function AtmosphericBeam({
  position,
  target,
  color,
  intensity,
  distance,
  angle,
  opacity,
  radiusBottom,
}: AtmosphericBeamProps) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const [targetX, targetY, targetZ] = target;

  useLayoutEffect(() => {
    const light = lightRef.current;
    if (!light) return;

    light.target.position.set(targetX, targetY, targetZ);
    light.parent?.add(light.target);

    return () => {
      light.parent?.remove(light.target);
    };
  }, [targetX, targetY, targetZ]);

  return (
    <SpotLight
      ref={lightRef}
      position={position}
      color={color}
      intensity={intensity}
      distance={distance}
      decay={2}
      angle={angle}
      penumbra={0.92}
      opacity={opacity}
      attenuation={7}
      anglePower={6}
      radiusTop={0.18}
      radiusBottom={radiusBottom}
      castShadow={false}
    />
  );
}

export function VolumetricLightBeams() {
  return (
    <group>
      <AtmosphericBeam
        position={[6.5, 14, 1]}
        target={[0, 0.5, -11]}
        color="#f4ddb3"
        intensity={22}
        distance={24}
        angle={0.25}
        opacity={0.075}
        radiusBottom={4.8}
      />
      <AtmosphericBeam
        position={[0, 14, -27.5]}
        target={[0, 1, -8]}
        color="#d68a42"
        intensity={18}
        distance={31}
        angle={0.22}
        opacity={0.055}
        radiusBottom={5.2}
      />
      <AtmosphericBeam
        position={[-7, 11, -14]}
        target={[2, 0.8, -10]}
        color="#7694bf"
        intensity={10}
        distance={19}
        angle={0.2}
        opacity={0.035}
        radiusBottom={3.2}
      />
    </group>
  );
}
