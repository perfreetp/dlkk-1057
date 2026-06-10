import * as React from 'react';
import { Wind, Battery, Shield } from 'lucide-react';
import { ProgressBar } from '@/components/base/ProgressBar';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

export const ResourceHUD: React.FC = () => {
  const { submarineState } = useGameStore();

  if (!submarineState) return null;

  const { oxygen, maxOxygen, battery, maxBattery, hull, maxHull } = submarineState;

  const oxygenPercent = (oxygen / maxOxygen) * 100;
  const batteryPercent = (battery / maxBattery) * 100;
  const hullPercent = (hull / maxHull) * 100;

  const isOxygenLow = oxygenPercent < 20;
  const isBatteryLow = batteryPercent < 20;
  const isHullLow = hullPercent < 20;

  return (
    <div className="glass-panel p-4 w-64 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Wind
            size={16}
            className={cn(
              'text-glow-cyan',
              isOxygenLow && 'animate-pulse text-glow-red'
            )}
          />
          <span
            className={cn(
              'text-xs font-mono text-glow-cyan',
              isOxygenLow && 'animate-pulse text-glow-red'
            )}
          >
            氧气
          </span>
          <span
            className={cn(
              'ml-auto text-xs font-mono',
              isOxygenLow ? 'text-glow-red' : 'text-metal-400'
            )}
          >
            {Math.round(oxygen)}/{maxOxygen}
          </span>
        </div>
        <ProgressBar
          value={oxygen}
          max={maxOxygen}
          color={isOxygenLow ? 'red' : 'cyan'}
          className="h-2"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Battery
            size={16}
            className={cn(
              'text-glow-orange',
              isBatteryLow && 'animate-pulse text-glow-red'
            )}
          />
          <span
            className={cn(
              'text-xs font-mono text-glow-orange',
              isBatteryLow && 'animate-pulse text-glow-red'
            )}
          >
            电量
          </span>
          <span
            className={cn(
              'ml-auto text-xs font-mono',
              isBatteryLow ? 'text-glow-red' : 'text-metal-400'
            )}
          >
            {Math.round(battery)}/{maxBattery}
          </span>
        </div>
        <ProgressBar
          value={battery}
          max={maxBattery}
          color={isBatteryLow ? 'red' : 'orange'}
          className="h-2"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield
            size={16}
            className={cn(
              'text-glow-purple',
              isHullLow && 'animate-pulse text-glow-red'
            )}
          />
          <span
            className={cn(
              'text-xs font-mono text-glow-purple',
              isHullLow && 'animate-pulse text-glow-red'
            )}
          >
            耐久度
          </span>
          <span
            className={cn(
              'ml-auto text-xs font-mono',
              isHullLow ? 'text-glow-red' : 'text-metal-400'
            )}
          >
            {Math.round(hull)}/{maxHull}
          </span>
        </div>
        <ProgressBar
          value={hull}
          max={maxHull}
          color={isHullLow ? 'red' : 'purple'}
          className="h-2"
        />
      </div>
    </div>
  );
};
