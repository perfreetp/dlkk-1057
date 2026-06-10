import type { Entity, Hazard, Sample, Item, SubmarineState } from '../../types/entities';
import { PhysicsSystem } from './PhysicsSystem';

export class CollisionSystem {
  static checkSubmarineWithEntity(
    submarine: SubmarineState,
    entity: Entity,
    submarineWidth: number = 40,
    submarineHeight: number = 25
  ): boolean {
    const submarineEntity: Entity = {
      id: 'submarine',
      type: 'submarine',
      x: submarine.x - submarineWidth / 2,
      y: submarine.y - submarineHeight / 2,
      width: submarineWidth,
      height: submarineHeight,
      active: true,
    };
    return PhysicsSystem.checkCollision(submarineEntity, entity);
  }

  static checkSubmarineWithHazard(
    submarine: SubmarineState,
    hazard: Hazard
  ): { collided: boolean; damage: number } {
    const submarineRadius = 20;
    const submarineX = submarine.x;
    const submarineY = submarine.y;

    if (hazard.hazardType === 'current' || hazard.hazardType === 'thermal') {
      const hazardCenterX = hazard.x + hazard.width / 2;
      const hazardCenterY = hazard.y + hazard.height / 2;
      
      if (
        PhysicsSystem.checkCircleCollision(
          submarineX,
          submarineY,
          submarineRadius,
          hazardCenterX,
          hazardCenterY,
          hazard.radius
        )
      ) {
        return { collided: true, damage: hazard.damage };
      }
    } else {
      if (this.checkSubmarineWithEntity(submarine, hazard)) {
        return { collided: true, damage: hazard.damage };
      }
    }

    return { collided: false, damage: 0 };
  }

  static checkArmWithSample(
    submarine: SubmarineState,
    sample: Sample,
    armRange: number
  ): boolean {
    if (!sample.active || sample.collected) return false;

    const sampleCenterX = sample.x + sample.width / 2;
    const sampleCenterY = sample.y + sample.height / 2;

    const distance = PhysicsSystem.calculateDistance(
      submarine.x,
      submarine.y,
      sampleCenterX,
      sampleCenterY
    );

    return distance <= armRange;
  }

  static checkNearExit(
    submarine: SubmarineState,
    exitX: number,
    exitY: number,
    range: number
  ): boolean {
    const distance = PhysicsSystem.calculateDistance(
      submarine.x,
      submarine.y,
      exitX,
      exitY
    );
    return distance <= range;
  }

  static checkItemPickup(
    submarine: SubmarineState,
    item: Item,
    pickupRange: number = 30
  ): boolean {
    if (!item.active || item.collected) return false;

    const itemCenterX = item.x + item.width / 2;
    const itemCenterY = item.y + item.height / 2;

    const distance = PhysicsSystem.calculateDistance(
      submarine.x,
      submarine.y,
      itemCenterX,
      itemCenterY
    );

    return distance <= pickupRange;
  }

  static checkArmWithItem(
    submarine: SubmarineState,
    item: Item,
    armRange: number
  ): boolean {
    if (!item.active || item.collected) return false;

    const itemCenterX = item.x + item.width / 2;
    const itemCenterY = item.y + item.height / 2;

    const distance = PhysicsSystem.calculateDistance(
      submarine.x,
      submarine.y,
      itemCenterX,
      itemCenterY
    );

    return distance <= armRange;
  }

  static getSubmarineBounds(
    submarine: SubmarineState,
    width: number = 40,
    height: number = 25
  ): { left: number; right: number; top: number; bottom: number } {
    return {
      left: submarine.x - width / 2,
      right: submarine.x + width / 2,
      top: submarine.y - height / 2,
      bottom: submarine.y + height / 2,
    };
  }

  static resolveCollision(
    entity: Entity,
    bounds: { left: number; right: number; top: number; bottom: number }
  ): void {
    if (entity.x < bounds.left) entity.x = bounds.left;
    if (entity.x + entity.width > bounds.right)
      entity.x = bounds.right - entity.width;
    if (entity.y < bounds.top) entity.y = bounds.top;
    if (entity.y + entity.height > bounds.bottom)
      entity.y = bounds.bottom - entity.height;
  }
}
