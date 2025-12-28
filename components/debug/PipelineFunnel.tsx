'use client';

import { cn } from '@/lib/utils';
import { PipelineFunnel as PipelineFunnelType } from '@/types/trace';
import { Users, Filter, Target } from 'lucide-react';

interface PipelineFunnelProps {
  funnel: PipelineFunnelType;
  hasErrors?: boolean;
  className?: string;
}

export const PipelineFunnel = ({ funnel, hasErrors = false, className }: PipelineFunnelProps) => {
  const stages = [
    {
      label: 'CANDIDATES',
      value: funnel.candidates,
      icon: Users,
      isError: false,
      barColor: '#3b82f6', // Blue
    },
    {
      label: 'PASSED FILTERS',
      value: funnel.passedFilters,
      icon: Filter,
      isError: funnel.passedFilters === 0,
      barColor: funnel.passedFilters === 0 ? '#ef4444' : '#3b82f6',
    },
    {
      label: 'SELECTED',
      value: funnel.selected,
      icon: Target,
      isError: funnel.selected === 0,
      barColor: funnel.selected === 0 ? '#ef4444' : '#22c55e', // Green for success
    },
  ];

  const getPercentage = (value: number, max: number) => {
    if (max === 0) return 0;
    return Math.min(100, (value / max) * 100);
  };

  const filterRate = funnel.candidates > 0 ? Math.round((funnel.passedFilters / funnel.candidates) * 100) : 0;
  const selectionRate = funnel.passedFilters > 0 ? Math.round((funnel.selected / funnel.passedFilters) * 100) : 0;

  return (
    <div className={cn('glass rounded-xl p-6', className)}>
      <div className="flex items-center gap-2 mb-6">
        <div 
          className="h-1.5 w-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: '#3b82f6' }}
        />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Pipeline Funnel
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          
          return (
            <div
              key={stage.label}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Connector Arrow */}
              {index > 0 && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-px bg-border">
                  <div className="absolute right-0 -top-1 w-0 h-0 border-l-4 border-l-border border-y-4 border-y-transparent" />
                </div>
              )}

              <div className="text-center space-y-3">
                <div className="flex items-center justify-center">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      backgroundColor: stage.isError ? 'rgba(239, 68, 68, 0.15)' : 'var(--secondary)'
                    }}
                  >
                    <Icon 
                      className="h-4 w-4"
                      style={{ color: stage.isError ? '#ef4444' : 'var(--muted-foreground)' }}
                    />
                  </div>
                </div>

                <div 
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: stage.isError ? '#ef4444' : 'var(--foreground)' }}
                >
                  {stage.value.toLocaleString()}
                </div>

                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stage.label}
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${getPercentage(stage.value, funnel.candidates)}%`,
                      backgroundColor: stage.barColor,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion rates */}
      <div className="flex justify-center gap-8 mt-6 pt-4 border-t border-border">
        <div className="text-center">
          <span className="text-lg font-semibold text-foreground">
            {filterRate}%
          </span>
          <span className="text-xs text-muted-foreground ml-1">filter rate</span>
        </div>
        <div className="text-center">
          <span className="text-lg font-semibold text-foreground">
            {selectionRate}%
          </span>
          <span className="text-xs text-muted-foreground ml-1">selection rate</span>
        </div>
      </div>
    </div>
  );
};
