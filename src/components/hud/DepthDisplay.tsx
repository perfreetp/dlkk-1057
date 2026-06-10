import * as React from 'react';
import { Anchor } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

export const DepthDisplay: React.FC = () => {
  const { submarineState } = useGameStore();

  if (!submarineState) return null;

  const { depth } = submarineState;

  const getDepthColor = (depth: number) => {
    if (depth < 200) return 'text-glow-cyan';
    if (depth < 500) return 'text-glow-purple';
    if (depth < 1000) return 'text-glow-orange';
    if (depth < 2000) return 'text-orange-400';
    return 'text-glow-red';
  };

  const getDepthGlow = (depth: number) => {
    if (depth < 200) return 'shadow-[0_0_20px_rgba(0,255,204,0.3)]';
    if (depth < 500) return 'shadow-[0_0_20px_rgba(168,85,247,0.3)]';
    if (depth < 1000) return 'shadow-[0_0_20px_rgba(249,115,22,0.3)]';
    if (depth < 2000) return 'shadow-[0_0_20px_rgba(251,146,60,0.4)]';
    return 'shadow-[0_0_25px_rgba(255,68,68,0.5)]';
  };

  const colorClass = getDepthColor(depth);
  const glowClass = getDepthGlow(depth);

  return (
    <div className={cn('glass-panel p-4 flex items-center gap-3', glowClass)}>
      <Anchor size={24} className={colorClass} />
      <div className="flex flex-col">
        <span className="text-[10px] font-mono text-metal-400 uppercase tracking-wider">
          当前深度
        </span>
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              'text-3xl font-display font-bold tabular-nums',
              colorClass
            )}
            style={{
              textShadow: `0 0 10px currentColor, 0 0 20px currentColor`,
            }}
          >
            {Math.round(depth)}
          </span>
          <span className={cn('text-sm font-mono', colorClass)}>米</span>
        </div>
      </div>
      <div className="ml-auto flex flex-col items-end">
        <div className="h-16 w-2 bg-deep-sea-950 rounded-full overflow-hidden border border-metal-600/50">
          <div
            className={cn(
              'w-full rounded-full transition-all duration-500',
              depth < 200
                ? 'bg-glow-cyan'
                : depth < 500
                ? 'bg-glow-purple'
                : depth < 1000
                ? 'bg-glow-orange'
                : depth < 2000
                ? 'bg-orange-400'
                : 'bg-glow-red'
            )}
            style={{
              height: `${Math.min(100, (depth / 5000) * 100)}%`,
              boxShadow: '0 0 8px currentColor',
            }}
          />
        </div>
      </div>
    </div>
  );
};
