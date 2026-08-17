'use client';

import React, { useLayoutEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EmberParticles } from './EmberParticles';
import { VolumetricLightBeams } from './VolumetricLightBeams';
import {
  getCathedralFloorTextures,
  getStoneTexture,
  getStoneNormalTexture,
  getStoneRoughnessTexture,
  getRoseWindowTexture,
  getRuneEmissiveTexture,
} from './ProceduralTextures';

// Pre-allocated shared geometries
let sharedArchGeom: THREE.ExtrudeGeometry | null = null;
let sharedPillarGeom: THREE.CylinderGeometry | null = null;
let sharedPillarBaseGeom: THREE.BoxGeometry | null = null;
let sharedGargoyleTorsoGeom: THREE.BoxGeometry | null = null;
let sharedGargoyleHeadGeom: THREE.BoxGeometry | null = null;
let sharedHornGeom: THREE.ConeGeometry | null = null;
let sharedWingGeom: THREE.BoxGeometry | null = null;

function getSharedArchGeometry(): THREE.ExtrudeGeometry {
  if (sharedArchGeom) return sharedArchGeom;
  const shape = new THREE.Shape();
  shape.moveTo(-3.2, 0);
  shape.lineTo(-3.2, 6.5);
  shape.quadraticCurveTo(-3.2, 10.5, 0, 12.5);
  shape.quadraticCurveTo(3.2, 10.5, 3.2, 6.5);
  shape.lineTo(3.2, 0);
  shape.lineTo(2.6, 0);
  shape.lineTo(2.6, 6.3);
  shape.quadraticCurveTo(2.6, 9.8, 0, 11.5);
  shape.quadraticCurveTo(-2.6, 9.8, -2.6, 6.3);
  shape.lineTo(-2.6, 0);
  shape.closePath();

  sharedArchGeom = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: 0.9,
    bevelEnabled: true,
    bevelThickness: 0.15,
    bevelSize: 0.1,
    bevelSegments: 2,
  });
  return sharedArchGeom;
}

function getSharedPillarGeometry(): THREE.CylinderGeometry {
  if (!sharedPillarGeom) {
    sharedPillarGeom = new THREE.CylinderGeometry(0.38, 0.44, 6.5, 16);
  }
  return sharedPillarGeom;
}

function getSharedPillarBaseGeometry(): THREE.BoxGeometry {
  if (!sharedPillarBaseGeom) {
    sharedPillarBaseGeom = new THREE.BoxGeometry(1.2, 0.5, 1.2);
  }
  return sharedPillarBaseGeom;
}

function getSharedGargoyleTorsoGeometry(): THREE.BoxGeometry {
  if (!sharedGargoyleTorsoGeom) {
    sharedGargoyleTorsoGeom = new THREE.BoxGeometry(0.75, 0.95, 0.65);
  }
  return sharedGargoyleTorsoGeom;
}

function getSharedGargoyleHeadGeometry(): THREE.BoxGeometry {
  if (!sharedGargoyleHeadGeom) {
    sharedGargoyleHeadGeom = new THREE.BoxGeometry(0.5, 0.5, 0.55);
  }
  return sharedGargoyleHeadGeom;
}

function getSharedHornGeometry(): THREE.ConeGeometry {
  if (!sharedHornGeom) {
    sharedHornGeom = new THREE.ConeGeometry(0.1, 0.55, 6);
  }
  return sharedHornGeom;
}

function getSharedWingGeometry(): THREE.BoxGeometry {
  if (!sharedWingGeom) {
    sharedWingGeom = new THREE.BoxGeometry(0.95, 1.3, 0.08);
  }
  return sharedWingGeom;
}

