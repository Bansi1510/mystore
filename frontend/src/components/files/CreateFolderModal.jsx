import React, { useState, useEffect } from 'react';
import { FolderPlus, X, Folder, Check } from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import { useNotificationStore } from '../../store/notificationStore';

export default function CreateFolderModal() {
  const { isCreateFolderOpen, setCreateFolderOpen, createFolder, currentFolder } = useDriveStore();
  const { addToast } = useNotificationStore();
  const [folderName, setFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isCreateFolderOpen) {
      setFolderName('New Folder');
    }
  }, [isCreateFolderOpen]);

  if (!isCreateFolderOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderName || !folderName.trim()) {
      addToast({ type: 'error', message: 'Please enter a folder name.' });
      return;
    }

    setIsLoading(true);
    try {
      const parentId = currentFolder ? currentFolder._id : null;
      const res = await createFolder(folderName.trim(), parentId);
      if (res && res.success) {
        addToast({ type: 'success', message: res.message || 'Folder created successfully!' });
        setCreateFolderOpen(false);
      }
    } catch (err) {
      addToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create folder. Database connection required.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={() => !isLoading && setCreateFolderOpen(false)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <div className="relative z-50 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Folder</h3>
          </div>

          <button
            disabled={isLoading}
            onClick={() => setCreateFolderOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Folder Name
            </label>
            <div className="relative">
              <Folder className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name..."
                autoFocus
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setCreateFolderOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !folderName.trim()}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isLoading ? 'Creating...' : 'Create Folder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
