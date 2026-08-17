'use client';

import * as THREE from 'three';

// State-of-the-art Procedural PBR Texture Synthesis Suite for Gothic Dark Fantasy WebGL

interface TextureSet {
  map?: THREE.CanvasTexture;
  normalMap?: THREE.CanvasTexture;
  roughnessMap?: THREE.CanvasTexture;
  metalnessMap?: THREE.CanvasTexture;
  emissiveMap?: THREE.CanvasTexture;
  aoMap?: THREE.CanvasTexture;
}

const cache: Record<string, THREE.CanvasTexture> = {};

function createEmptyTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 2;
  return new THREE.CanvasTexture(canvas);
}

// 1. Cathedral Floor Flagstone Masonry (Dark, moody, natural weathered slate)
export function getCathedralFloorTextures(): TextureSet {
  if (cache['floor_diffuse'] && cache['floor_normal'] && cache['floor_rough']) {
    return {
      map: cache['floor_diffuse'],
      normalMap: cache['floor_normal'],
      roughnessMap: cache['floor_rough'],
    };
  }
  if (typeof document === 'undefined') return { map: createEmptyTexture() };

  const size = 1024;
  const canvasDiff = document.createElement('canvas');
  const canvasNorm = document.createElement('canvas');
  const canvasRough = document.createElement('canvas');
  canvasDiff.width = size;
  canvasDiff.height = size;
  canvasNorm.width = size;
  canvasNorm.height = size;
  canvasRough.width = size;
  canvasRough.height = size;

  const ctxD = canvasDiff.getContext('2d');
  const ctxN = canvasNorm.getContext('2d');
  const ctxR = canvasRough.getContext('2d');

  if (ctxD && ctxN && ctxR) {
    // Deep Charcoal Stone Mortar Base
    ctxD.fillStyle = '#0f0f13';
    ctxD.fillRect(0, 0, size, size);

    const cols = 6;
    const rows = 6;
    const tileW = size / cols;
    const tileH = size / rows;
    const gap = 5;

    // Draw Flagstone Tiles with subtle natural slate variations
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * tileW + gap / 2;
        const y = r * tileH + gap / 2;
        const w = tileW - gap;
        const h = tileH - gap;

        // Dark weathered slate shades (grey-charcoal, subtle warm undertone)
        const baseShade = 34 + Math.floor((Math.sin(r * 2.1 + c * 3.4) + 1) * 8);
        const rColor = baseShade + 2;
        const gColor = baseShade;
        const bColor = baseShade + 4;

        ctxD.fillStyle = `rgb(${rColor}, ${gColor}, ${bColor})`;
        ctxD.fillRect(x, y, w, h);

        // Subtle chiseled stone edge
        ctxD.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctxD.lineWidth = 2;
        ctxD.strokeRect(x + 2, y + 2, w - 4, h - 4);
      }
    }

    // Add noise grain & weathering
    const imgDataD = ctxD.getImageData(0, 0, size, size);
    const imgDataN = ctxN.createImageData(size, size);
    const imgDataR = ctxR.createImageData(size, size);

    const dataD = imgDataD.data;
    const dataN = imgDataN.data;
    const dataR = imgDataR.data;

    const heightMap = new Float32Array(size * size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const noise = (Math.random() - 0.5) * 18;

        dataD[idx + 0] = Math.min(255, Math.max(0, dataD[idx + 0] + noise));
        dataD[idx + 1] = Math.min(255, Math.max(0, dataD[idx + 1] + noise));
        dataD[idx + 2] = Math.min(255, Math.max(0, dataD[idx + 2] + noise));

        const brightness = (dataD[idx + 0] + dataD[idx + 1] + dataD[idx + 2]) / 3;
        heightMap[y * size + x] = brightness / 255.0;

        // Matte stone roughness
        const roughVal = Math.floor(190 + (Math.random() - 0.5) * 30);
        dataR[idx + 0] = roughVal;
        dataR[idx + 1] = roughVal;
        dataR[idx + 2] = roughVal;
        dataR[idx + 3] = 255;
      }
    }

    // Tangent Normal Map
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const xLeft = heightMap[y * size + ((x - 1 + size) % size)];
        const xRight = heightMap[y * size + ((x + 1) % size)];
        const yUp = heightMap[((y - 1 + size) % size) * size + x];
        const yDown = heightMap[((y + 1) % size) * size + x];

        const dx = (xRight - xLeft) * 2.2;
        const dy = (yDown - yUp) * 2.2;
        const dz = 1.0;

        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const nx = (dx / len) * 0.5 + 0.5;
        const ny = (-dy / len) * 0.5 + 0.5;
        const nz = (dz / len) * 0.5 + 0.5;

        const idx = (y * size + x) * 4;
        dataN[idx + 0] = Math.floor(nx * 255);
        dataN[idx + 1] = Math.floor(ny * 255);
        dataN[idx + 2] = Math.floor(nz * 255);
        dataN[idx + 3] = 255;
      }
    }

    ctxD.putImageData(imgDataD, 0, 0);
    ctxN.putImageData(imgDataN, 0, 0);
    ctxR.putImageData(imgDataR, 0, 0);
  }

  const texD = new THREE.CanvasTexture(canvasDiff);
  const texN = new THREE.CanvasTexture(canvasNorm);
  const texR = new THREE.CanvasTexture(canvasRough);

  texD.wrapS = texD.wrapT = THREE.RepeatWrapping;
  texN.wrapS = texN.wrapT = THREE.RepeatWrapping;
  texR.wrapS = texR.wrapT = THREE.RepeatWrapping;
  texD.repeat.set(3, 6);
  texN.repeat.set(3, 6);
  texR.repeat.set(3, 6);

  cache['floor_diffuse'] = texD;
  cache['floor_normal'] = texN;
  cache['floor_rough'] = texR;

  return { map: texD, normalMap: texN, roughnessMap: texR };
}

