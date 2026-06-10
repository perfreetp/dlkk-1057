import type { Creature, SubmarineState } from '../../types/entities';
import type { Vector2 } from '../../types/game';
import { PhysicsSystem } from '../systems/PhysicsSystem';

export class CreatureEntity implements Creature {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;

  name: string;
  hostile: boolean;
  damage: number;
  speed: number;
  glowColor: string;
  aiType: 'passive' | 'aggressive' | 'patrol';

  private velocity: Vector2;
  private patrolPoints: Vector2[];
  private currentPatrolIndex: number;
  private aiTimer: number;
  private aiState: 'idle' | 'moving' | 'chasing' | 'fleeing';
  private detectionRange: number;
  private attackRange: number;
  private targetX: number;
  private targetY: number;
  private wiggleOffset: number;
  private wiggleSpeed: number;

  constructor(
    x: number,
    y: number,
    options: {
      hostile?: boolean;
      damage?: number;
      speed?: number;
      aiType?: 'passive' | 'aggressive' | 'patrol';
      name?: string;
      glowColor?: string;
      id?: string;
    } = {}
  ) {
    this.id = options.id ?? `creature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = 'creature';
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.active = true;

    this.name = options.name ?? (options.hostile ? '深海掠食者' : '深海生物');
    this.hostile = options.hostile ?? false;
    this.damage = options.damage ?? (this.hostile ? 15 : 0);
    this.speed = options.speed ?? 1;
    this.glowColor = options.glowColor ?? (this.hostile ? '#FF4500' : '#00BFFF');
    this.aiType = options.aiType ?? (this.hostile ? 'aggressive' : 'passive');

    this.velocity = { x: 0, y: 0 };
    this.patrolPoints = this.generatePatrolPoints(x, y);
    this.currentPatrolIndex = 0;
    this.aiTimer = 0;
    this.aiState = 'idle';
    this.detectionRange = this.hostile ? 150 : 80;
    this.attackRange = 40;
    this.targetX = x;
    this.targetY = y;
    this.wiggleOffset = Math.random() * Math.PI * 2;
    this.wiggleSpeed = 2 + Math.random() * 2;
  }

  private generatePatrolPoints(centerX: number, centerY: number): Vector2[] {
    const points: Vector2[] = [];
    const count = 3 + Math.floor(Math.random() * 3);
    const radius = 100 + Math.random() * 100;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius * 0.5,
      });
    }
    return points;
  }

  update(deltaTime: number, submarine?: SubmarineState): void {
    if (!this.active) return;

    this.wiggleOffset += deltaTime * this.wiggleSpeed;
    this.aiTimer -= deltaTime;

    if (submarine) {
      this.updateAI(deltaTime, submarine);
    } else {
      this.updateIdleMovement(deltaTime);
    }

    this.x += this.velocity.x * deltaTime * 60;
    this.y += this.velocity.y * deltaTime * 60;
  }

  private updateAI(deltaTime: number, submarine: SubmarineState): void {
    const distance = PhysicsSystem.calculateDistance(
      this.x,
      this.y,
      submarine.x,
      submarine.y
    );

    switch (this.aiType) {
      case 'passive':
        this.updatePassiveAI(deltaTime, submarine, distance);
        break;
      case 'aggressive':
        this.updateAggressiveAI(deltaTime, submarine, distance);
        break;
      case 'patrol':
        this.updatePatrolAI(deltaTime, submarine, distance);
        break;
    }
  }

  private updatePassiveAI(
    deltaTime: number,
    submarine: SubmarineState,
    distance: number
  ): void {
    if (distance < this.detectionRange) {
      this.aiState = 'fleeing';
      const angle = PhysicsSystem.angleTo(submarine.x, submarine.y, this.x, this.y);
      this.targetX = this.x + Math.cos(angle) * 200;
      this.targetY = this.y + Math.sin(angle) * 200;
    } else if (this.aiState === 'fleeing' && distance > this.detectionRange * 1.5) {
      this.aiState = 'idle';
    }

    if (this.aiState === 'idle' && this.aiTimer <= 0) {
      this.targetX = this.x + (Math.random() - 0.5) * 200;
      this.targetY = this.y + (Math.random() - 0.5) * 200;
      this.aiTimer = 2 + Math.random() * 3;
      this.aiState = 'moving';
    }

    this.moveTowardsTarget(deltaTime, this.aiState === 'fleeing' ? this.speed * 1.5 : this.speed * 0.5);
  }

  private updateAggressiveAI(
    deltaTime: number,
    submarine: SubmarineState,
    distance: number
  ): void {
    if (distance < this.detectionRange) {
      this.aiState = 'chasing';
      this.targetX = submarine.x;
      this.targetY = submarine.y;
    } else if (this.aiState === 'chasing' && distance > this.detectionRange * 1.5) {
      this.aiState = 'idle';
    }

    if (this.aiState === 'chasing') {
      this.moveTowardsTarget(deltaTime, this.speed);
    } else {
      this.updateIdleMovement(deltaTime);
    }
  }

  private updatePatrolAI(
    deltaTime: number,
    submarine: SubmarineState,
    distance: number
  ): void {
    if (this.hostile && distance < this.detectionRange) {
      this.aiState = 'chasing';
      this.targetX = submarine.x;
      this.targetY = submarine.y;
    } else {
      const patrolPoint = this.patrolPoints[this.currentPatrolIndex];
      const patrolDistance = PhysicsSystem.calculateDistance(
        this.x,
        this.y,
        patrolPoint.x,
        patrolPoint.y
      );

      if (patrolDistance < 20) {
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
      }

      this.targetX = this.patrolPoints[this.currentPatrolIndex].x;
      this.targetY = this.patrolPoints[this.currentPatrolIndex].y;
      this.aiState = 'moving';
    }

    this.moveTowardsTarget(deltaTime, this.speed * 0.7);
  }

  private updateIdleMovement(deltaTime: number): void {
    if (this.aiTimer <= 0) {
      this.targetX = this.x + (Math.random() - 0.5) * 100;
      this.targetY = this.y + (Math.random() - 0.5) * 100;
      this.aiTimer = 3 + Math.random() * 4;
    }
    this.moveTowardsTarget(deltaTime, this.speed * 0.3);
  }

  private moveTowardsTarget(deltaTime: number, speed: number): void {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      const wiggle = Math.sin(this.wiggleOffset) * 0.3;
      const angle = Math.atan2(dy, dx) + wiggle;
      this.velocity.x = Math.cos(angle) * speed;
      this.velocity.y = Math.sin(angle) * speed;
    } else {
      this.velocity.x *= 0.9;
      this.velocity.y *= 0.9;
    }

    this.velocity = PhysicsSystem.applyFriction(this.velocity, 0.02, deltaTime);
  }

  canAttack(submarine: SubmarineState): boolean {
    if (!this.hostile || !this.active) return false;
    const distance = PhysicsSystem.calculateDistance(
      this.x,
      this.y,
      submarine.x,
      submarine.y
    );
    return distance < this.attackRange;
  }

  getWiggle(): number {
    return Math.sin(this.wiggleOffset) * 5;
  }

  getAIState(): string {
    return this.aiState;
  }

  reset(): void {
    this.active = true;
    this.aiState = 'idle';
    this.aiTimer = 0;
    this.currentPatrolIndex = 0;
    this.velocity = { x: 0, y: 0 };
  }
}
