import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Wrench, BookOpen, Coins, User, MapPin, Lock, Unlock, Star, ChevronRight, ArrowLeft, Zap, Battery, Shield, Radar, Gauge, Box } from 'lucide-react';
import { useSaveStore } from '@/store/useSaveStore';
import { useGameStore } from '@/store/useGameStore';
import { LEVELS } from '@/data/levels';
import { UPGRADES } from '@/data/upgrades';
import { SAMPLES } from '@/data/samples';

type TabType = 'missions' | 'upgrades' | 'logs';

export default function Base() {
  const navigate = useNavigate();
  const { save, upgradePart, hasEnoughCredits, unlockLevel, loadSave } = useSaveStore();
  const { setGameState, setCurrentLevel, showMessage } = useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('missions');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    loadSave();
  }, [loadSave]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 500;

    const render = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a1628');
      gradient.addColorStop(1, '#05101f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 30; i++) {
        const x = (Date.now() * 0.01 + i * 50) % (canvas.width + 100) - 50;
        const y = canvas.height - (i * 20 + Math.sin(Date.now() * 0.001 + i) * 10);
        const size = 1 + (i % 3);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(135, 206, 250, ${0.2 + (i % 5) * 0.1})`;
        ctx.fill();
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = 2.5;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);

      const bodyGradient = ctx.createLinearGradient(-20, -12, -20, 12);
      bodyGradient.addColorStop(0, '#4A90D9');
      bodyGradient.addColorStop(0.5, '#2E5A8A');
      bodyGradient.addColorStop(1, '#1A3A5C');

      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#87CEEB';
      ctx.beginPath();
      ctx.ellipse(8, -3, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      const engineLevel = save?.upgrades?.engine || 0;
      if (engineLevel > 0) {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-22, -10, 4 + engineLevel, 6);
        ctx.fillRect(-22, 4, 4 + engineLevel, 6);
      } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(-18, -14, 6, 4);
        ctx.fillRect(-18, 10, 6, 4);
      }

      const armorLevel = save?.upgrades?.armor || 0;
      if (armorLevel > 0) {
        ctx.strokeStyle = `rgba(100, 200, 255, ${armorLevel * 0.2})`;
        ctx.lineWidth = armorLevel;
        ctx.beginPath();
        ctx.ellipse(0, 0, 22 + armorLevel, 14 + armorLevel, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      const sonarLevel = save?.upgrades?.sonar || 0;
      if (sonarLevel > 0) {
        const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
        ctx.strokeStyle = `rgba(0, 255, 255, ${pulse * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 30 + sonarLevel * 5 + pulse * 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      const armLevel = save?.upgrades?.mechanicalArm || 0;
      if (armLevel > 0) {
        ctx.fillStyle = '#666';
        ctx.fillRect(15, -2, 10 + armLevel * 3, 4);
        ctx.beginPath();
        ctx.arc(25 + armLevel * 3, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      const oxygenLevel = save?.upgrades?.oxygenTank || 0;
      if (oxygenLevel > 0) {
        ctx.fillStyle = '#00BFFF';
        ctx.globalAlpha = 0.7;
        ctx.fillRect(-10, 8, 4 + oxygenLevel, 4);
        ctx.globalAlpha = 1;
      }

      const batteryLevel = save?.upgrades?.battery || 0;
      if (batteryLevel > 0) {
        ctx.fillStyle = '#FFD700';
        ctx.globalAlpha = 0.7;
        ctx.fillRect(-10, -12, 4 + batteryLevel, 4);
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      ctx.fillStyle = 'rgba(0, 200, 255, 0.1)';
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [save?.upgrades]);

  if (!save) {
    navigate('/');
    return null;
  }

  const handleStartLevel = (levelId: string) => {
    if (save.unlockedLevels.includes(levelId)) {
      setCurrentLevel(levelId);
      setGameState('playing');
      navigate(`/level/${levelId}`);
    } else {
      const level = LEVELS.find(l => l.id === levelId);
      if (level && level.unlockScore === 0) {
        unlockLevel(levelId);
        setCurrentLevel(levelId);
        setGameState('playing');
        navigate(`/level/${levelId}`);
      } else if (level && save.totalCredits >= level.unlockScore) {
        unlockLevel(levelId);
        showMessage(`已解锁关卡：${level.name}`, 'success');
      } else {
        showMessage(`需要 ${level?.unlockScore || 0} 信用点解锁`, 'warning');
      }
    }
  };

  const handleUpgrade = (upgradeId: string) => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const currentLevel = save.upgrades[upgradeId] || 0;
    const nextLevel = currentLevel + 1;

    if (nextLevel > upgrade.maxLevel) {
      showMessage('已达最高等级', 'info');
      return;
    }

    const cost = upgrade.costs[currentLevel];
    if (!hasEnoughCredits(cost)) {
      showMessage(`需要 ${cost} 信用点`, 'warning');
      return;
    }

    if (upgradePart(upgradeId, nextLevel)) {
      showMessage(`${upgrade.name} 升级到 Lv.${nextLevel}`, 'success');
    }
  };

  const getUpgradeIcon = (upgradeId: string) => {
    switch (upgradeId) {
      case 'engine': return <Gauge size={24} />;
      case 'oxygenTank': return <Box size={24} />;
      case 'battery': return <Battery size={24} />;
      case 'mechanicalArm': return <Wrench size={24} />;
      case 'sonar': return <Radar size={24} />;
      case 'armor': return <Shield size={24} />;
      default: return <Zap size={24} />;
    }
  };

  const getRarityColor = (rarity: number) => {
    const colors = ['#9CA3AF', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];
    return colors[rarity - 1] || colors[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-cyan-500/20 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-cyan-400">深海基地</h1>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-slate-300">
              <User size={18} className="text-cyan-400" />
              <span className="font-medium">{save.playerName}</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <Coins size={18} />
              <span className="font-bold">{save.totalCredits}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <MapPin size={18} />
              <span>已解锁 {save.unlockedLevels.length}/{LEVELS.length} 区域</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 p-6 max-w-7xl mx-auto">
        <div className="w-80 flex-shrink-0">
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="flex border-b border-slate-700/50">
              <button
                onClick={() => setActiveTab('missions')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 transition-colors ${
                  activeTab === 'missions'
                    ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Map size={18} />
                任务
              </button>
              <button
                onClick={() => setActiveTab('upgrades')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 transition-colors ${
                  activeTab === 'upgrades'
                    ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wrench size={18} />
                改装
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 transition-colors ${
                  activeTab === 'logs'
                    ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen size={18} />
                日志
              </button>
            </div>

            <div className="p-4 max-h-[600px] overflow-y-auto">
              {activeTab === 'missions' && (
                <div className="space-y-3">
                  {LEVELS.map((level) => {
                    const isUnlocked = save.unlockedLevels.includes(level.id);
                    const canUnlock = save.totalCredits >= level.unlockScore;
                    const highScore = save.highScores[level.id] || 0;

                    return (
                      <div
                        key={level.id}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isUnlocked
                            ? 'bg-slate-700/50 border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-700'
                            : canUnlock
                            ? 'bg-slate-700/30 border-yellow-500/30 hover:border-yellow-400'
                            : 'bg-slate-800/50 border-slate-700/50 opacity-60'
                        }`}
                        onClick={() => handleStartLevel(level.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {isUnlocked ? (
                              <Unlock size={16} className="text-cyan-400" />
                            ) : (
                              <Lock size={16} className={canUnlock ? 'text-yellow-400' : 'text-slate-500'} />
                            )}
                            <h3 className={`font-bold ${isUnlocked ? 'text-cyan-300' : 'text-slate-400'}`}>
                              {level.name}
                            </h3>
                          </div>
                          {highScore > 0 && (
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star size={14} fill="currentColor" />
                              <span className="text-sm font-medium">{highScore}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                          {level.description}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">深度 {level.depth}m</span>
                          {!isUnlocked && (
                            <span className={canUnlock ? 'text-yellow-400' : 'text-slate-500'}>
                              解锁需要 {level.unlockScore} 信用点
                            </span>
                          )}
                          {isUnlocked && (
                            <span className="text-cyan-400 flex items-center gap-1">
                              出发 <ChevronRight size={14} />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'upgrades' && (
                <div className="space-y-3">
                  {UPGRADES.map((upgrade) => {
                    const currentLevel = save.upgrades[upgrade.id] || 0;
                    const isMaxLevel = currentLevel >= upgrade.maxLevel;
                    const cost = isMaxLevel ? 0 : upgrade.costs[currentLevel];
                    const canAfford = hasEnoughCredits(cost);

                    return (
                      <div
                        key={upgrade.id}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isMaxLevel
                            ? 'bg-slate-700/30 border-emerald-500/30'
                            : canAfford
                            ? 'bg-slate-700/50 border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-700'
                            : 'bg-slate-700/30 border-slate-600/30'
                        }`}
                        onClick={() => handleUpgrade(upgrade.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            isMaxLevel ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
                          }`}>
                            {getUpgradeIcon(upgrade.id)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-white">{upgrade.name}</h3>
                              <span className={`text-sm font-bold ${
                                isMaxLevel ? 'text-emerald-400' : 'text-cyan-400'
                              }`}>
                                Lv.{currentLevel}/{upgrade.maxLevel}
                              </span>
                            </div>
                            <p className="text-slate-400 text-sm mb-2">{upgrade.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-1">
                                {Array.from({ length: upgrade.maxLevel }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-6 h-2 rounded-full ${
                                      i < currentLevel ? 'bg-cyan-400' : 'bg-slate-600'
                                    }`}
                                  />
                                ))}
                              </div>
                              {!isMaxLevel && (
                                <span className={`text-sm font-medium ${
                                  canAfford ? 'text-yellow-400' : 'text-slate-500'
                                }`}>
                                  <Coins size={14} className="inline mr-1" />
                                  {cost}
                                </span>
                              )}
                              {isMaxLevel && (
                                <span className="text-sm text-emerald-400 font-medium">已满级</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="space-y-3">
                  {save.collectedSamples.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                      <p>还没有收集到任何样本</p>
                      <p className="text-sm">出发探索深海吧！</p>
                    </div>
                  ) : (
                    SAMPLES.filter(s => save.collectedSamples.includes(s.id))
                      .sort((a, b) => b.rarity - a.rarity)
                      .map((sample) => (
                        <div
                          key={sample.id}
                          className="p-4 rounded-xl bg-slate-700/50 border border-slate-600/50"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: sample.glowColor + '30',
                                boxShadow: `0 0 15px ${sample.glowColor}40`,
                              }}
                            >
                              <div
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: sample.glowColor }}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-white">{sample.name}</h3>
                                <div className="flex gap-0.5">
                                  {Array.from({ length: sample.rarity }).map((_, i) => (
                                    <Star
                                      key={i}
                                      size={12}
                                      fill={getRarityColor(sample.rarity)}
                                      color={getRarityColor(sample.rarity)}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-slate-400 text-sm mb-2">{sample.description}</p>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">{sample.type === 'creature' ? '生物' : sample.type === 'mineral' ? '矿物' : sample.type === 'debris' ? '残骸' : sample.type === 'artifact' ? '制品' : sample.type}</span>
                                <span className="text-yellow-400 font-medium">{sample.points} 点</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-6">
            <h2 className="text-xl font-bold text-cyan-400 text-center mb-4">潜艇预览</h2>
            <canvas
              ref={canvasRef}
              className="rounded-xl border border-cyan-500/20"
            />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {UPGRADES.map((upgrade) => {
                const level = save.upgrades[upgrade.id] || 0;
                return (
                  <div
                    key={upgrade.id}
                    className={`p-2 rounded-lg text-center ${
                      level > 0 ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-slate-700/30 border border-slate-600/30'
                    }`}
                  >
                    <div className={`text-lg mb-1 ${level > 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
                      {getUpgradeIcon(upgrade.id)}
                    </div>
                    <div className={`text-xs font-medium ${level > 0 ? 'text-cyan-300' : 'text-slate-500'}`}>
                      {upgrade.name} Lv.{level}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-72 flex-shrink-0">
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-4">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">潜艇状态</h3>
            
            <div className="space-y-4">
              {UPGRADES.map((upgrade) => {
                const level = save.upgrades[upgrade.id] || 0;
                const effect = level > 0 ? upgrade.effects[level - 1] : null;
                
                return (
                  <div key={upgrade.id} className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded ${level > 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-600/30 text-slate-500'}`}>
                        {getUpgradeIcon(upgrade.id)}
                      </div>
                      <span className={`text-sm font-medium ${level > 0 ? 'text-white' : 'text-slate-500'}`}>
                        {upgrade.name}
                      </span>
                      <span className={`ml-auto text-xs font-bold ${level > 0 ? 'text-cyan-400' : 'text-slate-600'}`}>
                        Lv.{level}
                      </span>
                    </div>
                    {effect && (
                      <div className="text-xs text-slate-400 pl-9">
                        {Object.entries(effect).map(([key, value]) => (
                          <div key={key}>
                            +{value} {key === 'speed' ? '速度' : 
                                key === 'oxygen' ? '氧气' : 
                                key === 'battery' ? '电量' : 
                                key === 'hull' ? '船体' : 
                                key === 'armRange' ? '臂展' : 
                                key === 'armSpeed' ? '臂速' : 
                                key === 'sonarRange' ? '声呐范围' : 
                                key === 'sonarAccuracy' ? '声呐精度' : key}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-1">
                  {Object.values(save.upgrades).reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-sm text-slate-400">总升级等级</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
