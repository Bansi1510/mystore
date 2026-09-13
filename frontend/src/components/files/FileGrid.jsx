import React from 'react';
import FileCard from './FileCard';
import { Folder, Files } from 'lucide-react';

export default function FileGrid({ folders = [], files = [] }) {
  const hasItems = folders.length > 0 || files.length > 0;

  if (!hasItems) {
    return (
      <div className="py-16 text-center text-slate-400 space-y-3">
        <Files className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">This folder is empty</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Upload files or create new folders to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {folders.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-500" />
            <span>Folders ({folders.length})</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {folders.map((folder) => (
              <FileCard key={folder._id} item={folder} isFolder={true} />
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
            <Files className="w-4 h-4 text-brand-500" />
            <span>Files ({files.length})</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => (
              <FileCard key={file._id} item={file} isFolder={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
