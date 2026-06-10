import * as React from 'react';
import { Package, Bug, Gem, Trash2, Scroll } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { SAMPLES, SampleType } from '@/data/samples';
import { cn } from '@/lib/utils';

const typeIcons: Record<SampleType, React.ReactNode> = {
  creature: <Bug size={12} />,
  mineral: <Gem size={12} />,
  debris: <Trash2 size={12} />,
  artifact: <Scroll size={12} />,
};

const typeLabels: Record<SampleType, string> = {
  creature: '生物',
  mineral: '矿物',
  debris: '残骸',
  artifact: '遗物',
};

const typeColors: Record<SampleType, string> = {
  creature: 'text-glow-cyan',
  mineral: 'text-glow-purple',
  debris: 'text-glow-orange',
  artifact: 'text-glow-pink',
};

export const SampleInventory: React.FC = () => {
  const { collectedSamples, submarineState } = useGameStore();

  if (!submarineState) return null;

  const { samples, maxSamples } = submarineState;

  const groupedSamples = React.useMemo(() => {
    const groups: Record<SampleType, typeof SAMPLES> = {
      creature: [],
      mineral: [],
      debris: [],
      artifact: [],
    };

    samples.forEach((sampleId) => {
      const sample = SAMPLES.find((s) => s.id === sampleId);
      if (sample) {
        groups[sample.type].push(sample);
      }
    });

    return groups;
  }, [samples]);

  const totalPoints = React.useMemo(() => {
    return samples.reduce((sum, sampleId) => {
      const sample = SAMPLES.find((s) => s.id === sampleId);
      return sum + (sample?.points || 0);
    }, 0);
  }, [samples]);

  const isFull = samples.length >= maxSamples;

  return (
    <div className="glass-panel p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-glow-cyan" />
          <h3 className="text-sm font-display font-bold text-glow-cyan">
            样本库存
          </h3>
        </div>
        <div
          className={cn(
            'text-xs font-mono tabular-nums',
            isFull ? 'text-glow-red animate-pulse' : 'text-metal-400'
          )}
        >
          {samples.length}/{maxSamples}
        </div>
      </div>

      <div className="h-2 rounded-full overflow-hidden bg-deep-sea-950 border border-metal-600/50 mb-4">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isFull
              ? 'bg-gradient-to-r from-glow-red/80 to-glow-red/40'
              : 'bg-gradient-to-r from-glow-cyan/80 to-glow-cyan/40'
          )}
          style={{
            width: `${(samples.length / maxSamples) * 100}%`,
            boxShadow: isFull
              ? '0 0 10px rgba(255, 68, 68, 0.5)'
              : '0 0 10px rgba(0, 255, 204, 0.5)',
          }}
        />
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {(Object.keys(groupedSamples) as SampleType[]).map((type) => {
          const typeSamples = groupedSamples[type];
          if (typeSamples.length === 0) return null;

          return (
            <div key={type}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={cn(typeColors[type])}>{typeIcons[type]}</span>
                <span
                  className={cn(
                    'text-[10px] font-mono uppercase tracking-wider',
                    typeColors[type]
                  )}
                >
                  {typeLabels[type]} ({typeSamples.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {typeSamples.map((sample) => (
                  <div
                    key={sample.id}
                    className="group relative w-8 h-8 rounded-lg border border-metal-600/50 bg-deep-sea-900/80 flex items-center justify-center"
                    style={{
                      boxShadow: `0 0 8px ${sample.glowColor}40`,
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: sample.glowColor,
                        boxShadow: `0 0 6px ${sample.glowColor}`,
                      }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-deep-sea-950 border border-glow-cyan/30 text-[10px] font-mono text-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                      <div className="font-medium">{sample.name}</div>
                      <div className="text-glow-orange">{sample.points} 点</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {samples.length === 0 && (
          <div className="text-center py-8">
            <Package size={32} className="mx-auto text-metal-600 mb-2" />
            <p className="text-xs text-metal-500">暂无样本</p>
          </div>
        )}
      </div>

      {samples.length > 0 && (
        <div className="mt-3 pt-3 border-t border-metal-600/30 flex items-center justify-between">
          <span className="text-[10px] font-mono text-metal-400">总价值</span>
          <span className="text-sm font-mono text-glow-orange">
            {totalPoints} 信用点
          </span>
        </div>
      )}
    </div>
  );
};
