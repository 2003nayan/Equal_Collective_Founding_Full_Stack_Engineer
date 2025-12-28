'use client';

import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-traces' | 'no-errors';
  className?: string;
}

export const EmptyState = ({ type, className }: EmptyStateProps) => {
  if (type === 'no-traces') {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}>
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Info className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No traces yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Run your pipeline to see traces appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-8 text-center',
      className
    )}>
      <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
        <svg
          className="h-6 w-6 text-success"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        No failed traces!
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        All pipelines completed successfully.
      </p>
    </div>
  );
};
