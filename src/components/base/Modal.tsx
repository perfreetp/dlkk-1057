import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  isOpen: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  children,
  onClose,
  isOpen,
  className,
}) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-deep-sea-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg glass-panel border-glow-cyan/30',
          'animate-in fade-in zoom-in-95 duration-200',
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-glow-cyan/20">
          <h2 className="text-xl font-display font-bold text-glow-cyan">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-metal-400 hover:text-glow-cyan hover:bg-glow-cyan/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
};
