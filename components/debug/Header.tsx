'use client';

import { cn } from '@/lib/utils';
import { Sun, Moon, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  traceCount: number;
  className?: string;
}

export const Header = ({ theme, onToggleTheme, traceCount, className }: HeaderProps) => {
  return (
    <header className={cn(
      'h-16 flex items-center justify-between px-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 header-glow',
      className
    )}>
      {/* Logo & Brand */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div 
            className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
          >
            <Radio className="h-5 w-5 text-white" />
          </div>
          <div 
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card animate-pulse"
            style={{ backgroundColor: '#22c55e' }}
          />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            X-Ray Debugger
          </h1>
          <p className="text-xs text-muted-foreground">
            AI Pipeline Inspector
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleTheme}
          className="gap-2"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4" />
              Light
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              Dark
            </>
          )}
        </Button>

        {/* Trace Count Badge - Blue with pulsing dot */}
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: '#3b82f6' }}
        >
          <div 
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: '#22c55e' }}
          />
          <span>{traceCount} Traces</span>
        </div>
      </div>
    </header>
  );
};
