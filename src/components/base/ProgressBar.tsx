import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'cyan' | 'red' | 'purple' | 'orange' | 'green';
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = 'cyan',
  label,
  showPercentage = false,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const isLow = percentage < 20;

  const colorMap = {
    cyan: {
      bg: 'from-glow-cyan/80 to-glow-cyan/40',
      glow: 'shadow-[0_0_10px_rgba(0,255,204,0.5),inset_0_0_5px_rgba(0,255,204,0.3)]',
      text: 'text-glow-cyan',
    },
    red: {
      bg: 'from-glow-red/80 to-glow-red/40',
      glow: 'shadow-[0_0_10px_rgba(255,68,68,0.5),inset_0_0_5px_rgba(255,68,68,0.3)]',
      text: 'text-glow-red',
    },
    purple: {
      bg: 'from-glow-purple/80 to-glow-purple/40',
      glow: 'shadow-[0_0_10px_rgba(168,85,247,0.5),inset_0_0_5px_rgba(168,85,247,0.3)]',
      text: 'text-glow-purple',
    },
    orange: {
      bg: 'from-glow-orange/80 to-glow-orange/40',
      glow: 'shadow-[0_0_10px_rgba(249,115,22,0.5),inset_0_0_5px_rgba(249,115,22,0.3)]',
      text: 'text-glow-orange',
    },
    green: {
      bg: 'from-emerald-400/80 to-emerald-400/40',
      glow: 'shadow-[0_0_10px_rgba(52,211,153,0.5),inset_0_0_5px_rgba(52,211,153,0.3)]',
      text: 'text-emerald-400',
    },
  };

  const colors = colorMap[color];

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className={cn('text-xs font-mono', colors.text)}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span className={cn('text-xs font-mono', colors.text, isLow && 'animate-pulse')}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="h-3 rounded-full overflow-hidden bg-deep-sea-950 border border-metal-600/50">
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out',
            colors.bg,
            colors.glow,
            isLow && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] font-mono text-metal-400">
          {Math.round(value)}
        </span>
        <span className="text-[10px] font-mono text-metal-400">
          {Math.round(max)}
        </span>
      </div>
    </div>
  );
};
