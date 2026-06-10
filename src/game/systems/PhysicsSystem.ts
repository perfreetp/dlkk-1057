import type { Vector2 } from '../../types/game';
import type { Entity } from '../../types/entities';

export class PhysicsSystem {
  static applyFriction(
    velocity: Vector2,
    friction: number,
    deltaTime: number
  ): Vector2 {
    const decay = Math.pow(1 - friction, deltaTime * 60);
    return {
      x: velocity.x * decay,
      y: velocity.y * decay,
    };
  }

  static clampSpeed(velocity: Vector2, maxSpeed: number): Vector2 {
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    if (speed > maxSpeed) {
      const ratio = maxSpeed / speed;
      return {
        x: velocity.x * ratio,
        y: velocity.y * ratio,
      };
    }
    return velocity;
  }

  static calculateDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static checkCollision(entity1: Entity, entity2: Entity): boolean {
    return (
      entity1.x < entity2.x + entity2.width &&
      entity1.x + entity1.width > entity2.x &&
      entity1.y < entity2.y + entity2.height &&
      entity1.y + entity1.height > entity2.y
    );
  }

  static checkCircleCollision(
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
  }

  static normalize(velocity: Vector2): Vector2 {
    const length = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    if (length === 0) return { x: 0, y: 0 };
    return {
      x: velocity.x / length,
      y: velocity.y / length,
    };
  }

  static add(velocity1: Vector2, velocity2: Vector2): Vector2 {
    return {
      x: velocity1.x + velocity2.x,
      y: velocity1.y + velocity2.y,
    };
  }

  static multiply(velocity: Vector2, scalar: number): Vector2 {
    return {
      x: velocity.x * scalar,
      y: velocity.y * scalar,
    };
  }

  static length(velocity: Vector2): number {
    return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  }

  static angleTo(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  static moveTowards(
    current: Vector2,
    target: Vector2,
    maxDistance: number
  ): Vector2 {
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= maxDistance) {
      return { ...target };
    }

    const ratio = maxDistance / distance;
    return {
      x: current.x + dx * ratio,
      y: current.y + dy * ratio,
    };
  }

  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
