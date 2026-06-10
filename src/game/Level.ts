import type { Level as LevelConfig, EntitySpawnConfig } from '../data/levels';
import type { Objective, SonarResult } from '../types/game';
import type { SubmarineState } from '../types/entities';
import { SampleEntity } from './entities/SampleEntity';
import { CreatureEntity } from './entities/CreatureEntity';
import { HazardEntity } from './entities/HazardEntity';
import { ItemEntity } from './entities/ItemEntity';
import { PhysicsSystem } from './systems/PhysicsSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { LEVELS } from '../data/levels';

type GameEntity = SampleEntity | CreatureEntity | HazardEntity | ItemEntity;

export class Level {
  id: string;
  name: string;
  description: string;
  depth: number;
  timeLimit: number;
  currentTime: number;
  objectives: Objective[];
  background: {
    topColor: string;
    bottomColor: string;
    particleColor: string;
    ambientLight: number;
  };
  entities: GameEntity[];
  samples: SampleEntity[];
  creatures: CreatureEntity[];
  hazards: HazardEntity[];
  items: ItemEntity[];
  exitX: number;
  exitY: number;
  startX: number;
  startY: number;
  completed: boolean;
  failed: boolean;
  score: number;
  collectedSamples: string[];

  private levelConfig: LevelConfig;
  private worldBounds: { minX: number; maxX: number; minY: number; maxY: number };

  constructor(levelId: string) {
    const config = LEVELS.find(l => l.id === levelId);
    if (!config) {
      throw new Error(`Level not found: ${levelId}`);
    }

    this.levelConfig = config;
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.depth = config.depth;
    this.timeLimit = config.timeLimit;
    this.currentTime = 0;
    this.background = config.background;

    this.objectives = config.objectives.map(obj => ({
      id: obj.id,
      type: obj.type as Objective['type'],
      name: obj.name,
      description: obj.description,
      target: obj.target,
      currentCount: 0,
      reward: obj.reward,
      optional: obj.optional ?? false,
      targetId: obj.targetId,
      targetType: obj.targetType,
    }));

    this.entities = [];
    this.samples = [];
    this.creatures = [];
    this.hazards = [];
    this.items = [];

    this.startX = 0;
    this.startY = -50;
    this.exitX = 0;
    this.exitY = -50;

    this.worldBounds = {
      minX: -500,
      maxX: 1500,
      minY: -100,
      maxY: this.depth + 100,
    };

    this.completed = false;
    this.failed = false;
    this.score = 0;
    this.collectedSamples = [];

    this.spawnEntities();
  }

  private spawnEntities(): void {
    for (const spawnConfig of this.levelConfig.entities) {
      this.spawnEntity(spawnConfig);
    }

    this.exitX = 1200;
    this.exitY = -50;
  }

  private spawnEntity(config: EntitySpawnConfig): void {
    for (let i = 0; i < config.count; i++) {
      if (config.rarity !== undefined && Math.random() > config.rarity) {
        continue;
      }

      const x = this.randomRange(config.minDistance ?? 100, config.maxDistance ?? 800);
      const y = this.randomRange(config.minDepth ?? 10, config.maxDepth ?? this.depth);

      switch (config.type) {
        case 'sample':
          if (config.sampleId) {
            const sample = new SampleEntity(config.sampleId, x, y);
            this.samples.push(sample);
            this.entities.push(sample);
          }
          break;
        case 'creature':
          const creature = new CreatureEntity(x, y, {
            hostile: config.hostile,
            damage: config.damage,
            speed: config.speed,
            aiType: config.hostile ? 'aggressive' : 'patrol',
          });
          this.creatures.push(creature);
          this.entities.push(creature);
          break;
        case 'obstacle':
          const obstacle = new HazardEntity(x, y, 'sharp', {
            damage: config.damage,
          });
          this.hazards.push(obstacle);
          this.entities.push(obstacle);
          break;
        case 'current':
          const current = new HazardEntity(x, y, 'current', {
            damage: config.damage,
          });
          this.hazards.push(current);
          this.entities.push(current);
          break;
        case 'thermal':
          const thermal = new HazardEntity(x, y, 'thermal', {
            damage: config.damage,
          });
          this.hazards.push(thermal);
          this.entities.push(thermal);
          break;
        case 'beacon':
          const beacon = new ItemEntity(x, y, 'beacon');
          this.items.push(beacon);
          this.entities.push(beacon);
          break;
      }
    }
  }

