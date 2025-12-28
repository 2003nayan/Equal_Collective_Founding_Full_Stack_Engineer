'use client';

import { cn } from '@/lib/utils';
import { Trace } from '@/types/trace';
import { PipelineFunnel } from './PipelineFunnel';
import { StepCard } from './StepCard';
import { SuccessBanner } from './SuccessBanner';
import { format } from 'date-fns';
import { Copy, Check, CheckCircle2, XCircle, Calendar, Hash } from 'lucide-react';
import { useState } from 'react';

interface TraceDetailProps {
  trace: Trace;
  className?: string;
}

export const TraceDetail = ({ trace, className }: TraceDetailProps) => {
  const [copiedId, setCopiedId] = useState(false);
  const isCompleted = trace.status === 'completed';
  const hasNoErrors = trace.steps.every(s => s.status === 'success');

  const handleCopyTraceId = async () => {
    await navigator.clipboard.writeText(trace.traceId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className={cn('flex-1 overflow-y-auto', className)}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Trace Header */}
        <div className="animate-fade-in">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-foreground">
                  {trace.title}
                </h2>
                <span className="text-lg text-muted-foreground">
                  - {trace.subtitle}
                </span>
                
                {/* Status Badge - Vibrant colors */}
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: isCompleted ? '#22c55e' : '#ef4444',
                    color: '#ffffff',
                  }}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completed
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      Failed
                    </>
                  )}
                </span>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <button
                  onClick={handleCopyTraceId}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group"
                >
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-mono text-sm text-foreground">
                    {trace.traceId}
                  </span>
                  {copiedId ? (
                    <Check className="h-3.5 w-3.5" style={{ color: '#22c55e' }} />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {format(new Date(trace.timestamp), 'MMM dd, yyyy, h:mm:ss a')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Funnel */}
        <PipelineFunnel
          funnel={trace.funnel}
          hasErrors={!isCompleted}
          className="animate-fade-in"
        />

        {/* Success Banner */}
        {hasNoErrors && isCompleted && (
          <SuccessBanner className="animate-fade-in" />
        )}

        {/* Pipeline Steps */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div 
              className="h-1.5 w-1.5 rounded-full" 
              style={{ backgroundColor: '#3b82f6' }}
            />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Pipeline Steps
            </h3>
          </div>
          
          <div className="space-y-3">
            {trace.steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                stepNumber={index + 1}
                candidates={step.name === 'Apply Filters' ? trace.candidates : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
