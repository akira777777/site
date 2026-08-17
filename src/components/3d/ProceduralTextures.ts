'use client';

import * as THREE from 'three';

interface TextureSet {
  map?: THREE.CanvasTexture;
  normalMap?: THREE.CanvasTexture;
  roughnessMap?: THREE.CanvasTexture;
  metalnessMap?: THREE.CanvasTexture;
  emissiveMap?: THREE.CanvasTexture;
  aoMap?: THREE.CanvasTexture;
}

const cache: Record<string, THREE.CanvasTexture> = {};

const clampByte = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

function createEmptyTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 2;
  return new THREE.CanvasTexture(canvas);
}

function createCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function configureTexture(
  canvas: HTMLCanvasElement,
  repeat: [number, number],
  colorTexture = false,
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.anisotropy = 4;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  if (colorTexture) texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Stable integer hash keeps procedural materials identical across hot reloads and visits.
function hash2D(x: number, y: number, seed: number): number {
  let value = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

function valueNoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothstep(x - x0);
  const ty = smoothstep(y - y0);
  const a = hash2D(x0, y0, seed);
  const b = hash2D(x0 + 1, y0, seed);
  const c = hash2D(x0, y0 + 1, seed);
  const d = hash2D(x0 + 1, y0 + 1, seed);
  const top = a + (b - a) * tx;
  const bottom = c + (d - c) * tx;
  return top + (bottom - top) * ty;
}

function fbm(x: number, y: number, seed: number, octaves = 4): number {
  let total = 0;
  let amplitude = 0.55;
  let frequency = 1;
  let weight = 0;

  for (let octave = 0; octave < octaves; octave++) {
    total += valueNoise(x * frequency, y * frequency, seed + octave * 37) * amplitude;
    weight += amplitude;
    frequency *= 2.03;
    amplitude *= 0.5;
  }

  return total / weight;
}

function writeNormalMap(
  context: CanvasRenderingContext2D,
  heightMap: Float32Array,
  size: number,
  strength: number,
) {
  const image = context.createImageData(size, size);
  const data = image.data;

  for (let y = 0; y < size; y++) {
    const yUp = (y - 1 + size) % size;
    const yDown = (y + 1) % size;

    for (let x = 0; x < size; x++) {
      const xLeft = (x - 1 + size) % size;
      const xRight = (x + 1) % size;
      const dx = (heightMap[y * size + xRight] - heightMap[y * size + xLeft]) * strength;
      const dy = (heightMap[yDown * size + x] - heightMap[yUp * size + x]) * strength;
      const length = Math.sqrt(dx * dx + dy * dy + 1);
      const index = (y * size + x) * 4;

      data[index] = clampByte(((dx / length) * 0.5 + 0.5) * 255);
      data[index + 1] = clampByte(((-dy / length) * 0.5 + 0.5) * 255);
      data[index + 2] = clampByte((1 / length) * 0.5 * 255 + 127.5);
      data[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
}

// Weathered, staggered slate flagstones with coherent albedo, normal, and roughness maps.
export function getCathedralFloorTextures(): TextureSet {
  if (cache.floor_diffuse && cache.floor_normal && cache.floor_roughness) {
    return {
      map: cache.floor_diffuse,
      normalMap: cache.floor_normal,
      roughnessMap: cache.floor_roughness,
    };
  }
  if (typeof document === 'undefined') return { map: createEmptyTexture() };

  const size = 768;
  const diffuseCanvas = createCanvas(size);
  const normalCanvas = createCanvas(size);
  const roughnessCanvas = createCanvas(size);
  const diffuseContext = diffuseCanvas.getContext('2d');
  const normalContext = normalCanvas.getContext('2d');
  const roughnessContext = roughnessCanvas.getContext('2d');

  if (diffuseContext && normalContext && roughnessContext) {
    const diffuse = diffuseContext.createImageData(size, size);
    const roughness = roughnessContext.createImageData(size, size);
    const heightMap = new Float32Array(size * size);
    const tileWidth = size / 6;
    const tileHeight = size / 8;

    for (let y = 0; y < size; y++) {
      const row = Math.floor(y / tileHeight);
      const localY = (y % tileHeight) / tileHeight;
      const rowOffset = row % 2 === 0 ? 0 : tileWidth * 0.5;

      for (let x = 0; x < size; x++) {
        const shiftedX = (x + rowOffset) % size;
        const column = Math.floor(shiftedX / tileWidth);
        const localX = (shiftedX % tileWidth) / tileWidth;
        const edgeDistance = Math.min(localX, 1 - localX, localY, 1 - localY);
        const stoneMask = smoothstep(Math.max(0, Math.min(1, (edgeDistance - 0.018) / 0.035)));
        const tileTone = hash2D(column, row, 91) - 0.5;
        const broadVariation = fbm(x * 0.008, y * 0.008, 17, 4) - 0.5;
        const grain = fbm(x * 0.055, y * 0.055, 53, 3) - 0.5;
        const mineralVein = Math.pow(Math.abs(Math.sin((x + y * 0.45) * 0.035 + broadVariation * 5)), 14);
        const crackSignal = Math.abs(Math.sin(localX * 11.3 + localY * 7.1 + tileTone * 5));
        const hairlineCrack = crackSignal < 0.018 && edgeDistance > 0.11 ? 1 : 0;
        const dampStain = Math.max(0, fbm(x * 0.012, y * 0.012, 203, 4) - 0.62);
        const index = (y * size + x) * 4;

        const mortar = 13 + grain * 5;
        const stone = 47 + tileTone * 13 + broadVariation * 16 + grain * 9 - dampStain * 45;
        const base = mortar + (stone - mortar) * stoneMask - hairlineCrack * 13;

        diffuse.data[index] = clampByte(base + 3 + mineralVein * 4);
        diffuse.data[index + 1] = clampByte(base + dampStain * 8);
        diffuse.data[index + 2] = clampByte(base + 7 - mineralVein * 2);
        diffuse.data[index + 3] = 255;

        heightMap[y * size + x] =
          -0.18 + stoneMask * (0.64 + broadVariation * 0.16 + grain * 0.08) -
          hairlineCrack * 0.18 -
          mineralVein * 0.025;

        const edgeWear = Math.max(0, Math.min(1, (edgeDistance - 0.018) / 0.065));
        const roughnessValue =
          242 - stoneMask * 35 - edgeWear * 8 + grain * 17 + dampStain * 35 - mineralVein * 16;
        const roughByte = clampByte(roughnessValue);
        roughness.data[index] = roughByte;
        roughness.data[index + 1] = roughByte;
        roughness.data[index + 2] = roughByte;
        roughness.data[index + 3] = 255;
      }
    }

    diffuseContext.putImageData(diffuse, 0, 0);
    roughnessContext.putImageData(roughness, 0, 0);
    writeNormalMap(normalContext, heightMap, size, 4.8);
  }

  cache.floor_diffuse = configureTexture(diffuseCanvas, [3, 7], true);
  cache.floor_normal = configureTexture(normalCanvas, [3, 7]);
  cache.floor_roughness = configureTexture(roughnessCanvas, [3, 7]);

  return {
    map: cache.floor_diffuse,
    normalMap: cache.floor_normal,
    roughnessMap: cache.floor_roughness,
  };
}

function createStoneSurfaceTextures(): TextureSet {
  if (cache.stone_diffuse && cache.stone_normal && cache.stone_roughness) {
    return {
      map: cache.stone_diffuse,
      normalMap: cache.stone_normal,
      roughnessMap: cache.stone_roughness,
    };
  }
  if (typeof document === 'undefined') return { map: createEmptyTexture() };

  const size = 512;
  const diffuseCanvas = createCanvas(size);
  const normalCanvas = createCanvas(size);
  const roughnessCanvas = createCanvas(size);
  const diffuseContext = diffuseCanvas.getContext('2d');
  const normalContext = normalCanvas.getContext('2d');
  const roughnessContext = roughnessCanvas.getContext('2d');

  if (diffuseContext && normalContext && roughnessContext) {
    const diffuse = diffuseContext.createImageData(size, size);
    const roughness = roughnessContext.createImageData(size, size);
    const heightMap = new Float32Array(size * size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const macro = fbm(x * 0.012, y * 0.012, 311, 5) - 0.5;
        const granular = fbm(x * 0.085, y * 0.085, 419, 3) - 0.5;
        const pittingNoise = fbm(x * 0.16, y * 0.16, 607, 2);
        const pit = pittingNoise > 0.79 ? (pittingNoise - 0.79) * 3.2 : 0;
        const vein = Math.pow(Math.abs(Math.sin(x * 0.018 - y * 0.012 + macro * 6)), 18);
        const index = (y * size + x) * 4;
        const shade = 174 + macro * 28 + granular * 16 - pit * 42;

        diffuse.data[index] = clampByte(shade + 4 + vein * 6);
        diffuse.data[index + 1] = clampByte(shade + 2);
        diffuse.data[index + 2] = clampByte(shade + 10 - vein * 3);
        diffuse.data[index + 3] = 255;

        heightMap[y * size + x] = macro * 0.42 + granular * 0.22 - pit * 0.42 - vein * 0.045;

        const roughByte = clampByte(205 + granular * 24 + pit * 32 - vein * 24);
        roughness.data[index] = roughByte;
        roughness.data[index + 1] = roughByte;
        roughness.data[index + 2] = roughByte;
        roughness.data[index + 3] = 255;
      }
    }

    diffuseContext.putImageData(diffuse, 0, 0);
    roughnessContext.putImageData(roughness, 0, 0);
    writeNormalMap(normalContext, heightMap, size, 3.4);
  }

  cache.stone_diffuse = configureTexture(diffuseCanvas, [2.5, 2.5], true);
  cache.stone_normal = configureTexture(normalCanvas, [2.5, 2.5]);
  cache.stone_roughness = configureTexture(roughnessCanvas, [2.5, 2.5]);

  return {
    map: cache.stone_diffuse,
    normalMap: cache.stone_normal,
    roughnessMap: cache.stone_roughness,
  };
}

export function getStoneTexture(): THREE.CanvasTexture {
  return createStoneSurfaceTextures().map ?? createEmptyTexture();
}

export function getStoneNormalTexture(): THREE.CanvasTexture {
  return createStoneSurfaceTextures().normalMap ?? createEmptyTexture();
}

export function getStoneRoughnessTexture(): THREE.CanvasTexture {
  return createStoneSurfaceTextures().roughnessMap ?? createEmptyTexture();
}

// Layered forged-steel bands with matching color, normal, roughness, and metalness maps.
export function getDamascusSteelTextures(): TextureSet {
  if (cache.damascus_diffuse && cache.damascus_normal && cache.damascus_roughness && cache.damascus_metalness) {
    return {
      map: cache.damascus_diffuse,
      normalMap: cache.damascus_normal,
      roughnessMap: cache.damascus_roughness,
      metalnessMap: cache.damascus_metalness,
    };
  }
  if (typeof document === 'undefined') return { map: createEmptyTexture() };

  const size = 512;
  const diffuseCanvas = createCanvas(size);
  const normalCanvas = createCanvas(size);
  const roughnessCanvas = createCanvas(size);
  const metalnessCanvas = createCanvas(size);
  const diffuseContext = diffuseCanvas.getContext('2d');
  const normalContext = normalCanvas.getContext('2d');
  const roughnessContext = roughnessCanvas.getContext('2d');
  const metalnessContext = metalnessCanvas.getContext('2d');

  if (diffuseContext && normalContext && roughnessContext && metalnessContext) {
    const diffuse = diffuseContext.createImageData(size, size);
    const roughness = roughnessContext.createImageData(size, size);
    const metalness = metalnessContext.createImageData(size, size);
    const heightMap = new Float32Array(size * size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const warp = (fbm(x * 0.018, y * 0.018, 733, 4) - 0.5) * 42;
        const folded = Math.sin((y + warp + Math.sin(x * 0.024) * 22) * 0.115);
        const secondary = Math.sin((y - warp * 0.35) * 0.23 + x * 0.014) * 0.32;
        const band = 0.5 + 0.5 * Math.sin(folded * 3.4 + secondary);
        const brushed = fbm(x * 0.19, y * 0.035, 887, 3) - 0.5;
        const oxide = Math.max(0, fbm(x * 0.026, y * 0.026, 991, 4) - 0.7) * 3.3;
        const index = (y * size + x) * 4;
        const shade = 142 + band * 60 + brushed * 14 - oxide * 58;

        diffuse.data[index] = clampByte(shade - oxide * 18);
        diffuse.data[index + 1] = clampByte(shade + 4 - oxide * 24);
        diffuse.data[index + 2] = clampByte(shade + 14 - oxide * 10);
        diffuse.data[index + 3] = 255;

        heightMap[y * size + x] = (band - 0.5) * 0.28 + brushed * 0.1 - oxide * 0.12;

        const roughByte = clampByte(48 + (1 - band) * 58 + Math.abs(brushed) * 28 + oxide * 74);
        roughness.data[index] = roughByte;
        roughness.data[index + 1] = roughByte;
        roughness.data[index + 2] = roughByte;
        roughness.data[index + 3] = 255;

        const metalByte = clampByte(250 - oxide * 105);
        metalness.data[index] = metalByte;
        metalness.data[index + 1] = metalByte;
        metalness.data[index + 2] = metalByte;
        metalness.data[index + 3] = 255;
      }
    }

    diffuseContext.putImageData(diffuse, 0, 0);
    roughnessContext.putImageData(roughness, 0, 0);
    metalnessContext.putImageData(metalness, 0, 0);
    writeNormalMap(normalContext, heightMap, size, 4.5);
  }

  cache.damascus_diffuse = configureTexture(diffuseCanvas, [1.2, 3.6], true);
  cache.damascus_normal = configureTexture(normalCanvas, [1.2, 3.6]);
  cache.damascus_roughness = configureTexture(roughnessCanvas, [1.2, 3.6]);
  cache.damascus_metalness = configureTexture(metalnessCanvas, [1.2, 3.6]);

  return {
    map: cache.damascus_diffuse,
    normalMap: cache.damascus_normal,
    roughnessMap: cache.damascus_roughness,
    metalnessMap: cache.damascus_metalness,
  };
}

// Stained glass rose window with deterministic age, soot, and subtle pane variation.
export function getRoseWindowTexture(): THREE.CanvasTexture {
  if (cache.rose_window) return cache.rose_window;
  if (typeof document === 'undefined') return createEmptyTexture();

  const size = 512;
  const canvas = createCanvas(size);
  const context = canvas.getContext('2d');

  if (context) {
    const center = size / 2;
    const colors = ['#9b1c1c', '#d4973b', '#681313', '#d83b57', '#1d3557', '#e63946'];

    context.fillStyle = '#09090d';
    context.fillRect(0, 0, size, size);

    for (let radius = 220; radius > 30; radius -= 40) {
      for (let petal = 0; petal < 12; petal++) {
        const startAngle = (petal / 12) * Math.PI * 2;
        const endAngle = ((petal + 1) / 12) * Math.PI * 2;
        const gradient = context.createRadialGradient(center, center, radius * 0.1, center, center, radius);
        const baseColor = colors[(petal + Math.floor(radius / 40)) % colors.length];

        gradient.addColorStop(0, '#f0ad4e');
        gradient.addColorStop(0.34, baseColor);
        gradient.addColorStop(1, '#260b16');
        context.beginPath();
        context.moveTo(center, center);
        context.arc(center, center, radius, startAngle, endAngle);
        context.closePath();
        context.fillStyle = gradient;
        context.fill();
        context.strokeStyle = '#0d0d13';
        context.lineWidth = 7;
        context.stroke();
      }
    }

    context.beginPath();
    context.arc(center, center, 38, 0, Math.PI * 2);
    context.fillStyle = '#f59e0b';
    context.fill();
    context.strokeStyle = '#08080b';
    context.lineWidth = 6;
    context.stroke();

    const image = context.getImageData(0, 0, size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = (y * size + x) * 4;
        const luminance = image.data[index] + image.data[index + 1] + image.data[index + 2];
        if (luminance < 55) continue;

        const mottling = fbm(x * 0.035, y * 0.035, 1201, 3) - 0.5;
        const soot = Math.max(0, fbm(x * 0.012, y * 0.012, 1307, 4) - 0.64) * 1.7;
        const multiplier = 0.9 + mottling * 0.22 - soot * 0.4;
        image.data[index] = clampByte(image.data[index] * multiplier);
        image.data[index + 1] = clampByte(image.data[index + 1] * multiplier);
        image.data[index + 2] = clampByte(image.data[index + 2] * (multiplier + 0.035));
      }
    }
    context.putImageData(image, 0, 0);
  }

  cache.rose_window = configureTexture(canvas, [1, 1], true);
  cache.rose_window.wrapS = cache.rose_window.wrapT = THREE.ClampToEdgeWrapping;
  return cache.rose_window;
}

export function getRuneEmissiveTexture(): THREE.CanvasTexture {
  if (cache.rune_emissive) return cache.rune_emissive;
  if (typeof document === 'undefined') return createEmptyTexture();

  const size = 512;
  const canvas = createCanvas(size);
  const context = canvas.getContext('2d');

  if (context) {
    context.fillStyle = '#000000';
    context.fillRect(0, 0, size, size);
    context.font = 'bold 36px serif';
    context.textBaseline = 'middle';
    context.shadowColor = '#f59e0b';
    context.shadowBlur = 10;
    context.strokeStyle = '#f59e0b';
    context.fillStyle = '#ffd27a';
    context.lineWidth = 2;

    const runes = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛈᛇᛉᛋᛏᛒᛖᛗᛚᛜᛞᛟ';
    for (let index = 0; index < 32; index++) {
      const rune = runes[index % runes.length];
      const x = (index % 8) * 64 + 16;
      const y = Math.floor(index / 8) * 128 + 48;
      context.fillText(rune, x, y);
      context.strokeText(rune, x, y);
    }
  }

  cache.rune_emissive = configureTexture(canvas, [1, 1], true);
  return cache.rune_emissive;
}