  private randomRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  update(deltaTime: number, submarine: SubmarineState): {
    collisions: {
      hazardDamages: number;
      creatureAttacks: number;
      collectedSamples: string[];
      collectedItems: Array<{ type: string; value: number }>;
    };
    pushForces: Array<{ x: number; y: number }>;
  } {
    this.currentTime += deltaTime;

    if (this.currentTime >= this.timeLimit) {
      this.failed = true;
    }

    const hazardDamages = 0;
    const creatureAttacks = 0;
    const collectedSamples: string[] = [];
    const collectedItems: Array<{ type: string; value: number }> = [];
    const pushForces: Array<{ x: number; y: number }> = [];

    for (const sample of this.samples) {
      sample.update(deltaTime);
    }

    for (const creature of this.creatures) {
      creature.update(deltaTime, submarine);

      if (creature.canAttack(submarine) && creature.hostile) {
        const collision = CollisionSystem.checkSubmarineWithEntity(submarine, creature);
        if (collision) {
          this.score += 0;
        }
      }
    }

    for (const hazard of this.hazards) {
      const result = hazard.update(deltaTime, submarine);
      if (result.pushForce) {
        pushForces.push(result.pushForce);
      }

      const hazardResult = CollisionSystem.checkSubmarineWithHazard(submarine, hazard);
      if (hazardResult.collided && hazard.canDamage()) {
        hazard.triggerDamage();
      }
    }

    for (const item of this.items) {
      item.update(deltaTime);
    }

    this.checkObjectives(submarine);

    return {
      collisions: {
        hazardDamages,
        creatureAttacks,
        collectedSamples,
        collectedItems,
      },
      pushForces,
    };
  }

  checkCollisions(
    submarine: SubmarineState,
    armRange: number
  ): {
    hazardDamage: number;
    creatureDamage: number;
    collectableSample: SampleEntity | null;
    collectableItem: ItemEntity | null;
    nearExit: boolean;
  } {
    let hazardDamage = 0;
    let creatureDamage = 0;
    let collectableSample: SampleEntity | null = null;
    let collectableItem: ItemEntity | null = null;

    for (const hazard of this.hazards) {
      const result = CollisionSystem.checkSubmarineWithHazard(submarine, hazard);
      if (result.collided && hazard.canDamage()) {
        hazardDamage += result.damage;
        hazard.triggerDamage();
      }
    }

    for (const creature of this.creatures) {
      if (creature.hostile && creature.canAttack(submarine)) {
        const collision = CollisionSystem.checkSubmarineWithEntity(submarine, creature);
        if (collision) {
          creatureDamage += creature.damage;
        }
      }
    }

    for (const sample of this.samples) {
      if (CollisionSystem.checkArmWithSample(submarine, sample, armRange)) {
        collectableSample = sample;
        break;
      }
    }

    for (const item of this.items) {
      if (CollisionSystem.checkArmWithItem(submarine, item, armRange)) {
        collectableItem = item;
        break;
      }
    }

    const nearExit = CollisionSystem.checkNearExit(submarine, this.exitX, this.exitY, 80);

    return {
      hazardDamage,
      creatureDamage,
      collectableSample,
      collectableItem,
      nearExit,
    };
  }