// Crisp Gothic Gargoyle Sentinel Statue
function GothicGargoyle({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const stoneMap = useMemo(() => getStoneTexture(), []);
  const normalMap = useMemo(() => getStoneNormalTexture(), []);
  const roughnessMap = useMemo(() => getStoneRoughnessTexture(), []);
  const torsoGeometry = useMemo(() => getSharedGargoyleTorsoGeometry(), []);
  const headGeometry = useMemo(() => getSharedGargoyleHeadGeometry(), []);
  const hornGeometry = useMemo(() => getSharedHornGeometry(), []);
  const wingGeometry = useMemo(() => getSharedWingGeometry(), []);

  return (
    <group position={position} rotation={rotation} scale={[0.55, 0.55, 0.55]}>
      {/* Plinth capital */}
      <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.3, 1.3]} />
        <meshStandardMaterial
          map={stoneMap}
          color="#565664"
          roughness={0.7}
          metalness={0.2}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
        />
      </mesh>

      {/* Hunched Torso */}
      <mesh position={[0, 0.8, 0.1]} rotation={[0.4, 0, 0]} geometry={torsoGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          map={stoneMap}
          color="#525260"
          roughness={0.65}
          metalness={0.25}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
        />
      </mesh>

      {/* Horned Head & Glowing Eyes */}
      <group position={[0, 1.45, 0.45]}>
        <mesh geometry={headGeometry} castShadow receiveShadow>
          <meshStandardMaterial
            map={stoneMap}
            color="#5d5d6b"
            roughness={0.6}
            metalness={0.25}
            normalMap={normalMap}
          />
        </mesh>
        {/* Left Horn */}
        <mesh position={[-0.22, 0.35, -0.05]} rotation={[-0.3, 0, -0.4]} geometry={hornGeometry} castShadow>
          <meshStandardMaterial color="#22222a" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Right Horn */}
        <mesh position={[0.22, 0.35, -0.05]} rotation={[-0.3, 0, 0.4]} geometry={hornGeometry} castShadow>
          <meshStandardMaterial color="#22222a" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Glowing Ember Eyes */}
        <mesh position={[-0.14, 0.08, 0.28]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ff3300" />
        </mesh>
        <mesh position={[0.14, 0.08, 0.28]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ff3300" />
        </mesh>
      </group>

      {/* Bat Wings */}
      <mesh position={[-0.75, 1.1, -0.2]} rotation={[0.2, 0.6, 0.4]} geometry={wingGeometry} castShadow>
        <meshStandardMaterial
          map={stoneMap}
          color="#4c4c58"
          roughness={0.7}
          metalness={0.2}
          normalMap={normalMap}
        />
      </mesh>
      <mesh position={[0.75, 1.1, -0.2]} rotation={[0.2, -0.6, -0.4]} geometry={wingGeometry} castShadow>
        <meshStandardMaterial
          map={stoneMap}
          color="#4c4c58"
          roughness={0.7}
          metalness={0.2}
          normalMap={normalMap}
        />
      </mesh>
    </group>
  );
}

// Pointed Gothic Arch
function GothicArch({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  hasGargoyle = false,
}: {
  position?: [number, number, number];
  scale?: [number, number, number];
  hasGargoyle?: boolean;
}) {
  const archGeom = useMemo(() => getSharedArchGeometry(), []);
  const pillarGeom = useMemo(() => getSharedPillarGeometry(), []);
  const baseGeom = useMemo(() => getSharedPillarBaseGeometry(), []);
  const stoneMap = useMemo(() => getStoneTexture(), []);
  const normalMap = useMemo(() => getStoneNormalTexture(), []);
  const roughnessMap = useMemo(() => getStoneRoughnessTexture(), []);

  return (
    <group position={position} scale={scale}>
      {/* Main Arch Frame */}
      <mesh geometry={archGeom} receiveShadow castShadow>
        <meshStandardMaterial
          map={stoneMap}
          color="#555563"
          roughness={0.7}
          metalness={0.15}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          normalScale={new THREE.Vector2(0.6, 0.6)}
        />
      </mesh>

      {/* Golden Filigree Arch Crown Highlight */}
      <mesh position={[0, 11.8, 0.45]}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          color="#d4973b"
          emissive="#d4973b"
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Fluted Left Pillar */}
      <mesh position={[-2.9, 3.25, 0.45]} geometry={pillarGeom} castShadow receiveShadow>
        <meshStandardMaterial
          map={stoneMap}
          color="#626270"
          roughness={0.65}
          metalness={0.15}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
        />
      </mesh>
      {/* Left Pillar Base */}
      <mesh position={[-2.9, 0.25, 0.45]} geometry={baseGeom} castShadow receiveShadow>
        <meshStandardMaterial
          map={stoneMap}
          color="#4d4d59"
          roughness={0.75}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
        />
      </mesh>

      {/* Fluted Right Pillar */}
      <mesh position={[2.9, 3.25, 0.45]} geometry={pillarGeom} castShadow receiveShadow>
        <meshStandardMaterial
          map={stoneMap}
          color="#626270"
          roughness={0.65}
          metalness={0.15}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
        />
      </mesh>
      {/* Right Pillar Base */}
      <mesh position={[2.9, 0.25, 0.45]} geometry={baseGeom} castShadow receiveShadow>
        <meshStandardMaterial
          map={stoneMap}
          color="#4d4d59"
          roughness={0.75}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
        />
      </mesh>

      {/* Gargoyle Sentinels */}
      {hasGargoyle && (
        <>
          <GothicGargoyle position={[-2.9, 6.6, 0.45]} rotation={[0, Math.PI / 4, 0]} />
          <GothicGargoyle position={[2.9, 6.6, 0.45]} rotation={[0, -Math.PI / 4, 0]} />
        </>
      )}
    </group>
  );
}

