import React from 'react';

export default function LoadingSkeleton({ viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full" />
      ))}
    </div>
  );
}