// 2. Weathered Cathedral Ashlar Stone Texture
export function getStoneNormalTexture(): THREE.CanvasTexture {
  if (cache['stone_normal']) return cache['stone_normal'];
  if (typeof document === 'undefined') return createEmptyTexture();

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    const heightMap = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let n =
          Math.sin(x * 0.08) * Math.cos(y * 0.08) * 0.4 +
          Math.sin(x * 0.2 + y * 0.15) * 0.3 +
          (Math.random() - 0.5) * 0.25;

        heightMap[y * size + x] = n;
      }
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const xLeft = heightMap[y * size + ((x - 1 + size) % size)];
        const xRight = heightMap[y * size + ((x + 1) % size)];
        const yUp = heightMap[((y - 1 + size) % size) * size + x];
        const yDown = heightMap[((y + 1) % size) * size + x];

        const dx = (xRight - xLeft) * 2.5;
        const dy = (yDown - yUp) * 2.5;
        const dz = 1.0;

        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const nx = (dx / len) * 0.5 + 0.5;
        const ny = (-dy / len) * 0.5 + 0.5;
        const nz = (dz / len) * 0.5 + 0.5;

        const idx = (y * size + x) * 4;
        data[idx + 0] = Math.floor(nx * 255);
        data[idx + 1] = Math.floor(ny * 255);
        data[idx + 2] = Math.floor(nz * 255);
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  cache['stone_normal'] = tex;
  return tex;
}

