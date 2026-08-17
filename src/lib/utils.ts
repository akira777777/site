import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function lerp(start: number, end: number, t: number) {
  return start * (1 - t) + end * t;
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

export const RUNES_CHARSET = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛈᛇᛉᛋᛏᛒᛖᛗᛚᛜᛞᛟ⚔✝☠▲✦✧◈☩';

export function getRandomRune(): string {
  return RUNES_CHARSET[Math.floor(Math.random() * RUNES_CHARSET.length)];
}

export function formatRunicTimestamp(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `ANO.${y}.${m}.${d} // T-${h}:${min}::ABYSS`;
}
