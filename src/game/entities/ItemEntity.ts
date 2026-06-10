import type { Item } from '../../types/entities';
import { PhysicsSystem } from '../systems/PhysicsSystem';

export class ItemEntity implements Item {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;

  itemType: 'oxygen' | 'battery' | 'repair' | 'log' | 'beacon';
  value: number;
  collected: boolean;

  private floatOffset: number;
  private floatSpeed: number;
  private baseY: number;
  private rotation: number;
  private rotationSpeed: number;

  constructor(
    x: number,
    y: number,
    itemType: 'oxygen' | 'battery' | 'repair' | 'log' | 'beacon',
    options: {
      value?: number;
      id?: string;
    } = {}
  ) {
    this.id = options.id ?? `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = 'item';
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.active = true;

    this.itemType = itemType;
    this.collected = false;

    switch (itemType) {
      case 'oxygen':
        this.value = options.value ?? 30;
        this.width = 20;
        this.height = 25;
        break;
      case 'battery':
        this.value = options.value ?? 25;
        this.width = 18;
        this.height = 22;
        break;
      case 'repair':
        this.value = options.value ?? 20;
        this.width = 22;
        this.height = 20;
        break;
      case 'log':
        this.value = options.value ?? 50;
        this.width = 25;
        this.height = 18;
        break;
      case 'beacon':
        this.value = options.value ?? 100;
        this.width = 24;
        this.height = 30;
        break;
      default:
        this.value = options.value ?? 10;
        this.width = 20;
        this.height = 20;
    }

    this.floatOffset = Math.random() * Math.PI * 2;
    this.floatSpeed = 0.8 + Math.random() * 0.4;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 2;
  }

  update(deltaTime: number): void {
    if (!this.active || this.collected) return;

    this.floatOffset += deltaTime * this.floatSpeed;
    this.y = this.baseY + Math.sin(this.floatOffset) * 4;
    this.rotation += deltaTime * this.rotationSpeed;
  }

  collect(): { type: string; value: number } | null {
    if (this.collected || !this.active) return null;
    this.collected = true;
    this.active = false;
    return {
      type: this.itemType,
      value: this.value,
    };
  }

  getItemColor(): string {
    switch (this.itemType) {
      case 'oxygen':
        return '#00BFFF';
      case 'battery':
        return '#FFD700';
      case 'repair':
        return '#32CD32';
      case 'log':
        return '#DEB887';
      case 'beacon':
        return '#FF6347';
      default:
        return '#FFFFFF';
    }
  }

  getGlowIntensity(): number {
    if (this.itemType === 'beacon') {
      return 0.6 + Math.sin(this.floatOffset * 3) * 0.4;
    }
    return 0.3 + Math.sin(this.floatOffset * 2) * 0.2;
  }

  getRotation(): number {
    return this.rotation;
  }

  isNearby(submarineX: number, submarineY: number, range: number = 50): boolean {
    if (!this.active || this.collected) return false;
    const distance = PhysicsSystem.calculateDistance(
      this.x + this.width / 2,
      this.y + this.height / 2,
      submarineX,
      submarineY
    );
    return distance <= range;
  }

  reset(): void {
    this.collected = false;
    this.active = true;
    this.y = this.baseY;
    this.floatOffset = Math.random() * Math.PI * 2;
    this.rotation = Math.random() * Math.PI * 2;
  }
}
