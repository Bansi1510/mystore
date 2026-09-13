import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Download,
  Star,
  Trash2,
  FolderInput,
  Copy,
  RotateCcw,
  X,
  Archive,
} from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import { useNotificationStore } from '../../store/notificationStore';
import api from '../../services/api';

export default function BulkToolbar() {
  const location = useLocation();
  const isTrashPage = location.pathname === '/trash';

  const {
    selectedFileIds,
    selectedFolderIds,
    clearSelection,
    refreshFolder,
    setFolderPickerOpen,
  } = useDriveStore();
  const { addToast } = useNotificationStore();

  const totalSelected = selectedFileIds.length + selectedFolderIds.length;
  if (totalSelected === 0) return null;

  const handleBulkAction = async (action, extraData = {}) => {
    try {
      const res = await api.post('/files/bulk', {
        action,
        fileIds: selectedFileIds,
        folderIds: selectedFolderIds,
        ...extraData,
      });

      if (res.data.success) {
        addToast({ type: 'success', message: res.data.message || `Bulk ${action} successful` });
        clearSelection();
        refreshFolder();
      }
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Bulk operation failed' });
    }
  };

  const handleZipDownload = async () => {
    try {
      addToast({ type: 'info', message: 'Preparing ZIP archive download...' });
      const res = await api.post('/files/zip', {
        fileIds: selectedFileIds,
        folderIds: selectedFolderIds,
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cloud-archive-${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to create ZIP archive.' });
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md text-white rounded-full px-5 py-3 shadow-2xl border border-slate-700/60 flex items-center gap-4 animate-in slide-in-from-bottom-6 max-w-2xl w-full mx-auto">
      <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
        <span className="w-6 h-6 rounded-full bg-brand-500 font-bold text-xs flex items-center justify-center">
          {totalSelected}
        </span>
        <span className="text-sm font-medium text-slate-300">Selected</span>
      </div>

      <div className="flex items-center gap-1.5 flex-1 justify-center overflow-x-auto">
        {!isTrashPage ? (
          <>
            <button
              onClick={handleZipDownload}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Download ZIP"
            >
              <Archive className="w-4 h-4 text-brand-400" />
              <span className="hidden sm:inline">ZIP</span>
            </button>

            <button
              onClick={() => handleBulkAction('star')}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Star Selected"
            >
              <Star className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Star</span>
            </button>

            <button
              onClick={() => setFolderPickerOpen(true, { type: 'move', fileIds: selectedFileIds, folderIds: selectedFolderIds })}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Move Selected"
            >
              <FolderInput className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Move</span>
            </button>

            <button
              onClick={() => setFolderPickerOpen(true, { type: 'copy', fileIds: selectedFileIds, folderIds: selectedFolderIds })}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Copy Selected"
            >
              <Copy className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Copy</span>
            </button>

            <button
              onClick={() => handleBulkAction('trash')}
              className="p-2 hover:bg-rose-900/40 rounded-xl text-slate-200 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Move to Trash"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Trash</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleBulkAction('restore')}
              className="p-2 hover:bg-emerald-900/40 rounded-xl text-slate-200 hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Restore Selected"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Restore</span>
            </button>

            <button
              onClick={() => handleBulkAction('permanent_delete')}
              className="p-2 hover:bg-rose-900/40 rounded-xl text-slate-200 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Permanently Delete"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Delete Permanently</span>
            </button>
          </>
        )}
      </div>

      <button
        onClick={clearSelection}
        className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors ml-auto"
        title="Clear Selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
