'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { StepData } from '@/types/trace';
import { JsonViewer } from './JsonViewer';
import { CandidateTable } from './CandidateTable';
import { Candidate } from '@/types/trace';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Zap,
  Search,
  Filter,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  Lightbulb,
} from 'lucide-react';

interface StepCardProps {
  step: StepData;
  stepNumber: number;
  candidates?: Candidate[];
  className?: string;
}

const iconMap = {
  zap: Zap,
  search: Search,
  filter: Filter,
  target: Target,
  check: CheckCircle2,
};

export const StepCard = ({ step, stepNumber, candidates, className }: StepCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = iconMap[step.icon] || Zap;
  const isSuccess = step.status === 'success';
  const showCandidates = step.name === 'Apply Filters' && candidates && candidates.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          'glass rounded-xl overflow-hidden transition-all duration-300 animate-fade-in',
          isOpen && 'shadow-lg',
          className
        )}
        style={{
          borderLeft: !isSuccess ? '4px solid #ef4444' : undefined,
        }}
      >
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors cursor-pointer">
            {/* Icon with gradient background for success */}
            <div 
              className="flex items-center justify-center h-10 w-10 rounded-lg shrink-0"
              style={{ 
                background: isSuccess 
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)' 
                  : 'rgba(239, 68, 68, 0.15)',
              }}
            >
              <Icon 
                className="h-5 w-5" 
                style={{ color: isSuccess ? '#3b82f6' : '#ef4444' }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-foreground truncate">
                  {step.name}
                </h4>
                
                {/* Status Badge - Vibrant colors */}
                <span 
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                  style={{
                    backgroundColor: isSuccess ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: isSuccess ? '#22c55e' : '#ef4444',
                    border: `1px solid ${isSuccess ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Success
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Failed
                    </>
                  )}
                </span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {step.duration}ms
                </span>
                <span>Step {stepNumber} • {step.timestamp}</span>
              </div>
            </div>

            {/* Chevron */}
            <ChevronDown className={cn(
              'h-5 w-5 text-muted-foreground transition-transform duration-200 shrink-0',
              isOpen && 'rotate-180'
            )} />
          </div>
        </CollapsibleTrigger>

        {/* Reasoning Box - Amber/Orange styling */}
        <div className="px-4 pb-4">
          <div className="reasoning-box">
            <div className="flex items-start gap-2">
              <Lightbulb 
                className="h-4 w-4 shrink-0 mt-0.5" 
                style={{ color: '#f59e0b' }}
              />
              <div>
                <span 
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#f59e0b' }}
                >
                  Reasoning
                </span>
                <p 
                  className="text-sm mt-1 leading-relaxed"
                  style={{ color: 'var(--reasoning-foreground)' }}
                >
                  {step.reasoning}
                </p>
              </div>
            </div>
          </div>
        </div>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
            {/* Input */}
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Input
              </h5>
              <JsonViewer data={step.input} />
            </div>

            {/* Output */}
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Output
              </h5>
              <JsonViewer data={step.output} />
            </div>

            {/* Candidates Table */}
            {showCandidates && (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Candidate Analysis
                </h5>
                <CandidateTable candidates={candidates} />
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
