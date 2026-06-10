import type { EngineState } from '../Engine';
import type { SonarResult } from '../../types/game';
import { SampleEntity } from '../entities/SampleEntity';
import { CreatureEntity } from '../entities/CreatureEntity';
import { HazardEntity } from '../entities/HazardEntity';
import { ItemEntity } from '../entities/ItemEntity';
import { Level } from '../Level';
import { Submarine } from '../Submarine';

interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private width: number;
  private height: number;
  private particles: Array<{
    x: number;
    y: number;
    size: number;
    speed: number;
    alpha: number;
    color: string;
  }>;
  private sonarScanAnimation: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1,
    };
    this.particles = [];
    this.sonarScanAnimation = 0;
    this.initParticles();
  }

  private initParticles(): void {
    for (let i = 0; i < 100; i++) {
      this.particles.push({
        x: Math.random() * 2000 - 500,
        y: Math.random() * 4000 - 200,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.2,
        alpha: Math.random() * 0.5 + 0.2,
        color: '#87CEEB',
      });
    }
  }

  render(
    engineState: EngineState,
    level: Level | null,
    submarine: Submarine | null,
    deltaTime: number
  ): void {
    if (!level || !submarine) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    this.updateCamera(submarine.x, submarine.y);
    this.updateParticles(deltaTime, level.background.particleColor);

    this.renderBackground(level, submarine.depth);
    this.renderParticles();

    this.ctx.save();
    this.applyCameraTransform();

    this.renderExit(level.exitX, level.exitY);
    this.renderHazards(level.hazards);
    this.renderItems(level.items);
    this.renderSamples(level.samples);
    this.renderCreatures(level.creatures);
    this.renderSubmarine(submarine);
    this.renderBubbles(engineState.bubbles);

    if (submarine.sonarActive) {
      this.renderSonarScan(submarine.x, submarine.y, submarine.sonar.range, deltaTime);
      this.renderSonarResults(engineState.sonarResults, submarine.x, submarine.y);
    }

    if (submarine.lightOn) {
      this.renderLightEffect(submarine.x, submarine.y, submarine.angle);
    }

    this.renderArm(submarine);

    this.ctx.restore();

    this.renderUI(engineState, submarine);
  }

  private updateCamera(targetX: number, targetY: number): void {
    const smoothFactor = 0.08;
    this.camera.x += (targetX - this.camera.x) * smoothFactor;
    this.camera.y += (targetY - this.camera.y) * smoothFactor;
  }

  private applyCameraTransform(): void {
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(-this.camera.x, -this.camera.y);
  }

  private updateParticles(deltaTime: number, color: string): void {
    for (const particle of this.particles) {
      particle.y -= particle.speed * deltaTime * 60;
      particle.x += (Math.random() - 0.5) * 0.3;
      particle.color = color;

      if (particle.y < -200) {
        particle.y = 4000;
        particle.x = this.camera.x + (Math.random() - 0.5) * this.width * 2;
      }
    }
  }

  private renderBackground(level: Level, depth: number): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, level.background.topColor);
    gradient.addColorStop(1, level.background.bottomColor);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    const depthFactor = Math.min(depth / 1000, 1);
    this.ctx.fillStyle = `rgba(0, 0, 0, ${depthFactor * 0.3})`;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private renderParticles(): void {
    for (const particle of this.particles) {
      const screenX = particle.x - this.camera.x + this.width / 2;
      const screenY = particle.y - this.camera.y + this.height / 2;

      if (screenX < -50 || screenX > this.width + 50 || screenY < -50 || screenY > this.height + 50) {
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color + Math.floor(particle.alpha * 255).toString(16).padStart(2, '0');
      this.ctx.fill();
    }
  }

  private renderSubmarine(submarine: Submarine): void {
    const { x, y, angle } = submarine;
    const damageFlash = submarine.getDamageFlash();

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);

    if (damageFlash > 0) {
      this.ctx.shadowColor = '#FF0000';
      this.ctx.shadowBlur = 20 * damageFlash;
    }

    const bodyGradient = this.ctx.createLinearGradient(-20, -12, -20, 12);
    bodyGradient.addColorStop(0, '#4A90D9');
    bodyGradient.addColorStop(0.5, '#2E5A8A');
    bodyGradient.addColorStop(1, '#1A3A5C');

    this.ctx.fillStyle = bodyGradient;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#87CEEB';
    this.ctx.beginPath();
    this.ctx.ellipse(8, -3, 8, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(-18, -14, 6, 4);
    this.ctx.fillRect(-18, 10, 6, 4);

    if (damageFlash > 0) {
      this.ctx.fillStyle = `rgba(255, 0, 0, ${damageFlash * 0.5})`;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, 22, 14, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  private renderArm(submarine: Submarine): void {
    const armAnimation = submarine.getArmAnimation();
    if (armAnimation <= 0) return;

    const { x, y } = submarine;
    const armLength = 50 * armAnimation;

    this.ctx.strokeStyle = '#555';
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(x + 15, y);
    this.ctx.lineTo(x + 15 + armLength, y);
    this.ctx.stroke();

    this.ctx.fillStyle = '#777';
    this.ctx.beginPath();
    this.ctx.arc(x + 15 + armLength, y, 6, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.arc(x, y, submarine.getArmRange(), 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  private renderSamples(samples: SampleEntity[]): void {
    for (const sample of samples) {
      if (!sample.active || sample.collected) continue;

      const glowIntensity = sample.getGlowIntensity();
      const size = sample.getSizeByRarity();
      const centerX = sample.x + sample.width / 2;
      const centerY = sample.y + sample.height / 2;

      const gradient = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, size * 2
      );
      gradient.addColorStop(0, sample.glowColor + '80');
      gradient.addColorStop(1, sample.glowColor + '00');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, size * 2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = sample.glowColor;
      this.ctx.shadowColor = sample.glowColor;
      this.ctx.shadowBlur = 15 * glowIntensity;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      if (sample.rarity >= 4) {
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, size / 2 + 4, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }
  }

  private renderCreatures(creatures: CreatureEntity[]): void {
    for (const creature of creatures) {
      if (!creature.active) continue;

      const centerX = creature.x + creature.width / 2;
      const centerY = creature.y + creature.height / 2;
      const wiggle = creature.getWiggle();

      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(wiggle * 0.05);

      if (creature.hostile) {
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.fillStyle = creature.glowColor;
      this.ctx.shadowColor = creature.glowColor;
      this.ctx.shadowBlur = 10;

      if (creature.hostile) {
        this.ctx.beginPath();
        this.ctx.moveTo(-15, 0);
        this.ctx.lineTo(0, -12);
        this.ctx.lineTo(15, 0);
        this.ctx.lineTo(0, 12);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(-5, -3, 3, 0, Math.PI * 2);
        this.ctx.arc(5, -3, 3, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(-5, -3, 1.5, 0, Math.PI * 2);
        this.ctx.arc(5, -3, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 3; i++) {
          this.ctx.beginPath();
          this.ctx.arc(-10 + i * 10, Math.sin(wiggle + i) * 3, 3, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }

      this.ctx.shadowBlur = 0;
      this.ctx.restore();
    }
  }

  private renderHazards(hazards: HazardEntity[]): void {
    for (const hazard of hazards) {
      if (!hazard.active) continue;

      const centerX = hazard.x + hazard.width / 2;
      const centerY = hazard.y + hazard.height / 2;
      const pulseIntensity = hazard.getPulseIntensity();
      const color = hazard.getHazardColor();

      if (hazard.hazardType === 'current' || hazard.hazardType === 'thermal') {
        const gradient = this.ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, hazard.radius
        );
        gradient.addColorStop(0, color + '80');
        gradient.addColorStop(0.7, color + '40');
        gradient.addColorStop(1, color + '00');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, hazard.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = color + Math.floor(pulseIntensity * 128 + 64).toString(16).padStart(2, '0');
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, hazard.radius * pulseIntensity, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        if (hazard.hazardType === 'current') {
          this.ctx.strokeStyle = color + '80';
          this.ctx.lineWidth = 3;
          for (let i = 0; i < 3; i++) {
            const angle = (pulseIntensity * Math.PI * 2) + (i * Math.PI * 2 / 3);
            const radius = hazard.radius * 0.5 + pulseIntensity * 10;
            this.ctx.beginPath();
            this.ctx.moveTo(
              centerX + Math.cos(angle) * radius * 0.5,
              centerY + Math.sin(angle) * radius * 0.5
            );
            this.ctx.lineTo(
              centerX + Math.cos(angle) * radius,
              centerY + Math.sin(angle) * radius
            );
            this.ctx.stroke();
          }
        }
      } else {
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10 * pulseIntensity;

        if (hazard.hazardType === 'sharp') {
          this.ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = i % 2 === 0 ? hazard.width / 2 : hazard.width / 4;
            const px = centerX + Math.cos(angle) * radius;
            const py = centerY + Math.sin(angle) * radius;
            if (i === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
          }
          this.ctx.closePath();
          this.ctx.fill();
        } else {
          this.ctx.fillRect(
            hazard.x,
            hazard.y,
            hazard.width,
            hazard.height
          );
        }

        this.ctx.shadowBlur = 0;
      }
    }
  }

  private renderItems(items: ItemEntity[]): void {
    for (const item of items) {
      if (!item.active || item.collected) continue;

      const centerX = item.x + item.width / 2;
      const centerY = item.y + item.height / 2;
      const color = item.getItemColor();
      const glowIntensity = item.getGlowIntensity();
      const rotation = item.getRotation();

      const gradient = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 30
      );
      gradient.addColorStop(0, color + '60');
      gradient.addColorStop(1, color + '00');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(rotation);

      this.ctx.fillStyle = color;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 15 * glowIntensity;

      switch (item.itemType) {
        case 'oxygen':
          this.ctx.beginPath();
          this.ctx.roundRect(-8, -12, 16, 24, 4);
          this.ctx.fill();
          this.ctx.fillStyle = '#FFF';
          this.ctx.font = 'bold 10px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('O₂', 0, 4);
          break;
        case 'battery':
          this.ctx.beginPath();
          this.ctx.roundRect(-7, -10, 14, 20, 3);
          this.ctx.fill();
          this.ctx.fillStyle = '#000';
          this.ctx.fillRect(-3, -13, 6, 4);
          this.ctx.fillStyle = '#4CAF50';
          this.ctx.fillRect(-5, -6, 10, 4);
          this.ctx.fillRect(-5, 0, 10, 4);
          break;
        case 'repair':
          this.ctx.beginPath();
          this.ctx.moveTo(-10, -5);
          this.ctx.lineTo(10, -5);
          this.ctx.lineTo(10, 5);
          this.ctx.lineTo(-10, 5);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.fillStyle = '#FFF';
          this.ctx.font = 'bold 12px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('+', 0, 4);
          break;
        case 'log':
          this.ctx.fillRect(-12, -8, 24, 16);
          this.ctx.fillStyle = '#8B4513';
          this.ctx.fillRect(-10, -6, 20, 12);
          this.ctx.fillStyle = '#DEB887';
          this.ctx.fillRect(-8, -4, 16, 2);
          this.ctx.fillRect(-8, 0, 12, 2);
          break;
        case 'beacon':
          this.ctx.beginPath();
          this.ctx.moveTo(0, -15);
          this.ctx.lineTo(10, 10);
          this.ctx.lineTo(-10, 10);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.fillStyle = '#FFF';
          this.ctx.beginPath();
          this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
          this.ctx.fill();
          break;
      }

      this.ctx.shadowBlur = 0;
      this.ctx.restore();
    }
  }

  private renderExit(exitX: number, exitY: number): void {
    const time = Date.now() * 0.002;
    const pulse = Math.sin(time) * 0.3 + 0.7;

    const gradient = this.ctx.createRadialGradient(
      exitX, exitY, 0,
      exitX, exitY, 60
    );
    gradient.addColorStop(0, `rgba(0, 255, 127, ${0.5 * pulse})`);
    gradient.addColorStop(0.5, `rgba(0, 255, 127, ${0.2 * pulse})`);
    gradient.addColorStop(1, 'rgba(0, 255, 127, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(exitX, exitY, 60, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = `rgba(0, 255, 127, ${pulse})`;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(exitX, exitY, 40, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = '#00FF7F';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('EXIT', exitX, exitY + 5);
  }

  private renderBubbles(bubbles: Array<{ x: number; y: number; size: number; alpha: number }>): void {
    for (const bubble of bubbles) {
      this.ctx.beginPath();
      this.ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${bubble.alpha * 0.3})`;
      this.ctx.fill();
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${bubble.alpha * 0.6})`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(
        bubble.x - bubble.size * 0.3,
        bubble.y - bubble.size * 0.3,
        bubble.size * 0.2,
        0,
        Math.PI * 2
      );
      this.ctx.fillStyle = `rgba(255, 255, 255, ${bubble.alpha * 0.8})`;
      this.ctx.fill();
    }
  }

  private renderLightEffect(x: number, y: number, angle: number): void {
    const lightRange = 150;
    const lightAngle = Math.PI / 3;

    const gradient = this.ctx.createRadialGradient(
      x, y, 0,
      x, y, lightRange
    );
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.arc(0, 0, lightRange, -lightAngle / 2, lightAngle / 2);
    this.ctx.closePath();
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.restore();
  }

  private renderSonarScan(x: number, y: number, range: number, deltaTime: number): void {
    this.sonarScanAnimation += deltaTime * 2;
    if (this.sonarScanAnimation > 1) this.sonarScanAnimation = 0;

    const scanRadius = range * this.sonarScanAnimation;
    const alpha = 1 - this.sonarScanAnimation;

    this.ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.6})`;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, scanRadius, 0, Math.PI * 2);
    this.ctx.stroke();

    for (let i = 0; i < 3; i++) {
      const ringRadius = range * ((this.sonarScanAnimation + i * 0.3) % 1);
      const ringAlpha = (1 - ((this.sonarScanAnimation + i * 0.3) % 1)) * 0.3;
      this.ctx.strokeStyle = `rgba(0, 255, 255, ${ringAlpha})`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  private renderSonarResults(results: SonarResult[], subX: number, subY: number): void {
    for (const result of results) {
      const dx = result.x - subX;
      const dy = result.y - subY;
      const angle = Math.atan2(dy, dx);
      const displayDistance = Math.min(result.distance, 200);

      const displayX = subX + Math.cos(angle) * displayDistance;
      const displayY = subY + Math.sin(angle) * displayDistance;

      let color = '#00FFFF';
      switch (result.type) {
        case 'creature': color = '#FF6B6B'; break;
        case 'hazard': color = '#FF4500'; break;
        case 'beacon': color = '#FFD700'; break;
        case 'exit': color = '#00FF7F'; break;
        case 'sample': color = '#00FFFF'; break;
      }

      this.ctx.fillStyle = color + '80';
      this.ctx.beginPath();
      this.ctx.arc(displayX, displayY, 6, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(subX, subY);
      this.ctx.lineTo(displayX, displayY);
      this.ctx.stroke();
    }
  }

  private renderUI(engineState: EngineState, submarine: Submarine): void {
    const { submarine: subState, level } = engineState;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, 200, 120);
    this.ctx.strokeStyle = '#00FFFF';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(10, 10, 200, 120);

    this.ctx.fillStyle = '#00FFFF';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'left';

    this.ctx.fillText(`深度: ${Math.floor(subState.depth)}m`, 20, 30);
    this.ctx.fillText(`速度: ${submarine.getSpeed().toFixed(1)}`, 20, 48);
    this.ctx.fillText(`分数: ${level.score}`, 20, 66);

    const remainingTime = level.timeLimit - level.currentTime;
    const minutes = Math.floor(remainingTime / 60);
    const seconds = Math.floor(remainingTime % 60);
    this.ctx.fillText(
      `时间: ${minutes}:${seconds.toString().padStart(2, '0')}`,
      20,
      84
    );
    this.ctx.fillText(`样本: ${subState.samples.length}/${subState.maxSamples}`, 20, 102);
    this.ctx.fillText(
      `灯光: ${subState.lightOn ? '开' : '关'} | 声呐: ${subState.sonarActive ? '开' : '关'}`,
      20,
      120
    );

    this.renderResourceBar(220, 15, 180, '氧气', subState.oxygen, subState.maxOxygen, '#00BFFF');
    this.renderResourceBar(220, 45, 180, '电量', subState.battery, subState.maxBattery, '#FFD700');
    this.renderResourceBar(220, 75, 180, '船体', subState.hull, subState.maxHull, '#32CD32');

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(this.width - 220, 10, 210, 20 + level.objectives.length * 25);
    this.ctx.strokeStyle = '#00FFFF';
    this.ctx.strokeRect(this.width - 220, 10, 210, 20 + level.objectives.length * 25);

    this.ctx.fillStyle = '#00FFFF';
    this.ctx.font = 'bold 12px monospace';
    this.ctx.fillText('任务目标', this.width - 210, 28);

    this.ctx.font = '11px monospace';
    level.objectives.forEach((obj, index) => {
      const y = 50 + index * 25;
      const completed = obj.completed;
      this.ctx.fillStyle = completed ? '#00FF7F' : '#FFF';
      this.ctx.fillText(
        `${completed ? '✓' : '○'} ${obj.description}`,
        this.width - 210,
        y
      );
      this.ctx.fillText(
        `${obj.currentCount}/${obj.target}`,
        this.width - 50,
        y
      );
    });

    if (submarine.sonarActive) {
      const cooldownPercent = submarine.sonar.getCooldownPercentage();
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(10, this.height - 40, 150, 30);
      this.ctx.strokeStyle = '#00FFFF';
      this.ctx.strokeRect(10, this.height - 40, 150, 30);

      this.ctx.fillStyle = '#00FFFF';
      this.ctx.fillRect(15, this.height - 35, 140 * (1 - cooldownPercent / 100), 20);
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        cooldownPercent > 0 ? `冷却中 ${Math.ceil(cooldownPercent)}%` : '声呐就绪',
        85,
        this.height - 21
      );
      this.ctx.textAlign = 'left';
    }

    const sonarPing = submarine.sonar.getPingAnimation();
    if (sonarPing > 0) {
      this.ctx.fillStyle = `rgba(0, 255, 255, ${sonarPing * 0.3})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    const damageFlash = submarine.getDamageFlash();
    if (damageFlash > 0) {
      this.ctx.fillStyle = `rgba(255, 0, 0, ${damageFlash * 0.2})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  private renderResourceBar(
    x: number,
    y: number,
    width: number,
    label: string,
    value: number,
    max: number,
    color: string
  ): void {
    const percent = Math.max(0, Math.min(1, value / max));
    const barWidth = width - 60;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(x, y, width, 25);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, 25);

    this.ctx.fillStyle = color + '40';
    this.ctx.fillRect(x + 55, y + 3, barWidth * percent, 19);

    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 55, y + 3, barWidth * percent, 19);

    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '11px monospace';
    this.ctx.fillText(label, x + 5, y + 17);
    this.ctx.textAlign = 'right';
    this.ctx.fillText(
      `${Math.floor(value)}/${max}`,
      x + width - 5,
      y + 17
    );
    this.ctx.textAlign = 'left';

    if (percent < 0.2) {
      this.ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(Date.now() * 0.01) * 0.3})`;
      this.ctx.fillRect(x + 55, y + 3, barWidth * percent, 19);
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  getCamera(): Camera {
    return { ...this.camera };
  }

  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: (worldX - this.camera.x) * this.camera.zoom + this.width / 2,
      y: (worldY - this.camera.y) * this.camera.zoom + this.height / 2,
    };
  }

  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.width / 2) / this.camera.zoom + this.camera.x,
      y: (screenY - this.height / 2) / this.camera.zoom + this.camera.y,
    };
  }
}
