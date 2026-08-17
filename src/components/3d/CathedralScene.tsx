'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EmberParticles } from './EmberParticles';
import { VolumetricLightBeams } from './VolumetricLightBeams';
import {
  getCathedralFloorTextures,
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

// Crisp Gothic Gargoyle Sentinel Statue
function GothicGargoyle({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const normalMap = useMemo(() => getStoneNormalTexture(), []);
  const roughnessMap = useMemo(() => getStoneRoughnessTexture(), []);

  if (!sharedGargoyleTorsoGeom) sharedGargoyleTorsoGeom = new THREE.BoxGeometry(0.75, 0.95, 0.65);
  if (!sharedGargoyleHeadGeom) sharedGargoyleHeadGeom = new THREE.BoxGeometry(0.5, 0.5, 0.55);
  if (!sharedHornGeom) sharedHornGeom = new THREE.ConeGeometry(0.1, 0.55, 6);
  if (!sharedWingGeom) sharedWingGeom = new THREE.BoxGeometry(0.95, 1.3, 0.08);

  return (
    <group position={position} rotation={rotation} scale={[0.55, 0.55, 0.55]}>
      {/* Plinth capital */}
      <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.3, 1.3]} />
        <meshStandardMaterial
          color="#383844"
          roughness={0.7}
          metalness={0.2}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
        />
      </mesh>

      {/* Hunched Torso */}
      <mesh position={[0, 0.8, 0.1]} rotation={[0.4, 0, 0]} geometry={sharedGargoyleTorsoGeom} castShadow receiveShadow>
        <meshStandardMaterial
          color="#32323e"
          roughness={0.65}
          metalness={0.25}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
        />
      </mesh>

      {/* Horned Head & Glowing Eyes */}
      <group position={[0, 1.45, 0.45]}>
        <mesh geometry={sharedGargoyleHeadGeom} castShadow receiveShadow>
          <meshStandardMaterial
            color="#40404e"
            roughness={0.6}
            metalness={0.25}
            normalMap={normalMap}
          />
        </mesh>
        {/* Left Horn */}
        <mesh position={[-0.22, 0.35, -0.05]} rotation={[-0.3, 0, -0.4]} geometry={sharedHornGeom} castShadow>
          <meshStandardMaterial color="#22222a" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Right Horn */}
        <mesh position={[0.22, 0.35, -0.05]} rotation={[-0.3, 0, 0.4]} geometry={sharedHornGeom} castShadow>
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
      <mesh position={[-0.75, 1.1, -0.2]} rotation={[0.2, 0.6, 0.4]} geometry={sharedWingGeom} castShadow>
        <meshStandardMaterial
          color="#2d2d38"
          roughness={0.7}
          metalness={0.2}
          normalMap={normalMap}
        />
      </mesh>
      <mesh position={[0.75, 1.1, -0.2]} rotation={[0.2, -0.6, -0.4]} geometry={sharedWingGeom} castShadow>
        <meshStandardMaterial
          color="#2d2d38"
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
  const normalMap = useMemo(() => getStoneNormalTexture(), []);
  const roughnessMap = useMemo(() => getStoneRoughnessTexture(), []);

  return (
    <group position={position} scale={scale}>
      {/* Main Arch Frame */}
      <mesh geometry={archGeom} receiveShadow castShadow>
        <meshStandardMaterial
          color="#343440"
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
          color="#3c3c4a"
          roughness={0.65}
          metalness={0.15}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
        />
      </mesh>
      {/* Left Pillar Base */}
      <mesh position={[-2.9, 0.25, 0.45]} geometry={baseGeom} castShadow receiveShadow>
        <meshStandardMaterial color="#252530" roughness={0.75} normalMap={normalMap} />
      </mesh>

      {/* Fluted Right Pillar */}
      <mesh position={[2.9, 3.25, 0.45]} geometry={pillarGeom} castShadow receiveShadow>
        <meshStandardMaterial
          color="#3c3c4a"
          roughness={0.65}
          metalness={0.15}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
        />
      </mesh>
      {/* Right Pillar Base */}
      <mesh position={[2.9, 0.25, 0.45]} geometry={baseGeom} castShadow receiveShadow>
        <meshStandardMaterial color="#252530" roughness={0.75} normalMap={normalMap} />
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
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[4.8, 48]} />
        <meshStandardMaterial
          map={roseTex}
          emissive="#d4973b"
          emissiveMap={roseTex}
          emissiveIntensity={1.6}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Backlight Beacon Rays */}
      <pointLight color="#d97706" intensity={3.5} distance={30} decay={2.0} />
      <directionalLight position={[0, 14, -32]} intensity={1.5} color="#f59e0b" />
    </group>
  );
}

// Glowing Obsidian Monolith
function ObsidianMonolith() {
  const monolithRef = useRef<THREE.Group>(null);
  const runeLightRef = useRef<THREE.PointLight>(null);
  const runeMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const runeTex = useMemo(() => getRuneEmissiveTexture(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime || performance.now() * 0.001;
    if (monolithRef.current) {
      monolithRef.current.position.y = Math.sin(t * 1.2) * 0.15;
      monolithRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
    }
    if (runeLightRef.current && runeMatRef.current) {
      const intensity = Math.sin(t * 2.5) * 0.8 + 2.8;
      runeLightRef.current.intensity = intensity;
      runeMatRef.current.emissiveIntensity = intensity * 0.9;
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
        intensity={3.2}
        distance={14}
        decay={2.0}
      />
    </group>
  );
}

// Altar Stone Dais (Low, sleek basalt dais)
function AltarDais() {
  const normalMap = useMemo(() => getStoneNormalTexture(), []);
  const roughnessMap = useMemo(() => getStoneRoughnessTexture(), []);

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.4, 2.6, 0.2, 24]} />
        <meshStandardMaterial
          color="#181820"
          roughness={0.8}
          metalness={0.1}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
        />
      </mesh>
      <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.6, 1.8, 0.15, 24]} />
        <meshStandardMaterial
          color="#22222c"
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

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const t = clock.elapsedTime || performance.now() * 0.001;
      const flicker = Math.sin(t * 14) * 0.3 + Math.cos(t * 26) * 0.2;
      lightRef.current.intensity = 2.4 + flicker;
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
          emissiveIntensity={3.5}
        />
      </mesh>
      {hasLight && (
        <pointLight
          ref={lightRef}
          color="#ff8c00"
          intensity={2.4}
          distance={14}
          decay={2.0}
        />
      )}
    </group>
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

      {/* ====================================================
          MASTER CHIAROSCURO 3-POINT LIGHT RIG
          ==================================================== */}

      {/* 1. Atmospheric Ambient (Subtle cool fill preventing pitch-black clipping) */}
      <ambientLight intensity={0.4} color="#2d3345" />

      {/* 2. Cathedral Vault Sky/Floor Hemisphere */}
      <hemisphereLight args={['#50607a', '#141418', 0.65]} />

      {/* 3. KEY LIGHT: Vaulted Clerestory Sunbeam (Warm Amber Gold) */}
      <directionalLight
        position={[12, 26, 12]}
        intensity={2.4}
        color="#fde68a"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      {/* 4. RIM LIGHT: High-Angle Cold Moonlight (Chiseled Silhouette Highlights) */}
      <directionalLight
        position={[-16, 22, -16]}
        intensity={2.0}
        color="#7da4d4"
      />
    </group>
  );
}