// Gothic Stained Glass Rose Window
function RoseWindow({ position = [0, 14, -28] }: { position?: [number, number, number] }) {
  const roseTex = useMemo(() => getRoseWindowTexture(), []);

  return (
    <group position={position}>
      {/* Stone Tracery Outer Ring */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[5, 0.4, 16, 48]} />
        <meshStandardMaterial color="#2d2d38" roughness={0.7} metalness={0.25} />
      </mesh>
      {/* Inner Tracery Wheel */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[3, 0.22, 12, 36]} />
        <meshStandardMaterial color="#383848" roughness={0.65} metalness={0.3} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 6]} castShadow receiveShadow>
          <boxGeometry args={[10, 0.16, 0.12]} />
          <meshStandardMaterial color="#252530" roughness={0.7} />
        </mesh>
      ))}
      {/* Stained Glass Translucent Rose */}
      <mesh position={[0, 0, -0.12]} scale={[1.12, 1.12, 1.12]}>
        <circleGeometry args={[4.8, 48]} />
        <meshBasicMaterial
          color="#d67832"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[4.8, 48]} />
        <meshStandardMaterial
          map={roseTex}
          emissive="#d4973b"
          emissiveMap={roseTex}
          emissiveIntensity={1.25}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* A local beacon blooms around the glass; the nave beam is handled globally. */}
      <pointLight position={[0, 0, 1]} color="#d97736" intensity={7} distance={22} decay={2} />
    </group>
  );
}

// Glowing Obsidian Monolith
function ObsidianMonolith() {
  const monolithRef = useRef<THREE.Group>(null);
  const runeLightRef = useRef<THREE.PointLight>(null);
  const runeMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const runeAuraRef = useRef<THREE.Mesh>(null);
  const runeTex = useMemo(() => getRuneEmissiveTexture(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime || performance.now() * 0.001;
    if (monolithRef.current) {
      monolithRef.current.position.y = Math.sin(t * 1.2) * 0.15;
      monolithRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
    }
    if (runeLightRef.current && runeMatRef.current) {
      const intensity = Math.sin(t * 2.5) * 0.65 + 5.2;
      runeLightRef.current.intensity = intensity;
      runeMatRef.current.emissiveIntensity = intensity * 0.48;
    }
    if (runeAuraRef.current) {
      const auraPulse = Math.sin(t * 2.5) * 0.035 + 1;
      runeAuraRef.current.scale.setScalar(auraPulse);
      (runeAuraRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.055 + Math.sin(t * 2.5) * 0.012;
    }
  });

  return (
    <group ref={monolithRef}>
      {/* Main Sharp Obsidian Shard */}
      <mesh castShadow receiveShadow>
        <octahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial
          color="#161620"
          roughness={0.18}
          metalness={0.88}
        />
      </mesh>

      {/* Orbiting Runic Shards */}
      {[-1.8, 1.8].map((x, i) => (
        <mesh key={i} position={[x, i % 2 === 0 ? 0.6 : -0.6, 0]} rotation={[0.4, i, 0.4]} castShadow>
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color="#20202a" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}

      {/* Glowing Runic Inscription Core Ring */}
      <mesh ref={runeAuraRef}>
        <sphereGeometry args={[1.65, 24, 24]} />
        <meshBasicMaterial
          color="#e9a23c"
          transparent
          opacity={0.055}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[1.25, 0.05, 16, 64]} />
        <meshStandardMaterial
          ref={runeMatRef}
          color="#ffb703"
          emissive="#f59e0b"
          emissiveMap={runeTex}
          emissiveIntensity={3.2}
          roughness={0.1}
        />
      </mesh>

      {/* Point Light inside the Relic */}
      <pointLight
        ref={runeLightRef}
        color="#f59e0b"
        intensity={5.2}
        distance={14}
        decay={2.0}
      />
    </group>
  );
}

// Altar Stone Dais (Low, sleek basalt dais)
function AltarDais() {
  const stoneMap = useMemo(() => getStoneTexture(), []);
  const normalMap = useMemo(() => getStoneNormalTexture(), []);
  const roughnessMap = useMemo(() => getStoneRoughnessTexture(), []);

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.4, 2.6, 0.2, 24]} />
        <meshStandardMaterial
          map={stoneMap}
          color="#40404a"
          roughness={0.8}
          metalness={0.1}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
        />
      </mesh>
      <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.6, 1.8, 0.15, 24]} />
        <meshStandardMaterial
          map={stoneMap}
          color="#4a4a56"
          roughness={0.75}
          metalness={0.15}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
        />
      </mesh>
    </group>
  );
}