  collectSample(sample: SampleEntity): boolean {
    if (sample.collect()) {
      this.collectedSamples.push(sample.id);
      this.score += sample.points;

      for (const obj of this.objectives) {
        if (obj.type === 'collect' && obj.currentCount < obj.target) {
          obj.currentCount++;
        } else if (obj.type === 'collectType') {
          const config = this.levelConfig.objectives.find(o => o.id === obj.id);
          if (config && 'targetType' in config && config.targetType === sample.sampleType) {
            if (obj.currentCount < obj.target) {
              obj.currentCount++;
            }
          }
        }
      }

      return true;
    }
    return false;
  }

  collectItem(item: ItemEntity): { type: string; value: number } | null {
    const result = item.collect();
    if (result) {
      this.score += item.value;

      for (const obj of this.objectives) {
        if (obj.type === 'find' && item.itemType === 'beacon') {
          obj.currentCount = Math.min(obj.currentCount + 1, obj.target);
        }
      }

      return result;
    }
    return null;
  }

  private checkObjectives(submarine: SubmarineState): void {
    for (const obj of this.objectives) {
      if (obj.currentCount >= obj.target) continue;

      const config = this.levelConfig.objectives.find(o => o.id === obj.id);
      if (!config) continue;

      switch (obj.type) {
        case 'reachPoint':
          if ('targetType' in config === false) {
            if (submarine.depth >= obj.target) {
              obj.currentCount = obj.target;
            }
          }
          break;
        case 'survive':
          obj.currentCount = Math.floor(this.currentTime);
          break;
        case 'evacuate':
        case 'timedReturn':
          if (CollisionSystem.checkNearExit(submarine, this.exitX, this.exitY, 80)) {
            obj.currentCount = obj.target;
          }
          break;
      }
    }

    const allRequiredComplete = this.objectives
      .filter(o => !o.optional)
      .every(o => o.currentCount >= o.target);

    if (allRequiredComplete) {
      this.completed = true;
    }
  }

  pingSonar(submarineX: number, submarineY: number, range: number): SonarResult[] {
    const results: SonarResult[] = [];
    const allEntities = [...this.samples, ...this.creatures, ...this.hazards, ...this.items];

    for (const entity of allEntities) {
      if (!entity.active) continue;

      const dx = entity.x - submarineX;
      const dy = entity.y - submarineY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= range) {
        let type: SonarResult['type'] = 'sample';
        if (entity instanceof CreatureEntity) type = 'creature';
        else if (entity instanceof HazardEntity) type = 'hazard';
        else if (entity instanceof ItemEntity && entity.itemType === 'beacon') type = 'beacon';

        results.push({
          type,
          x: entity.x + entity.width / 2,
          y: entity.y + entity.height / 2,
          distance,
          size: Math.max(entity.width, entity.height),
        });
      }
    }

    const exitDistance = PhysicsSystem.calculateDistance(submarineX, submarineY, this.exitX, this.exitY);
    if (exitDistance <= range) {
      results.push({
        type: 'exit',
        x: this.exitX,
        y: this.exitY,
        distance: exitDistance,
        size: 40,
      });
    }

    return results;
  }

  getRemainingTime(): number {
    return Math.max(0, this.timeLimit - this.currentTime);
  }

  getCompletedObjectives(): Objective[] {
    return this.objectives.filter(o => o.currentCount >= o.target);
  }

  getWorldBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
    return { ...this.worldBounds };
  }

  calculateFinalScore(): number {
    let finalScore = this.score;

    for (const obj of this.objectives) {
      if (obj.currentCount >= obj.target) {
        finalScore += obj.reward;
      }
    }

    const timeBonus = Math.floor(this.getRemainingTime() * 0.5);
    finalScore += timeBonus;

    return finalScore;
  }

  reset(): void {
    this.currentTime = 0;
    this.completed = false;
    this.failed = false;
    this.score = 0;
    this.collectedSamples = [];

    for (const obj of this.objectives) {
      obj.currentCount = 0;
    }

    for (const entity of this.entities) {
      entity.reset();
    }
  }
}
