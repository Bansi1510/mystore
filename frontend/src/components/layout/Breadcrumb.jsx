import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ breadcrumbs = [], currentFolder }) {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 py-2 px-1 overflow-x-auto whitespace-nowrap scrollbar-none">
      <button
        onClick={() => navigate('/drive')}
        className="flex items-center gap-1.5 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>My Drive</span>
      </button>

      {breadcrumbs.map((crumb) => (
        <React.Fragment key={crumb._id}>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          <button
            onClick={() => navigate(`/drive/${crumb._id}`)}
            className="hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
          >
            {crumb.name}
          </button>
        </React.Fragment>
      ))}

      {currentFolder && (
        <>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-white">
            {currentFolder.name}
          </span>
        </>
      )}
    </nav>
  );
}
