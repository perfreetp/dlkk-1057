import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pause, Play, Home, LogOut, Gauge, Clock, Package, Lightbulb, Radio, Hand } from 'lucide-react';
import { Engine } from '@/game/Engine';
import { Renderer } from '@/game/renderer/Renderer';
import { useSaveStore } from '@/store/useSaveStore';
import { useGameStore } from '@/store/useGameStore';
import { LEVELS } from '@/data/levels';
import { SAMPLES } from '@/data/samples';

export default function GameLevel() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { save, addCredits, addSampleToCollection, setHighScore, unlockLevel } = useSaveStore();
  const {
    gameState,
    setGameState,
    setSettlementResult,
    togglePause,
    showMessage,
    resetGame,
    updateSubmarineState,
    updateObjectives,
    setGameTime,
  } = useGameStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const animationRef = useRef<number>();
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [hudData, setHudData] = useState({
    oxygen: 100,
    maxOxygen: 100,
    battery: 100,
    maxBattery: 100,
    hull: 100,
    maxHull: 100,
    depth: 0,
    time: 0,
    timeLimit: 180,
    score: 0,
    samples: [] as string[],
    maxSamples: 5,
    objectives: [] as Array<{ id: string; name: string; description: string; currentCount: number; target: number; completed: boolean }>,
  });

  const level = LEVELS.find(l => l.id === id);

  const handleGameEnd = useCallback(() => {
    if (!engineRef.current) return;

    const settlement = engineRef.current.getSettlementResult();
    if (settlement && save) {
      addCredits(settlement.creditsEarned);
      setHighScore(id!, settlement.score);

      const collectedSamples = engineRef.current.getState()?.level?.id
        ? engineRef.current.level?.collectedSamples || []
        : [];
      
      collectedSamples.forEach(sampleId => {
        addSampleToCollection(sampleId);
      });

      const nextLevelIndex = LEVELS.findIndex(l => l.id === id) + 1;
      if (nextLevelIndex < LEVELS.length && settlement.stars >= 1) {
        const nextLevel = LEVELS[nextLevelIndex];
        if (save.totalCredits + settlement.creditsEarned >= nextLevel.unlockScore) {
          unlockLevel(nextLevel.id);
          (settlement.newUnlocks as string[]).push(nextLevel.id);
        }
      }

      setSettlementResult(settlement);
      setGameState('settlement');
      
      setTimeout(() => {
        navigate('/settlement');
      }, 500);
    }
  }, [id, save, addCredits, addSampleToCollection, setHighScore, unlockLevel, setSettlementResult, setGameState, navigate]);

  useEffect(() => {
    if (!id || !save) {
      navigate('/');
      return;
    }

    const levelConfig = LEVELS.find(l => l.id === id);
    if (!levelConfig) {
      showMessage('关卡不存在', 'error');
      navigate('/base');
      return;
    }

    if (!save.unlockedLevels.includes(id)) {
      showMessage('关卡未解锁', 'warning');
      navigate('/base');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (rendererRef.current) {
        rendererRef.current.resize(canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const engine = new Engine();
    const renderer = new Renderer(canvas);

    engineRef.current = engine;
    rendererRef.current = renderer;

    engine.startGame(id, save.upgrades);
    setGameState('playing');

    const gameLoop = () => {
      const currentState = engine.gameState;
      
      if (currentState === 'playing') {
        engine.update();
        
        const state = engine.getState();
        if (state) {
          setHudData({
            oxygen: state.submarine.oxygen,
            maxOxygen: state.submarine.maxOxygen,
            battery: state.submarine.battery,
            maxBattery: state.submarine.maxBattery,
            hull: state.submarine.hull,
            maxHull: state.submarine.maxHull,
            depth: state.submarine.depth,
            time: state.level.currentTime,
            timeLimit: state.level.timeLimit,
            score: state.level.score,
            samples: state.submarine.samples,
            maxSamples: state.submarine.maxSamples,
            objectives: state.level.objectives,
          });

          updateSubmarineState(state.submarine);
          updateObjectives(state.level.objectives.map(obj => ({
            id: obj.id,
            type: 'collect',
            name: obj.name,
            description: obj.description,
            target: obj.target,
            currentCount: obj.currentCount,
            reward: obj.reward,
            optional: false,
          })));
          setGameTime(state.level.currentTime);
        }

        renderer.render(engine.getState()!, engine.level, engine.submarine, engine.getDeltaTime());
      } else if (currentState === 'paused') {
        const state = engine.getState();
        if (state) {
          renderer.render(state, engine.level, engine.submarine, 0);
        }
      }

      if (engine.gameState === 'settlement') {
        handleGameEnd();
        return;
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [id, save, navigate, showMessage, setGameState, updateSubmarineState, updateObjectives, setGameTime, handleGameEnd]);

  const handleResume = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resumeGame();
      setShowPauseMenu(false);
      togglePause();
    }
  }, [togglePause]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          engineRef.current.setInput({ up: true });
          break;
        case 's':
        case 'arrowdown':
          engineRef.current.setInput({ down: true });
          break;
        case 'a':
        case 'arrowleft':
          engineRef.current.setInput({ left: true });
          break;
        case 'd':
        case 'arrowright':
          engineRef.current.setInput({ right: true });
          break;
        case ' ':
          e.preventDefault();
          engineRef.current.setInput({ action1: true });
          break;
        case 'e':
          engineRef.current.setInput({ action2: true });
          break;
        case 'q':
          engineRef.current.setInput({ action3: true });
          break;
        case 'f':
          engineRef.current.setInput({ action4: true });
          break;
        case 'escape':
          e.preventDefault();
          if (gameState === 'playing') {
            engineRef.current.pauseGame();
            setShowPauseMenu(true);
            togglePause();
          } else if (gameState === 'paused') {
            handleResume();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          engineRef.current.setInput({ up: false });
          break;
        case 's':
        case 'arrowdown':
          engineRef.current.setInput({ down: false });
          break;
        case 'a':
        case 'arrowleft':
          engineRef.current.setInput({ left: false });
          break;
        case 'd':
        case 'arrowright':
          engineRef.current.setInput({ right: false });
          break;
        case ' ':
          engineRef.current.setInput({ action1: false });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, togglePause, handleResume]);

  const handleReturnToBase = () => {
    if (engineRef.current) {
      engineRef.current.returnToMenu();
    }
    resetGame();
    setGameState('base');
    navigate('/base');
  };

  const handleQuitGame = () => {
    if (engineRef.current) {
      engineRef.current.returnToMenu();
    }
    resetGame();
    setGameState('menu');
    navigate('/');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getResourceColor = (value: number, max: number) => {
    const percent = value / max;
    if (percent > 0.5) return 'bg-cyan-500';
    if (percent > 0.25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCollectedSampleInfo = (sampleId: string) => {
    return SAMPLES.find(s => s.id === sampleId);
  };

  if (!level) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-red-400 text-xl">关卡不存在</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none z-10">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30 pointer-events-auto">
          <div className="flex items-center gap-2 mb-2">
            <Gauge size={16} className="text-cyan-400" />
            <span className="text-cyan-400 font-mono text-lg">
              {Math.floor(hudData.depth)}m
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-yellow-400" />
            <span className={`font-mono text-lg ${
              hudData.timeLimit - hudData.time < 30 ? 'text-red-400 animate-pulse' : 'text-yellow-400'
            }`}>
              {formatTime(hudData.timeLimit - hudData.time)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">分数:</span>
            <span className="text-emerald-400 font-bold">{hudData.score}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-64 pointer-events-auto">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 border border-cyan-500/30">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-cyan-400">氧气</span>
              <span className="text-slate-400">{Math.floor(hudData.oxygen)}/{hudData.maxOxygen}</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getResourceColor(hudData.oxygen, hudData.maxOxygen)}`}
                style={{ width: `${(hudData.oxygen / hudData.maxOxygen) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 border border-yellow-500/30">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-yellow-400">电量</span>
              <span className="text-slate-400">{Math.floor(hudData.battery)}/{hudData.maxBattery}</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getResourceColor(hudData.battery, hudData.maxBattery)}`}
                style={{ width: `${(hudData.battery / hudData.maxBattery) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 border border-emerald-500/30">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-emerald-400">船体</span>
              <span className="text-slate-400">{Math.floor(hudData.hull)}/{hudData.maxHull}</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getResourceColor(hudData.hull, hudData.maxHull)}`}
                style={{ width: `${(hudData.hull / hudData.maxHull) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (engineRef.current && gameState === 'playing') {
              engineRef.current.pauseGame();
              setShowPauseMenu(true);
              togglePause();
            }
          }}
          className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-slate-600/30 hover:border-cyan-500/50 transition-colors pointer-events-auto"
        >
          <Pause size={24} className="text-slate-300" />
        </button>
      </div>

      <div className="absolute top-4 right-4 mt-20 w-72 pointer-events-none z-10">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30 pointer-events-auto">
          <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
            <Package size={16} />
            任务目标
          </h3>
          <div className="space-y-2">
            {hudData.objectives.map((obj) => (
              <div
                key={obj.id}
                className={`p-2 rounded-lg text-sm ${
                  obj.completed
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-slate-800/50 border border-slate-600/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={obj.completed ? 'text-emerald-400' : 'text-slate-300'}>
                    {obj.completed ? '✓ ' : '○ '}{obj.description}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {obj.currentCount}/{obj.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute left-4 top-40 w-48 pointer-events-none z-10">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-cyan-500/30 pointer-events-auto">
          <h3 className="text-cyan-400 font-bold mb-2 text-sm flex items-center gap-2">
            <Package size={14} />
            样本库存
          </h3>
          <div className="text-xs text-slate-400 mb-2">
            {hudData.samples.length}/{hudData.maxSamples}
          </div>
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: hudData.maxSamples }).map((_, i) => {
              const sampleId = hudData.samples[i];
              const sample = sampleId ? getCollectedSampleInfo(sampleId) : null;
              return (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    sample
                      ? 'border-2'
                      : 'bg-slate-700/50 border border-slate-600/30'
                  }`}
                  style={sample ? {
                    backgroundColor: sample.glowColor + '30',
                    borderColor: sample.glowColor,
                  } : {}}
                  title={sample?.name || '空'}
                >
                  {sample && (
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: sample.glowColor }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-slate-600/30 pointer-events-auto">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center mb-1 border border-slate-600/50">
                <span className="text-slate-300 font-bold">W</span>
              </div>
              <div className="flex gap-1">
                <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center border border-slate-600/50">
                  <span className="text-slate-300 font-bold">A</span>
                </div>
                <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center border border-slate-600/50">
                  <span className="text-slate-300 font-bold">S</span>
                </div>
                <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center border border-slate-600/50">
                  <span className="text-slate-300 font-bold">D</span>
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">移动</span>
            </div>

            <div className="h-16 w-px bg-slate-700" />

            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-1 border border-cyan-500/50">
                <Hand size={20} className="text-cyan-400" />
              </div>
              <span className="text-xs text-slate-500">空格 采集</span>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-1 border border-yellow-500/50">
                <Lightbulb size={20} className="text-yellow-400" />
              </div>
              <span className="text-xs text-slate-500">F 灯光</span>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-1 border border-emerald-500/50">
                <Radio size={20} className="text-emerald-400" />
              </div>
              <span className="text-xs text-slate-500">Q 声呐</span>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-1 border border-purple-500/50">
                <Hand size={20} className="text-purple-400" />
              </div>
              <span className="text-xs text-slate-500">E 机械臂</span>
            </div>

            <div className="h-16 w-px bg-slate-700" />

            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center mb-1 border border-slate-600/50">
                <Pause size={20} className="text-slate-400" />
              </div>
              <span className="text-xs text-slate-500">ESC 暂停</span>
            </div>
          </div>
        </div>
      </div>

      {showPauseMenu && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl p-8 w-96 shadow-2xl border border-cyan-500/30">
            <h2 className="text-3xl font-bold text-cyan-400 text-center mb-8">游戏暂停</h2>

            <div className="space-y-4">
              <button
                onClick={handleResume}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all"
              >
                <Play size={24} />
                继续游戏
              </button>

              <button
                onClick={handleReturnToBase}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
              >
                <Home size={24} />
                返回基地
              </button>

              <button
                onClick={handleQuitGame}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-bold rounded-xl transition-all border border-red-500/30"
              >
                <LogOut size={24} />
                退出游戏
              </button>
            </div>

            <div className="mt-6 p-4 bg-slate-700/30 rounded-xl">
              <h4 className="text-slate-300 font-medium mb-2">当前进度</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-500">已用时间</div>
                <div className="text-cyan-400 text-right">{formatTime(hudData.time)}</div>
                <div className="text-slate-500">当前分数</div>
                <div className="text-yellow-400 text-right">{hudData.score}</div>
                <div className="text-slate-500">已采集样本</div>
                <div className="text-emerald-400 text-right">{hudData.samples.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
