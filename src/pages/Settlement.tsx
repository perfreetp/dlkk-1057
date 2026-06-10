import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Home, RotateCcw, Coins, MapPin, Package, Clock, Award, ChevronRight, Unlock } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { useSaveStore } from '@/store/useSaveStore';
import { SAMPLES } from '@/data/samples';
import { LEVELS } from '@/data/levels';

export default function Settlement() {
  const navigate = useNavigate();
  const { settlementResult, currentLevelId, resetGame, setGameState, showMessage } = useGameStore();
  const { save } = useSaveStore();
  const [showAnimation, setShowAnimation] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayCredits, setDisplayCredits] = useState(0);

  const level = LEVELS.find(l => l.id === currentLevelId);
  const isVictory = settlementResult && settlementResult.stars >= 1;

  useEffect(() => {
    if (!settlementResult || !save) {
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [settlementResult, save, navigate]);

  useEffect(() => {
    if (showAnimation && settlementResult) {
      const scoreDuration = 1500;
      const creditsDuration = 1500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        
        if (elapsed < scoreDuration) {
          const progress = Math.min(elapsed / scoreDuration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          setDisplayScore(Math.floor(settlementResult.score * easeProgress));
        } else {
          setDisplayScore(settlementResult.score);
        }

        if (elapsed < creditsDuration) {
          const progress = Math.min(elapsed / creditsDuration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          setDisplayCredits(Math.floor(settlementResult.creditsEarned * easeProgress));
        } else {
          setDisplayCredits(settlementResult.creditsEarned);
        }

        if (elapsed < Math.max(scoreDuration, creditsDuration)) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }
  }, [showAnimation, settlementResult]);

  if (!settlementResult) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-cyan-400 text-xl animate-pulse">加载中...</div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}分${secs}秒`;
  };

  const handleReturnToBase = () => {
    resetGame();
    setGameState('base');
    navigate('/base');
  };

  const handleReplayLevel = () => {
    if (currentLevelId && save?.unlockedLevels.includes(currentLevelId)) {
      resetGame();
      setGameState('playing');
      navigate(`/level/${currentLevelId}`);
    } else {
      showMessage('关卡未解锁', 'warning');
    }
  };

  const getRarityColor = (rarity: number) => {
    const colors = ['#9CA3AF', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];
    return colors[rarity - 1] || colors[0];
  };

  const newSamples = settlementResult.newUnlocks
    .map(id => SAMPLES.find(s => s.id === id))
    .filter(Boolean);

  const newLevels = settlementResult.newUnlocks
    .map(id => LEVELS.find(l => l.id === id))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className={`max-w-4xl w-full transition-all duration-700 ${
        showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="text-center mb-8">
          <h1 className={`text-5xl font-bold mb-4 ${
            isVictory ? 'text-cyan-400' : 'text-red-400'
          }`}>
            {isVictory ? '任务完成！' : '任务失败'}
          </h1>
          {level && (
            <p className="text-slate-400 text-xl">{level.name}</p>
          )}
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex gap-4">
            {[1, 2, 3].map((starIndex) => (
              <div
                key={starIndex}
                className={`transition-all duration-500 ${
                  showAnimation ? 'scale-100' : 'scale-0'
                }`}
                style={{ transitionDelay: `${starIndex * 200 + 500}ms` }}
              >
                <Star
                  size={80}
                  className={`${
                    settlementResult.stars >= starIndex
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-600'
                  }`}
                  style={{
                    filter: settlementResult.stars >= starIndex
                      ? 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.5))'
                      : 'none',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <Award size={24} />
              详细得分
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Package size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">任务完成度</div>
                    <div className="text-slate-500 text-sm">
                      {settlementResult.objectivesCompleted} 个目标完成
                    </div>
                  </div>
                </div>
                <div className="text-cyan-400 font-bold text-xl">
                  {Math.floor(settlementResult.score * 0.6)}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Star size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">样本质量</div>
                    <div className="text-slate-500 text-sm">
                      采集 {settlementResult.samplesCollected} 个样本
                    </div>
                  </div>
                </div>
                <div className="text-emerald-400 font-bold text-xl">
                  {Math.floor(settlementResult.score * 0.25)}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Clock size={20} className="text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">用时奖励</div>
                    <div className="text-slate-500 text-sm">
                      用时 {formatTime(settlementResult.timeUsed)}
                    </div>
                  </div>
                </div>
                <div className="text-yellow-400 font-bold text-xl">
                  {Math.floor(settlementResult.score * 0.15)}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-lg">总分</span>
                <span className="text-4xl font-bold text-white">
                  {displayScore}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-2xl p-6 border border-yellow-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Coins size={28} className="text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-yellow-400 font-bold text-lg">获得信用点</div>
                    <div className="text-slate-500 text-sm">可用于升级潜艇</div>
                  </div>
                </div>
                <div className="text-4xl font-bold text-yellow-400">
                  +{displayCredits}
                </div>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-1000"
                  style={{
                    width: showAnimation ? `${Math.min((displayCredits / 1000) * 100, 100)}%` : '0%',
                  }}
                />
              </div>
            </div>

            {newLevels.length > 0 && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-6 border border-emerald-500/30">
                <h3 className="text-emerald-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  新解锁区域
                </h3>
                <div className="space-y-3">
                  {newLevels.map((lvl) => lvl && (
                    <div
                      key={lvl.id}
                      className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <Unlock size={20} className="text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{lvl.name}</div>
                          <div className="text-slate-500 text-sm">深度 {lvl.depth}m</div>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-emerald-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newSamples.length > 0 && (
              <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-2xl p-6 border border-purple-500/30">
                <h3 className="text-purple-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Package size={20} />
                  新收集的样本
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {newSamples.map((sample) => sample && (
                    <div
                      key={sample.id}
                      className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl"
                    >
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
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{sample.name}</div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: sample.rarity }).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              fill={getRarityColor(sample.rarity)}
                              color={getRarityColor(sample.rarity)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-6">
          <button
            onClick={handleReturnToBase}
            className="flex items-center gap-3 px-10 py-4 bg-slate-700 hover:bg-slate-600 text-white text-xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <Home size={28} />
            返回基地
          </button>

          {isVictory && (
            <button
              onClick={handleReplayLevel}
              className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xl font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <RotateCcw size={28} />
              重玩本关
            </button>
          )}
        </div>

        {!isVictory && (
          <div className="mt-8 text-center">
            <p className="text-slate-500 mb-4">不要灰心！升级你的潜艇再来挑战吧。</p>
            <button
              onClick={handleReplayLevel}
              className="flex items-center gap-3 px-10 py-4 mx-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xl font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <RotateCcw size={28} />
              再试一次
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
