'use client';

import React from 'react';
import { Environment, Lightformer } from '@react-three/drei';

export function GothicEnvironment({ intensity = 0.65 }: { intensity?: number }) {
  return (
    <Environment
      background={false}
      frames={1}
      resolution={128}
      environmentIntensity={intensity}
    >
      <Lightformer
        form="rect"
        intensity={4.5}
        color="#ffd3a0"
        position={[7, 9, 4]}
        scale={[7, 2.2]}
        target={[0, 1, -12]}
      />
      <Lightformer
        form="rect"
        intensity={3.2}
        color="#7994c0"
        position={[-8, 7, -18]}
        scale={[5, 3]}
        target={[0, 2, -10]}
      />
      <Lightformer
        form="circle"
        intensity={2.4}
        color="#a83c2f"
        position={[0, 1, -28]}
        scale={5}
        target={[0, 1, -12]}
      />
      <Lightformer
        form="rect"
        intensity={1.4}
        color="#d7c7ad"
        position={[0, -4, -8]}
        scale={[12, 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </Environment>
  );
}
