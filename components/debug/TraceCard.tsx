'use client';

import { cn } from '@/lib/utils';
import { Trace } from '@/types/trace';
import { format } from 'date-fns';

interface TraceCardProps {
  trace: Trace;
  isSelected: boolean;
  onClick: () => void;
}

export const TraceCard = ({ trace, isSelected, onClick }: TraceCardProps) => {
  const isCompleted = trace.status === 'completed';
  const stepStatuses = trace.steps.map(s => s.status);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-xl transition-all duration-200 cursor-pointer',
        'border-2',
        'hover:bg-secondary/50',
        isSelected
          ? 'bg-secondary/80 border-primary/50 shadow-lg'
          : 'bg-card/50 border-transparent hover:border-border'
      )}
      style={{
        borderLeft: !isCompleted ? '4px solid #ef4444' : undefined,
        boxShadow: isSelected ? '0 0 15px rgba(59, 130, 246, 0.15)' : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={cn('h-2.5 w-2.5 rounded-full', !isCompleted && 'animate-pulse')}
            style={{
              backgroundColor: isCompleted ? '#22c55e' : '#ef4444',
              boxShadow: isCompleted ? '0 0 10px rgba(34, 197, 94, 0.4)' : undefined,
            }}
          />
          <span className="font-semibold text-foreground truncate">
            Trace #{trace.traceId.split('-')[1]}
          </span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {format(new Date(trace.timestamp), 'HH:mm a')}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mt-1 truncate pl-4">
        {trace.title} - {trace.subtitle}
      </p>

      {/* Step Status Dots - Colored bars */}
      <div className="flex items-center gap-1 mt-3 pl-4">
        {stepStatuses.map((status, index) => (
          <div
            key={index}
            className="h-1.5 w-4 rounded-full transition-all"
            style={{
              backgroundColor: status === 'success'
                ? '#22c55e'
                : status === 'failed'
                  ? '#ef4444'
                  : 'var(--muted)'
            }}
          />
        ))}
      </div>
    </button>
  );
};
