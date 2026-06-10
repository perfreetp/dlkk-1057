export interface Entity {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

export interface Sample extends Entity {
  sampleType: 'creature' | 'mineral' | 'debris' | 'artifact';
  name: string;
  rarity: 1 | 2 | 3 | 4 | 5;
  points: number;
  description: string;
  collected: boolean;
  glowColor: string;
}

export interface Creature extends Entity {
  name: string;
  hostile: boolean;
  damage: number;
  speed: number;
  glowColor: string;
  aiType: 'passive' | 'aggressive' | 'patrol';
}

export interface Hazard extends Entity {
  hazardType: 'current' | 'thermal' | 'pressure' | 'sharp' | 'creature';
  damage: number;
  radius: number;
}

export interface Item extends Entity {
  itemType: 'oxygen' | 'battery' | 'repair' | 'log' | 'beacon';
  value: number;
  collected: boolean;
}

export interface MapMarker {
  id: string;
  x: number;
  y: number;
  type: 'sample' | 'danger' | 'interest' | 'exit';
  label: string;
  color: string;
}

export interface SubmarineState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  oxygen: number;
  maxOxygen: number;
  battery: number;
  maxBattery: number;
  hull: number;
  maxHull: number;
  depth: number;
  lightOn: boolean;
  sonarActive: boolean;
  armExtended: 0 | 1;
  samples: string[];
  maxSamples: number;
  upgrades: Record<string, number>;
}
