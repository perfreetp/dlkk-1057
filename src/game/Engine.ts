import type { InputState, GameState, SettlementResult, SonarResult } from '../types/game';
import type { SubmarineState } from '../types/entities';
import { Submarine } from './Submarine';
import { Level } from './Level';
import { PhysicsSystem } from './systems/PhysicsSystem';
import { SampleEntity } from './entities/SampleEntity';
import { ItemEntity } from './entities/ItemEntity';

export interface Bubble {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
}

export interface EngineState {
  gameState: GameState;
  submarine: SubmarineState;
  level: {
    id: string;
    name: string;
    currentTime: number;
    timeLimit: number;
    score: number;
    objectives: Array<{
      id: string;
      name: string;
      description: string;
      currentCount: number;
      target: number;
      completed: boolean;
      reward: number;
      optional?: boolean;
      type: string;
    }>;
  };
  sonarResults: SonarResult[];
  bubbles: Bubble[];
}

export class Engine {
  gameState: GameState;
  submarine: Submarine | null;
  level: Level | null;
  bubbles: Bubble[];
  sonarResults: SonarResult[];

  private lastTime: number;
  private deltaTime: number;
  private isRunning: boolean;
  private inputState: InputState;
  private upgrades: Record<string, number>;
  private pendingSettlement: SettlementResult | null;
  private bubbleSpawnTimer: number;

  constructor() {
    this.gameState = 'menu';
    this.submarine = null;
    this.level = null;
    this.bubbles = [];
    this.sonarResults = [];
    this.lastTime = 0;
    this.deltaTime = 0;
    this.isRunning = false;
    this.inputState = {
      up: false,
      down: false,
      left: false,
      right: false,
      action1: false,
      action2: false,
      action3: false,
      action4: false,
    };
    this.upgrades = {};
    this.pendingSettlement = null;
    this.bubbleSpawnTimer = 0;
  }

  startGame(levelId: string, upgrades: Record<string, number>): void {
    this.upgrades = upgrades;
    this.level = new Level(levelId);
    this.submarine = new Submarine(this.level.startX, this.level.startY, upgrades);
    this.bubbles = [];
    this.sonarResults = [];
    this.gameState = 'playing';
    this.lastTime = performance.now();
    this.isRunning = true;
    this.pendingSettlement = null;
  }

