import * as React from 'react';
import { cn } from '@/lib/utils';

interface MenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  ({ className, icon, children, variant = 'primary', disabled, ...props }, ref) => {
    const variants = {
      primary: {
        border: 'border-glow-cyan/30 hover:border-glow-cyan',
        bg: 'bg-gradient-to-br from-glow-cyan/15 to-glow-cyan/5 hover:from-glow-cyan/25 hover:to-glow-cyan/10',
        text: 'text-glow-cyan',
        glow: 'hover:shadow-[0_0_30px_rgba(0,255,204,0.5),0_0_60px_rgba(0,255,204,0.2)]',
        iconGlow: 'group-hover:drop-shadow-[0_0_10px_rgba(0,255,204,0.8)]',
      },
      secondary: {
        border: 'border-metal-500/30 hover:border-metal-400',
        bg: 'bg-gradient-to-br from-metal-600/20 to-metal-700/20 hover:from-metal-600/30 hover:to-metal-700/30',
        text: 'text-slate-300',
        glow: 'hover:shadow-[0_0_20px_rgba(100,116,139,0.3)]',
        iconGlow: 'group-hover:drop-shadow-[0_0_8px_rgba(148,163,184,0.6)]',
      },
    };

    const v = variants[variant];

    return (
      <button
        ref={ref}
        className={cn(
          'group relative w-full min-w-[280px] px-8 py-5 rounded-2xl border-2',
          'flex items-center gap-4 justify-start',
          'transition-all duration-300 ease-out',
          'hover:-translate-y-1 active:translate-y-0',
          v.border,
          v.bg,
          v.text,
          v.glow,
          disabled && 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none',
          className
        )}
        disabled={disabled}
        {...props}
      >
        <div
          className={cn(
            'p-4 rounded-xl bg-deep-sea-900/60 border border-glow-cyan/20',
            'transition-all duration-300',
            v.iconGlow
          )}
        >
          {icon}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xl font-display font-bold tracking-wide">
            {children}
          </span>
        </div>
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
        <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
      </button>
    );
  }
);

MenuButton.displayName = 'MenuButton';
