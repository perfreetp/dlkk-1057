import * as React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { LEVELS } from '@/data/levels';
import { cn } from '@/lib/utils';

export const GameTimer: React.FC = () => {
  const { gameTime, currentLevelId } = useGameStore();

  const currentLevel = LEVELS.find((l) => l.id === currentLevelId);
  const timeLimit = currentLevel?.timeLimit || 0;

  const isReturnLevel = currentLevelId === 'level7';
  const remainingTime = Math.max(0, timeLimit - gameTime);
  const isLowTime = remainingTime < 30;
  const isCritical = remainingTime < 10;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (timeLimit === 0) return null;

  return (
    <div
      className={cn(
        'glass-panel p-4 flex items-center gap-3',
        isReturnLevel && isLowTime && 'border-glow-red/50',
        isReturnLevel &&
          isLowTime &&
          'shadow-[0_0_30px_rgba(255,68,68,0.4),inset_0_0_20px_rgba(255,68,68,0.1)]'
      )}
    >
      <div
        className={cn(
          'p-2 rounded-lg',
          isReturnLevel && isLowTime
            ? 'bg-glow-red/20 text-glow-red'
            : 'bg-glow-cyan/10 text-glow-cyan'
        )}
      >
        {isReturnLevel && isCritical ? (
          <AlertTriangle
            size={24}
            className={cn(isCritical && 'animate-pulse')}
          />
        ) : (
          <Clock size={24} />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-mono text-metal-400 uppercase tracking-wider">
          {isReturnLevel ? '返航倒计时' : '剩余时间'}
        </span>
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              'text-2xl font-display font-bold tabular-nums',
              isReturnLevel && isLowTime
                ? 'text-glow-red'
                : 'text-glow-cyan'
            )}
            style={{
              textShadow:
                isReturnLevel && isLowTime
                  ? '0 0 15px rgba(255, 68, 68, 0.8), 0 0 30px rgba(255, 68, 68, 0.4)'
                  : '0 0 10px rgba(0, 255, 204, 0.5)',
              animation:
                isReturnLevel && isCritical ? 'pulse 0.5s ease-in-out infinite' : 'none',
            }}
          >
            {formatTime(remainingTime)}
          </span>
        </div>
      </div>
      <div className="ml-auto flex flex-col items-end">
        <div className="w-24 h-2 bg-deep-sea-950 rounded-full overflow-hidden border border-metal-600/50">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isReturnLevel && isLowTime
                ? 'bg-gradient-to-r from-glow-red/80 to-glow-red/40'
                : 'bg-gradient-to-r from-glow-cyan/80 to-glow-cyan/40'
            )}
            style={{
              width: `${(remainingTime / timeLimit) * 100}%`,
              boxShadow:
                isReturnLevel && isLowTime
                  ? '0 0 10px rgba(255, 68, 68, 0.6)'
                  : '0 0 10px rgba(0, 255, 204, 0.5)',
            }}
          />
        </div>
        <span className="text-[10px] font-mono text-metal-500 mt-1">
          已用 {formatTime(gameTime)} / {formatTime(timeLimit)}
        </span>
      </div>
      {isReturnLevel && isLowTime && (
        <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-glow-red rounded text-[10px] font-mono text-white animate-pulse">
          紧急
        </div>
      )}
    </div>
  );
};
