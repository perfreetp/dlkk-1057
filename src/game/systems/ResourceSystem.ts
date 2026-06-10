import { UPGRADES } from '../../data/upgrades';

export class ResourceSystem {
  oxygen: number;
  maxOxygen: number;
  battery: number;
  maxBattery: number;
  hull: number;
  maxHull: number;

  private oxygenConsumptionRate: number;
  private batteryConsumptionRate: number;

  constructor(upgrades: Record<string, number>) {
    const oxygenLevel = upgrades.oxygenTank ?? 0;
    const batteryLevel = upgrades.battery ?? 0;
    const hullLevel = upgrades.armor ?? 0;

    this.maxOxygen = UPGRADES[1].effects[oxygenLevel].oxygen ?? 100;
    this.maxBattery = UPGRADES[2].effects[batteryLevel].battery ?? 100;
    this.maxHull = UPGRADES[5].effects[hullLevel].hull ?? 100;

    this.oxygen = this.maxOxygen;
    this.battery = this.maxBattery;
    this.hull = this.maxHull;

    this.oxygenConsumptionRate = 0.5 / (1 + oxygenLevel * 0.1);
    this.batteryConsumptionRate = 0.3 / (1 + batteryLevel * 0.1);
  }

  consumeOxygen(amount: number): boolean {
    const actualAmount = amount * this.oxygenConsumptionRate;
    if (this.oxygen >= actualAmount) {
      this.oxygen -= actualAmount;
      return true;
    }
    this.oxygen = 0;
    return false;
  }

  consumeBattery(amount: number): boolean {
    const actualAmount = amount * this.batteryConsumptionRate;
    if (this.battery >= actualAmount) {
      this.battery -= actualAmount;
      return true;
    }
    this.battery = 0;
    return false;
  }

  takeDamage(amount: number): boolean {
    if (this.hull > 0) {
      this.hull = Math.max(0, this.hull - amount);
      return true;
    }
    return false;
  }

  repairHull(amount: number): boolean {
    if (this.hull < this.maxHull) {
      this.hull = Math.min(this.maxHull, this.hull + amount);
      return true;
    }
    return false;
  }

  isDepleted(): boolean {
    return this.oxygen <= 0 || this.battery <= 0 || this.hull <= 0;
  }

  reset(): void {
    this.oxygen = this.maxOxygen;
    this.battery = this.maxBattery;
    this.hull = this.maxHull;
  }

  update(deltaTime: number, lightOn: boolean, sonarActive: boolean): void {
    this.consumeOxygen(deltaTime * 0.1);
    
    let batteryDrain = deltaTime * 0.05;
    if (lightOn) batteryDrain += deltaTime * 0.03;
    if (sonarActive) batteryDrain += deltaTime * 0.02;
    this.consumeBattery(batteryDrain);
  }

  getOxygenPercentage(): number {
    return (this.oxygen / this.maxOxygen) * 100;
  }

  getBatteryPercentage(): number {
    return (this.battery / this.maxBattery) * 100;
  }

  getHullPercentage(): number {
    return (this.hull / this.maxHull) * 100;
  }
}
