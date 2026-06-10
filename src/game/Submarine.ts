import type { InputState, Vector2 } from '../types/game';
import type { SubmarineState } from '../types/entities';
import { ResourceSystem } from './systems/ResourceSystem';
import { SonarSystem } from './systems/SonarSystem';
import { PhysicsSystem } from './systems/PhysicsSystem';
import { UPGRADES } from '../data/upgrades';

export class Submarine implements SubmarineState {
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

  resources: ResourceSystem;
  sonar: SonarSystem;

  private velocity: Vector2;
  private maxSpeed: number;
  private acceleration: number;
  private friction: number;
  private armRange: number;
  private armSpeed: number;
  private armAnimation: number;
  private bubbleTimer: number;
  private damageFlash: number;

  constructor(
    x: number,
    y: number,
    upgrades: Record<string, number>
  ) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.depth = Math.abs(y);
    this.lightOn = true;
    this.sonarActive = false;
    this.armExtended = 0;
    this.samples = [];
    this.maxSamples = 10;
    this.upgrades = upgrades;

    this.resources = new ResourceSystem(upgrades);
    this.sonar = new SonarSystem(upgrades);

    this.oxygen = this.resources.oxygen;
    this.maxOxygen = this.resources.maxOxygen;
    this.battery = this.resources.battery;
    this.maxBattery = this.resources.maxBattery;
    this.hull = this.resources.hull;
    this.maxHull = this.resources.maxHull;

    const engineLevel = upgrades.engine ?? 0;
    const armLevel = upgrades.mechanicalArm ?? 0;

    this.maxSpeed = (UPGRADES[0].effects[engineLevel].speed ?? 1) * 2;
    this.acceleration = 0.15 * (UPGRADES[0].effects[engineLevel].speed ?? 1);
    this.friction = 0.02;
    this.armRange = UPGRADES[3].effects[armLevel].armRange ?? 50;
    this.armSpeed = UPGRADES[3].effects[armLevel].armSpeed ?? 1;

    this.velocity = { x: 0, y: 0 };
    this.armAnimation = 0;
    this.bubbleTimer = 0;
    this.damageFlash = 0;
  }

  update(input: InputState, deltaTime: number): { shouldCreateBubble: boolean } {
    let shouldCreateBubble = false;

    if (input.up) {
      this.velocity.y -= this.acceleration;
      shouldCreateBubble = Math.random() < 0.3;
    }
    if (input.down) {
      this.velocity.y += this.acceleration * 0.5;
    }
    if (input.left) {
      this.velocity.x -= this.acceleration;
      this.angle = -0.2;
    }
    if (input.right) {
      this.velocity.x += this.acceleration;
      this.angle = 0.2;
    }

    if (!input.left && !input.right) {
      this.angle = PhysicsSystem.lerp(this.angle, 0, deltaTime * 5);
    }

    this.velocity = PhysicsSystem.applyFriction(this.velocity, this.friction, deltaTime);
    this.velocity = PhysicsSystem.clampSpeed(this.velocity, this.maxSpeed);

    this.x += this.velocity.x * deltaTime * 60;
    this.y += this.velocity.y * deltaTime * 60;

    this.vx = this.velocity.x;
    this.vy = this.velocity.y;
    this.depth = Math.max(0, this.y);

    this.resources.update(deltaTime, this.lightOn, this.sonarActive);
    this.sonar.update(deltaTime);

    this.oxygen = this.resources.oxygen;
    this.battery = this.resources.battery;
    this.hull = this.resources.hull;

    if (this.armExtended === 1) {
      this.armAnimation = Math.min(1, this.armAnimation + deltaTime * this.armSpeed);
    } else {
      this.armAnimation = Math.max(0, this.armAnimation - deltaTime * this.armSpeed);
    }

    if (this.damageFlash > 0) {
      this.damageFlash -= deltaTime * 3;
    }

    this.bubbleTimer += deltaTime;
    if (this.bubbleTimer > 0.5) {
      this.bubbleTimer = 0;
      shouldCreateBubble = true;
    }

    return { shouldCreateBubble };
  }

  extendArm(): boolean {
    if (this.armExtended === 0) {
      this.armExtended = 1;
      return true;
    }
    return false;
  }

  retractArm(): boolean {
    if (this.armExtended === 1) {
      this.armExtended = 0;
      return true;
    }
    return false;
  }

  toggleArm(): boolean {
    if (this.armExtended === 0) {
      return this.extendArm();
    } else {
      return this.retractArm();
    }
  }

  toggleLight(): boolean {
    if (this.battery > 0) {
      this.lightOn = !this.lightOn;
      return true;
    }
    return false;
  }

  toggleSonar(): boolean {
    if (this.battery > 5) {
      this.sonarActive = !this.sonarActive;
      this.sonar.toggle();
      return true;
    }
    return false;
  }

  repair(): boolean {
    if (this.battery < 10 || this.hull >= this.maxHull) return false;
    const repairAmount = Math.min(10, this.maxHull - this.hull);
    this.resources.repairHull(repairAmount);
    this.resources.consumeBattery(10);
    this.hull = this.resources.hull;
    this.battery = this.resources.battery;
    return true;
  }

  takeDamage(amount: number): boolean {
    const result = this.resources.takeDamage(amount);
    if (result) {
      this.hull = this.resources.hull;
      this.damageFlash = 1;
    }
    return result;
  }

  addSample(sampleId: string): boolean {
    if (this.samples.length < this.maxSamples) {
      this.samples.push(sampleId);
      return true;
    }
    return false;
  }

  getArmRange(): number {
    return this.armRange * this.armAnimation;
  }

  getArmAnimation(): number {
    return this.armAnimation;
  }

  getDamageFlash(): number {
    return Math.max(0, this.damageFlash);
  }

  applyForce(force: Vector2): void {
    this.velocity.x += force.x;
    this.velocity.y += force.y;
  }

  isCrippled(): boolean {
    return this.resources.isDepleted();
  }

  getSpeed(): number {
    return PhysicsSystem.length(this.velocity);
  }

  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.velocity = { x: 0, y: 0 };
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.depth = 0;
    this.lightOn = true;
    this.sonarActive = false;
    this.armExtended = 0;
    this.armAnimation = 0;
    this.damageFlash = 0;
    this.samples = [];
    this.resources.reset();
    this.sonar.reset();
    this.oxygen = this.resources.oxygen;
    this.battery = this.resources.battery;
    this.hull = this.resources.hull;
  }

  toState(): SubmarineState {
    return {
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      angle: this.angle,
      oxygen: this.oxygen,
      maxOxygen: this.maxOxygen,
      battery: this.battery,
      maxBattery: this.maxBattery,
      hull: this.hull,
      maxHull: this.maxHull,
      depth: this.depth,
      lightOn: this.lightOn,
      sonarActive: this.sonarActive,
      armExtended: this.armExtended,
      samples: [...this.samples],
      maxSamples: this.maxSamples,
      upgrades: { ...this.upgrades },
    };
  }
}
