import * as React from 'react';
import { Zap, ArrowUp, Coins, Lock } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { Card } from '@/components/base/Card';
import { cn } from '@/lib/utils';
import type { Upgrade } from '@/data/upgrades';

interface UpgradeCardProps {
  upgrade: Upgrade;
  currentLevel: number;
  credits: number;
  onUpgrade: () => void;
}

const effectLabels: Record<string, string> = {
  speed: '移动速度',
  oxygen: '氧气容量',
  battery: '电量容量',
  armRange: '机械臂范围',
  armSpeed: '机械臂速度',
  sonarRange: '声呐范围',
  sonarAccuracy: '声呐精度',
  hull: '外壳耐久度',
};

export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  upgrade,
  currentLevel,
  credits,
  onUpgrade,
}) => {
  const isMaxLevel = currentLevel >= upgrade.maxLevel;
  const nextLevel = currentLevel + 1;
  const upgradeCost = isMaxLevel ? 0 : upgrade.costs[currentLevel];
  const canAfford = credits >= upgradeCost;
  const disabled = isMaxLevel || !canAfford;

  const currentEffect = currentLevel > 0 ? upgrade.effects[currentLevel - 1] : null;
  const nextEffect = !isMaxLevel ? upgrade.effects[currentLevel] : null;

  const renderEffect = (effect: unknown) => {
    if (!effect || typeof effect !== 'object') return null;
    const entries = Object.entries(effect as Record<string, number>);
    return entries.map(([key, value]) => (
      <div key={key} className="flex items-center gap-1">
        <span className="text-[10px] font-mono text-metal-400">
          {effectLabels[key] || key}:
        </span>
        <span className="text-[11px] font-mono text-glow-cyan font-medium">
          {value}
        </span>
      </div>
    ));
  };

  return (
    <Card variant="glow" className="p-5 w-full max-w-sm">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-display font-bold text-glow-cyan">
              {upgrade.name}
            </h3>
            <p className="text-xs text-metal-400 mt-1">
              {upgrade.description}
            </p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-deep-sea-900/80 border border-glow-cyan/30">
            <Zap size={14} className="text-glow-cyan" />
            <span className="text-sm font-display font-bold text-glow-cyan tabular-nums">
              Lv.{currentLevel}
            </span>
            <span className="text-xs text-metal-500">/{upgrade.maxLevel}</span>
          </div>
        </div>

        <div className="flex gap-1">
          {Array.from({ length: upgrade.maxLevel }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 flex-1 rounded-full transition-all duration-500',
                i < currentLevel
                  ? 'bg-gradient-to-r from-glow-cyan/80 to-glow-cyan/40'
                  : 'bg-deep-sea-950 border border-metal-700/50'
              )}
              style={{
                boxShadow:
                  i < currentLevel
                    ? '0 0 8px rgba(0, 255, 204, 0.4)'
                    : 'none',
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {currentEffect && (
            <div className="p-3 rounded-lg bg-deep-sea-900/60 border border-metal-600/30">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-[10px] font-mono text-metal-500 uppercase tracking-wider">
                  当前效果
                </span>
              </div>
              <div className="space-y-1">{renderEffect(currentEffect)}</div>
            </div>
          )}

          {!isMaxLevel && nextEffect && (
            <div className="p-3 rounded-lg bg-glow-cyan/5 border border-glow-cyan/20">
              <div className="flex items-center gap-1 mb-2">
                <ArrowUp size={12} className="text-glow-cyan" />
                <span className="text-[10px] font-mono text-glow-cyan uppercase tracking-wider">
                  Lv.{nextLevel}
                </span>
              </div>
              <div className="space-y-1">{renderEffect(nextEffect)}</div>
            </div>
          )}

          {isMaxLevel && (
            <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/30 flex items-center justify-center">
              <div className="text-center">
                <div className="text-emerald-400 font-display font-bold text-sm">
                  已满级
                </div>
                <div className="text-[10px] font-mono text-emerald-400/70">
                  已达最高等级
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          {!isMaxLevel ? (
            <>
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-glow-orange" />
                <span
                  className={cn(
                    'text-lg font-display font-bold tabular-nums',
                    canAfford ? 'text-glow-orange' : 'text-glow-red'
                  )}
                >
                  {upgradeCost}
                </span>
                <span className="text-xs text-metal-500">
                  / {credits}
                </span>
              </div>
              <Button
                variant={canAfford ? 'primary' : 'secondary'}
                size="sm"
                onClick={onUpgrade}
                disabled={disabled}
                className="gap-2"
              >
                {canAfford ? (
                  <>
                    <ArrowUp size={14} />
                    升级
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    信用点不足
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <span className="text-sm font-mono text-metal-500">
                无法继续升级
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
