import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, FolderOpen, Settings, X } from 'lucide-react';
import { useSaveStore } from '@/store/useSaveStore';
import { useGameStore } from '@/store/useGameStore';

interface Bubble {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
}

export default function MainMenu() {
  const navigate = useNavigate();
  const { save, isLoaded, createNewSave, loadSave } = useSaveStore();
  const { setGameState, showMessage } = useGameStore();
  const [showNameModal, setShowNameModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    loadSave();
  }, [loadSave]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const initBubbles = () => {
      bubblesRef.current = [];
      for (let i = 0; i < 80; i++) {
        bubblesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 2 + Math.random() * 6,
          speed: 0.5 + Math.random() * 1.5,
          alpha: 0.2 + Math.random() * 0.4,
        });
      }
    };

    initBubbles();

    const render = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a1628');
      gradient.addColorStop(0.5, '#05101f');
      gradient.addColorStop(1, '#000510');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 5; i++) {
        const lightGradient = ctx.createRadialGradient(
          Math.sin(Date.now() * 0.0001 + i) * canvas.width * 0.3 + canvas.width * 0.5,
          canvas.height * 0.3 + i * 100,
          0,
          Math.sin(Date.now() * 0.0001 + i) * canvas.width * 0.3 + canvas.width * 0.5,
          canvas.height * 0.3 + i * 100,
          200 + i * 50
        );
        lightGradient.addColorStop(0, `rgba(0, 150, 255, ${0.03 + i * 0.01})`);
        lightGradient.addColorStop(1, 'rgba(0, 150, 255, 0)');
        ctx.fillStyle = lightGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
        const bubble = bubblesRef.current[i];
        bubble.y -= bubble.speed;
        bubble.x += Math.sin(Date.now() * 0.001 + bubble.size) * 0.3;

        if (bubble.y < -20) {
          bubble.y = canvas.height + 20;
          bubble.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(135, 206, 250, ${bubble.alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${bubble.alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
          bubble.x - bubble.size * 0.3,
          bubble.y - bubble.size * 0.3,
          bubble.size * 0.2,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.alpha})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleStartGame = () => {
    if (!save) {
      setShowNameModal(true);
    } else {
      setGameState('base');
      navigate('/base');
    }
  };

  const handleContinueGame = () => {
    if (save) {
      setGameState('base');
      navigate('/base');
    }
  };

  const handleCreatePlayer = () => {
    if (playerName.trim().length >= 2) {
      createNewSave(playerName.trim());
      setShowNameModal(false);
      setPlayerName('');
      showMessage('欢迎来到深海探险！', 'success');
      setTimeout(() => {
        setGameState('base');
        navigate('/base');
      }, 500);
    } else {
      showMessage('玩家名至少需要2个字符', 'warning');
    }
  };

  const handleSettings = () => {
    showMessage('设置功能开发中...', 'info');
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-cyan-400 text-xl animate-pulse">加载中...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="mb-16 text-center">
          <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse"
              style={{ textShadow: '0 0 40px rgba(0, 200, 255, 0.5)' }}>
            深海探险
          </h1>
          <p className="text-2xl text-cyan-300 tracking-widest opacity-80">
            DEEP SEA ADVENTURE
          </p>
          <div className="mt-4 text-cyan-500 text-sm opacity-60">
            探索未知深渊 · 收集神秘样本 · 升级你的潜艇
          </div>
        </div>

        <div className="flex flex-col gap-4 w-72">
          <button
            onClick={handleStartGame}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xl font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <Play size={28} />
            开始游戏
          </button>

          <button
            onClick={handleContinueGame}
            disabled={!save}
            className={`flex items-center justify-center gap-3 px-8 py-4 text-xl font-bold rounded-xl transition-all duration-300 transform ${
              save
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95'
                : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            }`}
          >
            <FolderOpen size={28} />
            继续游戏
          </button>

          <button
            onClick={handleSettings}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <Settings size={28} />
            设置
          </button>
        </div>

        {save && (
          <div className="mt-12 text-center">
            <p className="text-cyan-400 text-lg">
              欢迎回来，<span className="font-bold text-cyan-300">{save.playerName}</span>
            </p>
            <p className="text-slate-500 text-sm mt-1">
              信用点: {save.totalCredits} | 已解锁关卡: {save.unlockedLevels.length}
            </p>
          </div>
        )}

        <div className="absolute bottom-6 text-slate-600 text-sm">
          版本 1.0.0 © 2026 Deep Sea Studio
        </div>
      </div>

      {showNameModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl p-8 w-96 shadow-2xl shadow-cyan-500/20 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-cyan-400">创建玩家</h2>
              <button
                onClick={() => setShowNameModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-slate-300 mb-4">
              请输入你的探险家名字：
            </p>

            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePlayer()}
              placeholder="输入名字..."
              maxLength={12}
              className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 mb-6"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreatePlayer}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-colors"
              >
                开始探险
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
