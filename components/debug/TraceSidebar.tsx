'use client';

import { cn } from '@/lib/utils';
import { Trace } from '@/types/trace';
import { TraceCard } from './TraceCard';
import { EmptyState } from './EmptyState';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle } from 'lucide-react';

interface TraceSidebarProps {
  traces: Trace[];
  selectedTraceId: string | null;
  onSelectTrace: (id: string) => void;
  showErrorsOnly: boolean;
  onToggleErrorsOnly: (value: boolean) => void;
  className?: string;
}

export const TraceSidebar = ({
  traces,
  selectedTraceId,
  onSelectTrace,
  showErrorsOnly,
  onToggleErrorsOnly,
  className,
}: TraceSidebarProps) => {
  const filteredTraces = showErrorsOnly
    ? traces.filter(t => t.status === 'failed')
    : traces;

  const failedCount = traces.filter(t => t.status === 'failed').length;

  return (
    <aside className={cn(
      'w-80 h-screen flex flex-col border-r border-border bg-sidebar',
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Trace History
        </h2>

        {/* Error Filter Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2">
            <AlertTriangle 
              className="h-4 w-4"
              style={{ color: showErrorsOnly ? '#ef4444' : 'var(--muted-foreground)' }}
            />
            <label 
              htmlFor="errors-only" 
              className="text-sm font-medium cursor-pointer"
            >
              Show Errors Only
            </label>
          </div>
          <Switch
            id="errors-only"
            checked={showErrorsOnly}
            onCheckedChange={onToggleErrorsOnly}
          />
        </div>
      </div>

      {/* Trace List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredTraces.length === 0 ? (
          <EmptyState type={showErrorsOnly ? 'no-errors' : 'no-traces'} />
        ) : (
          filteredTraces.map((trace, index) => (
            <div
              key={trace.id}
              className="animate-slide-in-left"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TraceCard
                trace={trace}
                isSelected={selectedTraceId === trace.id}
                onClick={() => onSelectTrace(trace.id)}
              />
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-border bg-secondary/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Traces</span>
          <span className="font-semibold text-foreground">{traces.length}</span>
        </div>
        {failedCount > 0 && (
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Failed</span>
            <span className="font-semibold" style={{ color: '#ef4444' }}>{failedCount}</span>
          </div>
        )}
      </div>
    </aside>
  );
};
