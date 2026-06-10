import type { Hazard, SubmarineState } from '../../types/entities';
import { PhysicsSystem } from '../systems/PhysicsSystem';

export class HazardEntity implements Hazard {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;

  hazardType: 'current' | 'thermal' | 'pressure' | 'sharp' | 'creature';
  damage: number;
  radius: number;

  private animationTime: number;
  private pulseSpeed: number;
  private baseRadius: number;
  private direction: { x: number; y: number };
  private currentStrength: number;
  private damageCooldown: number;

  constructor(
    x: number,
    y: number,
    hazardType: 'current' | 'thermal' | 'pressure' | 'sharp' | 'creature',
    options: {
      damage?: number;
      radius?: number;
      width?: number;
      height?: number;
      id?: string;
    } = {}
  ) {
    this.id = options.id ?? `hazard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = 'hazard';
    this.x = x;
    this.y = y;
    this.active = true;

    this.hazardType = hazardType;
    this.damage = options.damage ?? 10;
    this.radius = options.radius ?? 50;
    this.baseRadius = this.radius;

    switch (hazardType) {
      case 'current':
        this.width = options.width ?? 80;
        this.height = options.height ?? 80;
        this.damage = options.damage ?? 5;
        break;
      case 'thermal':
        this.width = options.width ?? 60;
        this.height = options.height ?? 60;
        this.damage = options.damage ?? 15;
        break;
      case 'pressure':
        this.width = options.width ?? 100;
        this.height = options.height ?? 100;
        this.damage = options.damage ?? 8;
        break;
      case 'sharp':
        this.width = options.width ?? 40;
        this.height = options.height ?? 40;
        this.damage = options.damage ?? 20;
        this.radius = 25;
        this.baseRadius = 25;
        break;
      case 'creature':
        this.width = options.width ?? 50;
        this.height = options.height ?? 50;
        this.damage = options.damage ?? 25;
        break;
      default:
        this.width = options.width ?? 50;
        this.height = options.height ?? 50;
    }

    this.animationTime = Math.random() * Math.PI * 2;
    this.pulseSpeed = 1 + Math.random();
    this.direction = {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
    };
    this.currentStrength = hazardType === 'current' ? 2 : 0;
    this.damageCooldown = 0;
  }

  update(deltaTime: number, submarine?: SubmarineState): { pushForce?: { x: number; y: number } } {
    if (!this.active) return {};

    this.animationTime += deltaTime * this.pulseSpeed;
    this.radius = this.baseRadius + Math.sin(this.animationTime) * 5;

    if (this.damageCooldown > 0) {
      this.damageCooldown -= deltaTime * 1000;
    }

    if (this.hazardType === 'current' && submarine) {
      const distance = PhysicsSystem.calculateDistance(
        this.x,
        this.y,
        submarine.x,
        submarine.y
      );

      if (distance < this.radius * 1.5) {
        const force = (1 - distance / (this.radius * 1.5)) * this.currentStrength;
        return {
          pushForce: {
            x: this.direction.x * force,
            y: this.direction.y * force,
          },
        };
      }
    }

    return {};
  }

  canDamage(): boolean {
    return this.active && this.damageCooldown <= 0;
  }

  triggerDamage(): void {
    this.damageCooldown = 500;
  }

  getPulseIntensity(): number {
    return 0.5 + Math.sin(this.animationTime) * 0.3;
  }

  getHazardColor(): string {
    switch (this.hazardType) {
      case 'current':
        return '#4169E1';
      case 'thermal':
        return '#FF4500';
      case 'pressure':
        return '#9932CC';
      case 'sharp':
        return '#808080';
      case 'creature':
        return '#DC143C';
      default:
        return '#FF0000';
    }
  }

  isInside(submarine: SubmarineState): boolean {
    const distance = PhysicsSystem.calculateDistance(
      this.x,
      this.y,
      submarine.x,
      submarine.y
    );
    return distance < this.radius;
  }

  reset(): void {
    this.active = true;
    this.damageCooldown = 0;
    this.animationTime = Math.random() * Math.PI * 2;
  }
}
