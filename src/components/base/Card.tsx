import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'dark';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  children,
  onClick,
  ...props
}) => {
  const variants = {
    default: 'bg-deep-sea-800/60 backdrop-blur-md border border-glow-cyan/20',
    glow: 'bg-deep-sea-800/80 backdrop-blur-md border border-glow-cyan/40 shadow-[0_0_20px_rgba(0,255,204,0.15)]',
    dark: 'bg-deep-sea-900/80 backdrop-blur-md border border-metal-600/30',
  };

  const hoverStyles = onClick
    ? 'cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
    : '';

  const glowHover = onClick && variant === 'glow'
    ? 'hover:shadow-[0_0_30px_rgba(0,255,204,0.3),0_0_60px_rgba(0,255,204,0.1)]'
    : '';

  return (
    <div
      className={cn(
        'rounded-lg',
        variants[variant],
        hoverStyles,
        glowHover,
        className
      )}
      onClick={onClick}
      {...props}
    >
      {onClick && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none rounded-lg" />
      )}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};
