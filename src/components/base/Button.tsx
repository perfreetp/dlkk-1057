import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'font-display font-semibold transition-all duration-300 border rounded-lg relative overflow-hidden';
    
    const variants = {
      primary: 'bg-gradient-to-br from-glow-cyan/10 to-glow-cyan/5 border-glow-cyan/30 text-glow-cyan hover:border-glow-cyan hover:from-glow-cyan/20 hover:to-glow-cyan/10',
      danger: 'bg-gradient-to-br from-glow-red/10 to-glow-red/5 border-glow-red/30 text-glow-red hover:border-glow-red hover:from-glow-red/20 hover:to-glow-red/10',
      secondary: 'bg-gradient-to-br from-metal-600/30 to-metal-700/30 border-metal-500/30 text-slate-300 hover:border-metal-400/50 hover:from-metal-600/40 hover:to-metal-700/40',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const glowEffects = {
      primary: 'hover:shadow-[0_0_20px_rgba(0,255,204,0.4),0_0_40px_rgba(0,255,204,0.2)] hover:-translate-y-0.5',
      danger: 'hover:shadow-[0_0_20px_rgba(255,68,68,0.4),0_0_40px_rgba(255,68,68,0.2)] hover:-translate-y-0.5',
      secondary: 'hover:shadow-[0_0_15px_rgba(100,116,139,0.3)] hover:-translate-y-0.5',
    };

    const disabledStyles = 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none';

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          !disabled && glowEffects[variant],
          disabled && disabledStyles,
          className
        )}
        disabled={disabled}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
      </button>
    );
  }
);

Button.displayName = 'Button';
