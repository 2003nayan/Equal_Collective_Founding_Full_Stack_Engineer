'use client';

import { useState, useEffect } from 'react';
import { Trace } from '@/types/trace';
import { transformApiTraces, isApiFormat } from '@/lib/transformers';
import { Header } from '@/components/debug/Header';
import { TraceSidebar } from '@/components/debug/TraceSidebar';
import { TraceDetail } from '@/components/debug/TraceDetail';

export default function Dashboard() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [loading, setLoading] = useState(true);

  const selectedTrace = traces.find(t => t.id === selectedTraceId);

  // Apply theme class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Load traces from API
  useEffect(() => {
    fetch('/api/traces')
      .then((res) => res.json())
      .then((data) => {
        // Transform API data to new Trace format
        const transformedTraces = isApiFormat(data) 
          ? transformApiTraces(data)
          : data.traces || [];
        
        setTraces(transformedTraces);
        if (transformedTraces.length > 0) {
          setSelectedTraceId(transformedTraces[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load traces:', err);
        setLoading(false);
      });
  }, []);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleToggleErrorsOnly = (value: boolean) => {
    setShowErrorsOnly(value);
    // If current selection is hidden by filter, select first visible trace
    if (value && selectedTrace?.status !== 'failed') {
      const firstFailed = traces.find(t => t.status === 'failed');
      if (firstFailed) {
        setSelectedTraceId(firstFailed.id);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar Skeleton */}
        <aside className="w-80 h-screen flex flex-col border-r border-border bg-sidebar p-4">
          <div className="skeleton h-4 w-24 rounded mb-4" />
          <div className="skeleton h-10 w-full rounded-lg mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-border">
                <div className="skeleton h-4 w-32 rounded mb-2" />
                <div className="skeleton h-3 w-48 rounded mb-3" />
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="skeleton h-1.5 w-4 rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
        
        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-16 border-b border-border bg-card/50 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div>
                <div className="skeleton h-5 w-32 rounded mb-1" />
                <div className="skeleton h-3 w-24 rounded" />
              </div>
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="skeleton h-8 w-64 rounded" />
              <div className="skeleton h-40 w-full rounded-xl" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-32 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <TraceSidebar
        traces={traces}
        selectedTraceId={selectedTraceId}
        onSelectTrace={setSelectedTraceId}
        showErrorsOnly={showErrorsOnly}
        onToggleErrorsOnly={handleToggleErrorsOnly}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          theme={theme}
          onToggleTheme={handleToggleTheme}
          traceCount={traces.length}
        />

        {/* Trace Detail View */}
        {selectedTrace ? (
          <TraceDetail trace={selectedTrace} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-foreground">Select a trace to view details</p>
              <p className="text-sm text-muted-foreground mt-1">Choose from the sidebar to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
