import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import MainMenu from '@/pages/MainMenu';
import Base from '@/pages/Base';
import GameLevel from '@/pages/GameLevel';
import Settlement from '@/pages/Settlement';
import { useGameStore } from '@/store/useGameStore';

function GlobalMessage() {
  const { message, clearMessage } = useGameStore();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        clearMessage();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);

  if (!message) return null;

  const getMessageStyle = () => {
    switch (message.type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/50',
          icon: <CheckCircle size={20} className="text-emerald-400" />,
          text: 'text-emerald-300',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          icon: <AlertTriangle size={20} className="text-yellow-400" />,
          text: 'text-yellow-300',
        };
      case 'error':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          icon: <AlertCircle size={20} className="text-red-400" />,
          text: 'text-red-300',
        };
      default:
        return {
          bg: 'bg-cyan-500/20',
          border: 'border-cyan-500/50',
          icon: <Info size={20} className="text-cyan-400" />,
          text: 'text-cyan-300',
        };
    }
  };

  const style = getMessageStyle();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-xl ${style.bg} border ${style.border} backdrop-blur-sm shadow-lg`}>
        {style.icon}
        <span className={`font-medium ${style.text}`}>{message.text}</span>
        <button
          onClick={clearMessage}
          className="ml-2 text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <GlobalMessage />
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/base" element={<Base />} />
        <Route path="/level/:id" element={<GameLevel />} />
        <Route path="/settlement" element={<Settlement />} />
      </Routes>
    </Router>
  );
}
