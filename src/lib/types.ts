export type ChamberId = 'reliquary' | 'crypt' | 'chronicle' | 'forge' | 'covenant';

export type ElementType = 'blood' | 'frost' | 'ember';

export interface WeaponData {
  id: string;
  name: string;
  subname: string;
  type: string;
  lore: string;
  damage: number;
  scaling: string;
  weight: string;
  ability: string;
  element: ElementType;
  quote: string;
  stats: {
    physical: number;
    magic: number;
    bleed: number;
    stagger: number;
  };
}

export interface RelicData {
  id: string;
  name: string;
  era: string;
  title: string;
  description: string;
  curse: string;
  purity: number;
  origin: string;
  rarity: 'Mythic' | 'Corrupted' | 'Forbidden' | 'Abyssal';
  color: string;
}

export interface LoreEntry {
  id: string;
  era: string;
  title: string;
  runicTitle: string;
  excerpt: string;
  fullText: string;
  scriptureRef: string;
  year: string;
}

export interface CovenantPass {
  initiateName: string;
  order: string;
  rank: string;
  oathTimestamp: number;
  sealId: string;
}
