import * as React from 'react';
import { Target, Check, Circle } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

export const ObjectivePanel: React.FC = () => {
  const { objectives } = useGameStore();

  const mainObjectives = objectives.filter((o) => !o.optional);
  const optionalObjectives = objectives.filter((o) => o.optional);

  return (
    <div className="glass-panel p-4 w-72">
      <div className="flex items-center gap-2 mb-3">
        <Target size={16} className="text-glow-cyan" />
        <h3 className="text-sm font-display font-bold text-glow-cyan">
          任务目标
        </h3>
      </div>

      <div className="space-y-3">
        {mainObjectives.length > 0 && (
          <div className="space-y-2">
            {mainObjectives.map((objective) => {
              const isCompleted = objective.currentCount >= objective.target;
              const progress = Math.min(
                100,
                (objective.currentCount / objective.target) * 100
              );

              return (
                <div
                  key={objective.id}
                  className={cn(
                    'p-2 rounded-lg border transition-all duration-300',
                    isCompleted
                      ? 'bg-emerald-900/20 border-emerald-500/30'
                      : 'bg-deep-sea-900/50 border-metal-600/30'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Circle size={14} className="text-metal-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-xs font-medium',
                          isCompleted ? 'text-emerald-400' : 'text-slate-300'
                        )}
                      >
                        {objective.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-deep-sea-950 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              isCompleted
                                ? 'bg-emerald-400'
                                : 'bg-glow-cyan'
                            )}
                            style={{
                              width: `${progress}%`,
                              boxShadow: isCompleted
                                ? '0 0 6px rgba(52, 211, 153, 0.5)'
                                : '0 0 6px rgba(0, 255, 204, 0.5)',
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-metal-400 tabular-nums">
                          {objective.currentCount}/{objective.target}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-glow-orange mt-1">
                        奖励: {objective.reward} 信用点
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {optionalObjectives.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-metal-600/30">
            <p className="text-[10px] font-mono text-metal-500 uppercase tracking-wider">
              可选目标
            </p>
            {optionalObjectives.map((objective) => {
              const isCompleted = objective.currentCount >= objective.target;
              const progress = Math.min(
                100,
                (objective.currentCount / objective.target) * 100
              );

              return (
                <div
                  key={objective.id}
                  className={cn(
                    'p-2 rounded-lg border transition-all duration-300',
                    isCompleted
                      ? 'bg-emerald-900/20 border-emerald-500/30'
                      : 'bg-deep-sea-900/30 border-metal-700/20'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <Check size={14} className="text-emerald-400/70" />
                      ) : (
                        <Circle size={14} className="text-metal-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-xs font-medium',
                          isCompleted ? 'text-emerald-400/70' : 'text-metal-400'
                        )}
                      >
                        {objective.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-deep-sea-950 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              isCompleted
                                ? 'bg-emerald-400/50'
                                : 'bg-metal-500'
                            )}
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-metal-500 tabular-nums">
                          {objective.currentCount}/{objective.target}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-glow-orange/70 mt-1">
                        奖励: {objective.reward} 信用点
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {objectives.length === 0 && (
          <p className="text-xs text-metal-500 text-center py-4">
            暂无任务目标
          </p>
        )}
      </div>
    </div>
  );
};
