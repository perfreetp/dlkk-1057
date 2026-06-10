import type { Sample } from '../../types/entities';
import type { Sample as SampleData } from '../../data/samples';
import { SAMPLES } from '../../data/samples';

export class SampleEntity implements Sample {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;

  sampleType: 'creature' | 'mineral' | 'debris' | 'artifact';
  name: string;
  rarity: 1 | 2 | 3 | 4 | 5;
  points: number;
  description: string;
  collected: boolean;
  glowColor: string;

  private floatOffset: number;
  private floatSpeed: number;
  private baseY: number;

  constructor(
    sampleId: string,
    x: number,
    y: number,
    id?: string
  ) {
    const sampleData = SAMPLES.find(s => s.id === sampleId);
    if (!sampleData) {
      throw new Error(`Sample not found: ${sampleId}`);
    }

    this.id = id ?? `sample_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = 'sample';
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.width = 20;
    this.height = 20;
    this.active = true;

    this.sampleType = sampleData.type;
    this.name = sampleData.name;
    this.rarity = sampleData.rarity;
    this.points = sampleData.points;
    this.description = sampleData.description;
    this.glowColor = sampleData.glowColor;
    this.collected = false;

    this.floatOffset = Math.random() * Math.PI * 2;
    this.floatSpeed = 0.5 + Math.random() * 0.5;
  }

  update(deltaTime: number): void {
    if (!this.active || this.collected) return;

    this.floatOffset += deltaTime * this.floatSpeed;
    this.y = this.baseY + Math.sin(this.floatOffset) * 3;
  }

  collect(): boolean {
    if (this.collected || !this.active) return false;
    this.collected = true;
    this.active = false;
    return true;
  }

  getGlowIntensity(): number {
    return 0.3 + Math.sin(this.floatOffset * 2) * 0.2;
  }

  getSizeByRarity(): number {
    return 15 + this.rarity * 3;
  }

  toData(): SampleData {
    return {
      id: this.id,
      name: this.name,
      type: this.sampleType,
      rarity: this.rarity,
      points: this.points,
      description: this.description,
      glowColor: this.glowColor,
    };
  }

  reset(): void {
    this.collected = false;
    this.active = true;
    this.y = this.baseY;
    this.floatOffset = Math.random() * Math.PI * 2;
  }
}
