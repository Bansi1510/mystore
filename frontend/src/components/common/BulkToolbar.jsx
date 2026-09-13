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
    <div className="fixed bottom-4 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-xl text-white rounded-3xl px-3.5 py-2.5 sm:px-5 sm:py-3 shadow-2xl border border-slate-700/80 flex items-center justify-between gap-2 max-w-xl mx-auto animate-in slide-in-from-bottom-5">
      {/* Selected badge */}
      <div className="flex items-center gap-2 pr-2 border-r border-slate-700 shrink-0">
        <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 font-bold text-xs flex items-center justify-center shadow-sm">
          {totalSelected}
        </span>
        <span className="text-xs font-semibold text-slate-300 hidden xs:inline">Selected</span>
      </div>

      {/* Action items */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        {!isTrashPage ? (
          <>
            <button
              onClick={handleZipDownload}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0"
              title="Download ZIP"
            >
              <Archive className="w-4 h-4 text-brand-400" />
              <span className="hidden sm:inline">ZIP</span>
            </button>

            <button
              onClick={() => handleBulkAction('star')}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0"
              title="Star Selected"
            >
              <Star className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Star</span>
            </button>

            <button
              onClick={() => setFolderPickerOpen(true, { type: 'move', fileIds: selectedFileIds, folderIds: selectedFolderIds })}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0"
              title="Move Selected"
            >
              <FolderInput className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Move</span>
            </button>

            <button
              onClick={() => setFolderPickerOpen(true, { type: 'copy', fileIds: selectedFileIds, folderIds: selectedFolderIds })}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0"
              title="Copy Selected"
            >
              <Copy className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Copy</span>
            </button>

            <button
              onClick={() => handleBulkAction('trash')}
              className="p-2 hover:bg-rose-900/40 rounded-xl text-slate-200 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0"
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
              className="p-2 hover:bg-emerald-900/40 rounded-xl text-slate-200 hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0"
              title="Restore Selected"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Restore</span>
            </button>

            <button
              onClick={() => handleBulkAction('permanent_delete')}
              className="p-2 hover:bg-rose-900/40 rounded-xl text-slate-200 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0"
              title="Permanently Delete"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>

      <button
        onClick={clearSelection}
        className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors shrink-0"
        title="Clear Selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
