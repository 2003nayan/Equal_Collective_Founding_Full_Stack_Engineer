'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface SuccessBannerProps {
  className?: string;
}

export const SuccessBanner = ({ className }: SuccessBannerProps) => {
  return (
    <div 
      className={cn(
        'p-6 rounded-xl text-center border',
        className
      )}
      style={{ 
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(34, 197, 94, 0.2)'
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div 
          className="h-12 w-12 rounded-full flex items-center justify-center"
          style={{ 
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            // boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)'
          }}
        >
          <CheckCircle2 className="h-6 w-6" style={{ color: '#22c55e' }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold" style={{ color: '#22c55e' }}>
            No errors in this trace!
          </h3>
          <p className="text-sm mt-1" style={{ color: 'rgba(34, 197, 94, 0.8)' }}>
            All steps completed successfully.
          </p>
        </div>
      </div>
    </div>
  );
};
