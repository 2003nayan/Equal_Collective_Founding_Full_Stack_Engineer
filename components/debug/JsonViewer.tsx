'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';

interface JsonViewerProps {
  data: Record<string, unknown>;
  className?: string;
}

export const JsonViewer = ({ data, className }: JsonViewerProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderValue = (value: unknown, depth: number = 0): React.ReactNode => {
    if (value === null) {
      return <span className="text-muted-foreground">null</span>;
    }

    if (typeof value === 'string') {
      return <span className="code-string">"{value}"</span>;
    }

    if (typeof value === 'number') {
      return <span className="code-number">{value}</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="code-keyword">{value.toString()}</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground">[]</span>;
      }
      return (
        <span>
          {'['}
          <div className="ml-4">
            {value.map((item, index) => (
              <div key={index}>
                {renderValue(item, depth + 1)}
                {index < value.length - 1 && ','}
              </div>
            ))}
          </div>
          {']'}
        </span>
      );
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return <span className="text-muted-foreground">{'{}'}</span>;
      }
      return (
        <span>
          {'{'}
          <div className="ml-4">
            {entries.map(([key, val], index) => (
              <div key={key}>
                <span className="code-keyword">"{key}"</span>
                <span className="text-muted-foreground">: </span>
                {renderValue(val, depth + 1)}
                {index < entries.length - 1 && ','}
              </div>
            ))}
          </div>
          {'}'}
        </span>
      );
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className={cn('relative group', className)}>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Copy JSON"
      >
        {copied ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <div className="code-block font-mono text-sm overflow-x-auto">
        {renderValue(data)}
      </div>
    </div>
  );
};