// Cathedral Torch with warm amber light
function CathedralTorch({
  position,
  hasLight = true,
}: {
  position: [number, number, number];
  hasLight?: boolean;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const phase = Math.abs(position[0] * 0.71 + position[2] * 0.37);

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime || performance.now() * 0.001) + phase;
    const flicker =
      Math.sin(t * 11.7) * 0.34 +
      Math.sin(t * 19.1 + 1.4) * 0.2 +
      Math.cos(t * 7.3) * 0.12;

    if (lightRef.current) {
      lightRef.current.intensity = 5.4 + flicker;
    }
    if (glowRef.current) {
      const scale = 1 + flicker * 0.035;
      glowRef.current.scale.setScalar(scale);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + flicker * 0.012;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.05, 0.6, 8]} />
        <meshStandardMaterial color="#383840" metalness={0.75} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial
          color="#ff7b00"
          emissive="#ff5400"
          emissiveIntensity={2.8}
        />
      </mesh>
      <mesh ref={glowRef} position={[0, 0.35, 0]} renderOrder={2}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshBasicMaterial
          color="#ff9b45"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      {hasLight && (
        <pointLight
          ref={lightRef}
          position={[0, 0.4, 0.08]}
          color="#ff8c00"
          intensity={5.4}
          distance={12}
          decay={2}
        />
      )}
    </group>
  );
}

function CathedralLightRig() {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);

  useLayoutEffect(() => {
    const keyLight = keyLightRef.current;
    const rimLight = rimLightRef.current;

    if (keyLight) {
      keyLight.target.position.set(0, 1.5, -14);
      keyLight.parent?.add(keyLight.target);
    }
    if (rimLight) {
      rimLight.target.position.set(0, 2, -14);
      rimLight.parent?.add(rimLight.target);
    }

    return () => {
      if (keyLight) keyLight.parent?.remove(keyLight.target);
      if (rimLight) rimLight.parent?.remove(rimLight.target);
    };
  }, []);

  return (
    <>
      <ambientLight intensity={0.16} color="#273044" />
      <hemisphereLight args={['#64789b', '#100d0f', 0.42]} />

      <directionalLight
        ref={keyLightRef}
        position={[11, 23, 9]}
        intensity={1.75}
        color="#f0d2a5"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={24}
        shadow-camera-bottom={-18}
        shadow-bias={-0.00025}
        shadow-normalBias={0.035}
        shadow-radius={4}
      />

      <directionalLight
        ref={rimLightRef}
        position={[-14, 17, -25]}
        intensity={1.15}
        color="#7796c4"
      />

      <pointLight
        position={[0, 7, -14]}
        color="#46597a"
        intensity={3.2}
        distance={38}
        decay={2}
      />
    </>
  );
}

export function CathedralScene() {
  const archesCount = 6;
  const archSpacing = 6.5;
  const floorTextures = useMemo(() => getCathedralFloorTextures(), []);

  return (
    <group>
      {/* Floor Masonry Flagstones */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -14]} receiveShadow>
        <planeGeometry args={[40, 80, 1, 1]} />
        <meshStandardMaterial
          map={floorTextures.map}
          normalMap={floorTextures.normalMap}
          roughnessMap={floorTextures.roughnessMap}
          roughness={0.75}
          metalness={0.15}
          normalScale={new THREE.Vector2(0.5, 0.5)}
        />
      </mesh>

      {/* Volumetric Cathedral God-Ray Light Shafts */}
      <VolumetricLightBeams />

      {/* Gothic Rose Window at the End of Nave */}
      <RoseWindow position={[0, 14, -28]} />

      {/* Gothic Arches Nave */}
      {Array.from({ length: archesCount }).map((_, i) => (
        <group key={i} position={[0, 0, -i * archSpacing + 5]}>
          <GothicArch scale={[1.4, 1.4, 1.4]} hasGargoyle={i === 0 || i === 2 || i === 4} />
          <CathedralTorch position={[-3.8, 4, 0.45]} hasLight={true} />
          <CathedralTorch position={[3.8, 4, 0.45]} hasLight={true} />
        </group>
      ))}

      {/* Chamber I: Sacred Monolith floating in the upper cathedral nave */}
      <group position={[0, 3.5, -8.0]} scale={[0.75, 0.75, 0.75]}>
        <ObsidianMonolith />
      </group>
      <group position={[0, 0, -8.0]}>
        <AltarDais />
      </group>

      {/* Floating Embers */}
      <EmberParticles count={260} area={[16, 18, 35]} color="#f59e0b" speed={0.8} />

      <CathedralLightRig />
    </group>
  );
}