export function getStoneRoughnessTexture(): THREE.CanvasTexture {
  if (cache['stone_roughness']) return cache['stone_roughness'];
  if (typeof document === 'undefined') return createEmptyTexture();

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let i = 0; i < size * size; i++) {
      const roughness = Math.floor(180 + (Math.random() - 0.5) * 40);
      const idx = i * 4;
      data[idx + 0] = roughness;
      data[idx + 1] = roughness;
      data[idx + 2] = roughness;
      data[idx + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  cache['stone_roughness'] = tex;
  return tex;
}

// 3. Damascus Steel Texture for Weapon Blades
export function getDamascusSteelTextures(): TextureSet {
  if (cache['damascus_normal']) {
    return {
      normalMap: cache['damascus_normal'],
      roughnessMap: cache['damascus_rough'],
    };
  }
  if (typeof document === 'undefined') return { map: createEmptyTexture() };

  const size = 512;
  const canvasNorm = document.createElement('canvas');
  const canvasRough = document.createElement('canvas');
  canvasNorm.width = size;
  canvasNorm.height = size;
  canvasRough.width = size;
  canvasRough.height = size;

  const ctxN = canvasNorm.getContext('2d');
  const ctxR = canvasRough.getContext('2d');

  if (ctxN && ctxR) {
    const imgDataN = ctxN.createImageData(size, size);
    const imgDataR = ctxR.createImageData(size, size);
    const dataN = imgDataN.data;
    const dataR = imgDataR.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const wave = Math.sin(y * 0.15 + Math.sin(x * 0.08) * 8.0) * 0.5 + 0.5;
        const micro = (Math.random() - 0.5) * 0.1;

        const nx = 0.5 + (Math.sin(x * 0.2) * 0.2 + micro) * 0.3;
        const ny = 0.5 + (wave - 0.5) * 0.4;
        const nz = 1.0;

        const idx = (y * size + x) * 4;
        dataN[idx + 0] = Math.floor(nx * 255);
        dataN[idx + 1] = Math.floor(ny * 255);
        dataN[idx + 2] = Math.floor(nz * 255);
        dataN[idx + 3] = 255;

        const rough = Math.floor(55 + wave * 45);
        dataR[idx + 0] = rough;
        dataR[idx + 1] = rough;
        dataR[idx + 2] = rough;
        dataR[idx + 3] = 255;
      }
    }

    ctxN.putImageData(imgDataN, 0, 0);
    ctxR.putImageData(imgDataR, 0, 0);
  }

  const texN = new THREE.CanvasTexture(canvasNorm);
  const texR = new THREE.CanvasTexture(canvasRough);
  texN.wrapS = texN.wrapT = THREE.RepeatWrapping;
  texR.wrapS = texR.wrapT = THREE.RepeatWrapping;

  cache['damascus_normal'] = texN;
  cache['damascus_rough'] = texR;

  return { normalMap: texN, roughnessMap: texR };
}

// 4. Stained Glass Rose Window Texture (Albedo & Emissive)
export function getRoseWindowTexture(): THREE.CanvasTexture {
  if (cache['rose_window']) return cache['rose_window'];
  if (typeof document === 'undefined') return createEmptyTexture();

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const cx = size / 2;
    const cy = size / 2;

    ctx.fillStyle = '#0c0c10';
    ctx.fillRect(0, 0, size, size);

    const petals = 12;
    const colors = ['#9b1c1c', '#d4973b', '#681313', '#ff4d6d', '#1d3557', '#e63946'];

    for (let r = 220; r > 30; r -= 40) {
      for (let i = 0; i < petals; i++) {
        const angle1 = (i / petals) * Math.PI * 2;
        const angle2 = ((i + 1) / petals) * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, angle1, angle2);
        ctx.closePath();

        ctx.fillStyle = colors[(i + Math.floor(r / 40)) % colors.length];
        ctx.fill();

        ctx.strokeStyle = '#121218';
        ctx.lineWidth = 6;
        ctx.stroke();
      }
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#0a0a0c';
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  cache['rose_window'] = tex;
  return tex;
}

// 5. Glowing Runic Emissive Mask
export function getRuneEmissiveTexture(): THREE.CanvasTexture {
  if (cache['rune_emissive']) return cache['rune_emissive'];
  if (typeof document === 'undefined') return createEmptyTexture();

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.font = 'bold 36px serif';
    ctx.fillStyle = '#ffb703';

    const runes = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛈᛇᛉᛋᛏᛒᛖᛗᛚᛜᛞᛟ';
    for (let i = 0; i < 32; i++) {
      const r = runes[i % runes.length];
      const rx = (i % 8) * 64 + 16;
      const ry = Math.floor(i / 8) * 128 + 48;
      ctx.fillText(r, rx, ry);
      ctx.strokeText(r, rx, ry);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  cache['rune_emissive'] = tex;
  return tex;
}
