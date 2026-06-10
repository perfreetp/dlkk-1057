import type { SonarResult } from '../../types/game';
import type { Entity } from '../../types/entities';
import { UPGRADES } from '../../data/upgrades';

export class SonarSystem {
  active: boolean;
  range: number;
  cooldown: number;
  currentCooldown: number;
  pingResults: SonarResult[];
  private accuracy: number;
  private pingAnimation: number;

  constructor(upgrades: Record<string, number>) {
    const sonarLevel = upgrades.sonar ?? 0;
    const effects = UPGRADES[4].effects[sonarLevel];
    
    this.range = effects.sonarRange ?? 200;
    this.accuracy = effects.sonarAccuracy ?? 1.0;
    this.cooldown = 3000 / this.accuracy;
    this.currentCooldown = 0;
    this.active = false;
    this.pingResults = [];
    this.pingAnimation = 0;
  }

  ping(
    entities: Entity[],
    submarineX: number,
    submarineY: number
  ): SonarResult[] {
    if (this.currentCooldown > 0 || !this.active) {
      return [];
    }

    this.currentCooldown = this.cooldown;
    this.pingAnimation = 1;
    this.pingResults = [];

    for (const entity of entities) {
      if (!entity.active) continue;

      const dx = entity.x - submarineX;
      const dy = entity.y - submarineY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= this.range) {
        const accuracyFactor = 0.7 + Math.random() * 0.3 * this.accuracy;
        const adjustedDistance = distance * accuracyFactor;

        let type: SonarResult['type'] = 'sample';
        if (entity.type === 'creature') type = 'creature';
        else if (entity.type === 'hazard') type = 'hazard';
        else if (entity.type === 'beacon') type = 'beacon';
        else if (entity.type === 'exit') type = 'exit';

        this.pingResults.push({
          type,
          x: entity.x + (Math.random() - 0.5) * (1 - this.accuracy) * 20,
          y: entity.y + (Math.random() - 0.5) * (1 - this.accuracy) * 20,
          distance: adjustedDistance,
          size: Math.max(entity.width, entity.height),
        });
      }
    }

    return this.pingResults;
  }

  update(deltaTime: number): void {
    if (this.currentCooldown > 0) {
      this.currentCooldown -= deltaTime * 1000;
    }
    if (this.pingAnimation > 0) {
      this.pingAnimation -= deltaTime * 2;
    }
  }

  getResults(): SonarResult[] {
    return this.pingResults;
  }

  getCooldownPercentage(): number {
    return Math.max(0, (this.currentCooldown / this.cooldown) * 100);
  }

  getPingAnimation(): number {
    return Math.max(0, this.pingAnimation);
  }

  toggle(): void {
    this.active = !this.active;
    if (!this.active) {
      this.pingResults = [];
    }
  }

  reset(): void {
    this.currentCooldown = 0;
    this.pingResults = [];
    this.pingAnimation = 0;
  }
}
