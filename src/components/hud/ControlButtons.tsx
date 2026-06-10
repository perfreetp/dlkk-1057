import * as React from 'react';
import { Radar, Lightbulb, Hand, Wrench } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  hotkey: string;
  active?: boolean;
  cooldown?: number;
  maxCooldown?: number;
  onClick: () => void;
  color: 'cyan' | 'orange' | 'purple' | 'green';
}

const ControlButton: React.FC<ControlButtonProps> = ({
  icon,
  label,
  hotkey,
  active,
  cooldown = 0,
  maxCooldown = 0,
  onClick,
  color,
}) => {
  const isOnCooldown = cooldown > 0;
  const cooldownPercent = maxCooldown > 0 ? (cooldown / maxCooldown) * 100 : 0;

  const colorClasses = {
    cyan: {
      border: active ? 'border-glow-cyan' : 'border-glow-cyan/30',
      bg: active ? 'bg-glow-cyan/20' : 'bg-glow-cyan/5',
      text: 'text-glow-cyan',
      glow: active ? 'shadow-[0_0_20px_rgba(0,255,204,0.5),0_0_40px_rgba(0,255,204,0.2)]' : '',
    },
    orange: {
      border: active ? 'border-glow-orange' : 'border-glow-orange/30',
      bg: active ? 'bg-glow-orange/20' : 'bg-glow-orange/5',
      text: 'text-glow-orange',
      glow: active ? 'shadow-[0_0_20px_rgba(249,115,22,0.5),0_0_40px_rgba(249,115,22,0.2)]' : '',
    },
    purple: {
      border: active ? 'border-glow-purple' : 'border-glow-purple/30',
      bg: active ? 'bg-glow-purple/20' : 'bg-glow-purple/5',
      text: 'text-glow-purple',
      glow: active ? 'shadow-[0_0_20px_rgba(168,85,247,0.5),0_0_40px_rgba(168,85,247,0.2)]' : '',
    },
    green: {
      border: active ? 'border-emerald-400' : 'border-emerald-400/30',
      bg: active ? 'bg-emerald-400/20' : 'bg-emerald-400/5',
      text: 'text-emerald-400',
      glow: active ? 'shadow-[0_0_20px_rgba(52,211,153,0.5),0_0_40px_rgba(52,211,153,0.2)]' : '',
    },
  };

  const colors = colorClasses[color];

  return (
    <button
      onClick={onClick}
      disabled={isOnCooldown}
      className={cn(
        'relative w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-300',
        colors.border,
        colors.bg,
        colors.text,
        colors.glow,
        !isOnCooldown && 'hover:scale-105 active:scale-95',
        isOnCooldown && 'opacity-60 cursor-not-allowed'
      )}
    >
      {isOnCooldown && (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div
            className={cn('absolute bottom-0 left-0 right-0 opacity-30', colors.bg)}
            style={{ height: `${cooldownPercent}%` }}
          />
        </div>
      )}
      <div className="relative z-10">{icon}</div>
      <span className="relative z-10 text-[10px] font-mono">{label}</span>
      <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-deep-sea-950/80 border border-metal-600/50">
        {hotkey}
      </div>
      {isOnCooldown && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-mono text-metal-400">
          {cooldown.toFixed(1)}s
        </div>
      )}
    </button>
  );
};

export const ControlButtons: React.FC = () => {
  const { submarineState, updateSubmarineState } = useGameStore();

  const [cooldowns, setCooldowns] = React.useState<Record<string, number>>({
    sonar: 0,
    light: 0,
    arm: 0,
    repair: 0,
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (next[key] > 0) {
            next[key] = Math.max(0, next[key] - 0.1);
          }
        });
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleSonar = () => {
    if (cooldowns.sonar > 0) return;
    setCooldowns((prev) => ({ ...prev, sonar: 3 }));
    updateSubmarineState({ sonarActive: true });
    setTimeout(() => {
      updateSubmarineState({ sonarActive: false });
    }, 2000);
  };

  const handleLight = () => {
    if (cooldowns.light > 0) return;
    setCooldowns((prev) => ({ ...prev, light: 1 }));
    if (submarineState) {
      updateSubmarineState({ lightOn: !submarineState.lightOn });
    }
  };

  const handleArm = () => {
    if (cooldowns.arm > 0) return;
    setCooldowns((prev) => ({ ...prev, arm: 2 }));
    if (submarineState) {
      updateSubmarineState({ armExtended: submarineState.armExtended === 1 ? 0 : 1 });
      setTimeout(() => {
        updateSubmarineState({ armExtended: 0 });
      }, 1500);
    }
  };

  const handleRepair = () => {
    if (cooldowns.repair > 0 || !submarineState) return;
    if (submarineState.hull >= submarineState.maxHull) return;
    setCooldowns((prev) => ({ ...prev, repair: 5 }));
    const repairAmount = submarineState.maxHull * 0.1;
    updateSubmarineState({
      hull: Math.min(submarineState.maxHull, submarineState.hull + repairAmount),
    });
  };

  if (!submarineState) return null;

  return (
    <div className="glass-panel p-4">
      <div className="flex gap-3">
        <ControlButton
          icon={<Radar size={24} />}
          label="声呐"
          hotkey="Q"
          active={submarineState.sonarActive}
          cooldown={cooldowns.sonar}
          maxCooldown={3}
          onClick={handleSonar}
          color="cyan"
        />
        <ControlButton
          icon={<Lightbulb size={24} />}
          label="灯光"
          hotkey="W"
          active={submarineState.lightOn}
          cooldown={cooldowns.light}
          maxCooldown={1}
          onClick={handleLight}
          color="orange"
        />
        <ControlButton
          icon={<Hand size={24} />}
          label="机械臂"
          hotkey="E"
          active={submarineState.armExtended === 1}
          cooldown={cooldowns.arm}
          maxCooldown={2}
          onClick={handleArm}
          color="purple"
        />
        <ControlButton
          icon={<Wrench size={24} />}
          label="维修"
          hotkey="R"
          cooldown={cooldowns.repair}
          maxCooldown={5}
          onClick={handleRepair}
          color="green"
        />
      </div>
    </div>
  );
};
