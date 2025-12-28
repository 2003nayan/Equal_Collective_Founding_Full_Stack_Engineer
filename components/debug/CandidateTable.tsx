'use client';

import { cn } from '@/lib/utils';
import { Candidate } from '@/types/trace';
import { Check, X, Copy } from 'lucide-react';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CandidateTableProps {
  candidates: Candidate[];
  className?: string;
}

export const CandidateTable = ({ candidates, className }: CandidateTableProps) => {
  const [copiedAsin, setCopiedAsin] = useState<string | null>(null);

  const handleCopyAsin = async (asin: string) => {
    await navigator.clipboard.writeText(asin);
    setCopiedAsin(asin);
    setTimeout(() => setCopiedAsin(null), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatRating = (rating: number) => {
    return `${rating.toFixed(1)}★`;
  };

  return (
    <div className={cn('rounded-lg border border-border overflow-hidden', className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="font-semibold text-foreground">ASIN</TableHead>
            <TableHead className="font-semibold text-foreground">Product</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Price</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Rating</TableHead>
            <TableHead className="font-semibold text-foreground text-center">Status</TableHead>
            <TableHead className="font-semibold text-foreground">Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate, index) => (
            <TableRow
              key={candidate.asin}
              className={cn(
                'transition-colors animate-fade-in',
                candidate.status === 'failed' && 'bg-destructive/5'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="font-mono text-sm">
                <button
                  onClick={() => handleCopyAsin(candidate.asin)}
                  className="flex items-center gap-2 hover:text-primary transition-colors group"
                >
                  <span>{candidate.asin}</span>
                  {copiedAsin === candidate.asin ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              </TableCell>
              <TableCell className="max-w-xs truncate" title={candidate.title}>
                {candidate.title}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatPrice(candidate.price)}
              </TableCell>
              <TableCell className="text-right">
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  candidate.rating >= 4.5 
                    ? 'bg-success/10 text-success' 
                    : candidate.rating >= 4.0 
                    ? 'bg-primary/10 text-primary'
                    : 'bg-warning/10 text-warning'
                )}>
                  {formatRating(candidate.rating)}
                </span>
              </TableCell>
              <TableCell className="text-center">
                {candidate.status === 'passed' ? (
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-success/10">
                    <Check className="h-4 w-4 text-success" />
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-destructive/10">
                    <X className="h-4 w-4 text-destructive" />
                  </span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {candidate.reason || '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