  pauseGame(): void {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.isRunning = false;
    }
  }

  resumeGame(): void {
    if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.isRunning = true;
      this.lastTime = performance.now();
    }
  }

  endGame(): void {
    if (this.level && this.submarine) {
      this.pendingSettlement = this.calculateSettlement();
    }
    this.gameState = 'settlement';
    this.isRunning = false;
  }

  returnToMenu(): void {
    this.gameState = 'menu';
    this.submarine = null;
    this.level = null;
    this.bubbles = [];
    this.sonarResults = [];
    this.pendingSettlement = null;
  }

  update(): void {
    if (!this.isRunning || !this.submarine || !this.level) return;

    const now = performance.now();
    this.deltaTime = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    const subResult = this.submarine.update(this.inputState, this.deltaTime);

    if (subResult.shouldCreateBubble) {
      this.spawnBubble();
    }

    const levelResult = this.level.update(this.deltaTime, this.submarine.toState());

    for (const force of levelResult.pushForces) {
      this.submarine.applyForce(force);
    }

    const collisionResult = this.level.checkCollisions(
      this.submarine.toState(),
      this.submarine.getArmRange()
    );

    if (collisionResult.hazardDamage > 0) {
      this.submarine.takeDamage(collisionResult.hazardDamage);
    }
    if (collisionResult.creatureDamage > 0) {
      this.submarine.takeDamage(collisionResult.creatureDamage);
    }

    if (this.inputState.action1 && collisionResult.collectableSample) {
      if (this.submarine.addSample(collisionResult.collectableSample.sampleId)) {
        this.level.collectSample(collisionResult.collectableSample);
      }
    }

    if (this.inputState.action1 && collisionResult.collectableItem) {
      const itemResult = this.level.collectItem(collisionResult.collectableItem);
      if (itemResult) {
        this.applyItemEffect(itemResult);
      }
    }

    if (this.inputState.action2) {
      this.inputState.action2 = false;
      this.submarine.toggleArm();
    }

    if (this.inputState.action3) {
      this.inputState.action3 = false;
      this.submarine.toggleSonar();
    }

    if (this.inputState.action4) {
      this.inputState.action4 = false;
      this.submarine.toggleLight();
    }

    if (this.submarine.sonarActive) {
      const pingResults = this.submarine.sonar.ping(
        this.level.entities,
        this.submarine.x,
        this.submarine.y
      );
      if (pingResults.length > 0) {
        this.sonarResults = pingResults;
      }
    }

    this.updateBubbles();
    this.clampSubmarinePosition();

    if (this.submarine.isCrippled()) {
      this.level.failed = true;
      this.endGame();
    }

    if (this.level.failed) {
      this.endGame();
    }

    if (this.level.completed) {
      this.endGame();
    }
  }

  private applyItemEffect(itemResult: { type: string; value: number }): void {
    if (!this.submarine) return;

    switch (itemResult.type) {
      case 'oxygen':
        this.submarine.resources.oxygen = Math.min(
          this.submarine.resources.maxOxygen,
          this.submarine.resources.oxygen + itemResult.value
        );
        this.submarine.oxygen = this.submarine.resources.oxygen;
        break;
      case 'battery':
        this.submarine.resources.battery = Math.min(
          this.submarine.resources.maxBattery,
          this.submarine.resources.battery + itemResult.value
        );
        this.submarine.battery = this.submarine.resources.battery;
        break;
      case 'repair':
        this.submarine.resources.hull = Math.min(
          this.submarine.resources.maxHull,
          this.submarine.resources.hull + itemResult.value
        );
        this.submarine.hull = this.submarine.resources.hull;
        break;
    }
  }

  private spawnBubble(): void {
    if (!this.submarine) return;

    const bubble: Bubble = {
      x: this.submarine.x - 15 + Math.random() * 10,
      y: this.submarine.y + 10,
      size: 3 + Math.random() * 5,
      speed: 1 + Math.random() * 2,
      alpha: 0.6 + Math.random() * 0.4,
    };
    this.bubbles.push(bubble);
  }

  private updateBubbles(): void {
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const bubble = this.bubbles[i];
      bubble.y -= bubble.speed * this.deltaTime * 60;
      bubble.x += (Math.random() - 0.5) * 0.5;
      bubble.alpha -= this.deltaTime * 0.3;

      if (bubble.alpha <= 0 || bubble.y < -50) {
        this.bubbles.splice(i, 1);
      }
    }

    this.bubbleSpawnTimer += this.deltaTime;
    if (this.bubbleSpawnTimer > 0.3 && this.submarine && Math.abs(this.submarine.vy) > 0.5) {
      this.bubbleSpawnTimer = 0;
      this.spawnBubble();
    }
  }

  private clampSubmarinePosition(): void {
    if (!this.submarine || !this.level) return;

    const bounds = this.level.getWorldBounds();
    this.submarine.x = PhysicsSystem.clamp(this.submarine.x, bounds.minX, bounds.maxX);
    this.submarine.y = PhysicsSystem.clamp(this.submarine.y, bounds.minY, bounds.maxY);
  }

  setInput(input: Partial<InputState>): void {
    this.inputState = { ...this.inputState, ...input };
  }

  repair(): boolean {
    if (!this.submarine || this.gameState !== 'playing') return false;
    return this.submarine.repair();
  }

  addMapMarker(marker: { x: number; y: number; type: string; label: string; color: string }): void {
    if (!this.level) return;
    this.level.addMapMarker(marker);
  }

  clearMapMarkers(): void {
    if (!this.level) return;
    this.level.clearMapMarkers();
  }

  getMapMarkers(): Array<{ id: string; x: number; y: number; type: string; label: string; color: string }> {
    if (!this.level) return [];
    return this.level.getMapMarkers();
  }

  getInput(): InputState {
    return { ...this.inputState };
  }

  getState(): EngineState | null {
    if (!this.submarine || !this.level) return null;

    return {
      gameState: this.gameState,
      submarine: this.submarine.toState(),
      level: {
        id: this.level.id,
        name: this.level.name,
        currentTime: this.level.currentTime,
        timeLimit: this.level.timeLimit,
        score: this.level.score,
        objectives: this.level.objectives.map(obj => ({
          id: obj.id,
          name: obj.name,
          description: obj.description,
          currentCount: obj.currentCount,
          target: obj.target,
          completed: obj.currentCount >= obj.target,
          reward: obj.reward,
          optional: obj.optional,
          type: obj.type,
        })),
      },
      sonarResults: this.sonarResults,
      bubbles: [...this.bubbles],
    };
  }

  getSettlementResult(): SettlementResult | null {
    return this.pendingSettlement;
  }

  private calculateSettlement(): SettlementResult {
    if (!this.submarine || !this.level) {
      throw new Error('Cannot calculate settlement without active game');
    }

    const finalScore = this.level.calculateFinalScore();
    const timeUsed = this.level.currentTime;
    const samplesCollected = this.level.collectedSamples.length;
    const objectivesCompleted = this.level.getCompletedObjectives().length;

    let stars: 1 | 2 | 3 = 1;
    if (finalScore >= 500) stars = 2;
    if (finalScore >= 1000) stars = 3;

    const creditsEarned = Math.floor(finalScore * 0.5);
    const newUnlocks: string[] = [];

    return {
      score: finalScore,
      stars,
      timeUsed,
      samplesCollected,
      objectivesCompleted,
      creditsEarned,
      newUnlocks,
      collectedSampleIds: [...this.level.collectedSamples],
    };
  }

  getDeltaTime(): number {
    return this.deltaTime;
  }

  isGameRunning(): boolean {
    return this.isRunning;
  }
}
