import React, { useState, useEffect } from 'react';
import { X, Folder, ChevronRight, Home, Check } from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import { useNotificationStore } from '../../store/notificationStore';
import api from '../../services/api';

export default function FolderPickerModal() {
  const { isFolderPickerOpen, pickerAction, setFolderPickerOpen, refreshFolder } = useDriveStore();
  const { addToast } = useNotificationStore();

  const [currentFolderId, setCurrentFolderId] = useState(null); // null = root
  const [subfolders, setSubfolders] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFolderContent = async (fId) => {
    setLoading(true);
    try {
      const url = !fId ? '/folders' : `/folders/${fId}`;
      const res = await api.get(url);
      if (res.data.success) {
        setSubfolders(res.data.subfolders || []);
        setBreadcrumbs(res.data.breadcrumbs || []);
      }
    } catch (e) {
      console.warn('Folder fetch error in picker:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFolderPickerOpen) {
      setCurrentFolderId(null);
      fetchFolderContent(null);
    }
  }, [isFolderPickerOpen]);

  if (!isFolderPickerOpen || !pickerAction) return null;

  const isCopy = pickerAction.type === 'copy';

  const handleConfirmAction = async () => {
    try {
      const payload = {
        action: isCopy ? 'copy' : 'move',
        fileIds: pickerAction.fileIds || [],
        folderIds: pickerAction.folderIds || [],
        destinationFolderId: currentFolderId,
      };

      const res = await api.post('/files/bulk', payload);
      if (res.data.success) {
        addToast({ type: 'success', message: `${isCopy ? 'Copied' : 'Moved'} successfully!` });
        setFolderPickerOpen(false);
        refreshFolder();
      }
    } catch (err) {
      addToast({
        type: 'error',
        message: err.response?.data?.message || 'Operation failed.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={() => setFolderPickerOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div className="relative z-50 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Select Destination to {isCopy ? 'Copy' : 'Move'}
          </h3>
          <button
            onClick={() => setFolderPickerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Breadcrumb navigator */}
        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl mb-3 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => {
              setCurrentFolderId(null);
              fetchFolderContent(null);
            }}
            className="font-semibold hover:text-brand-600 flex items-center gap-1"
          >
            <Home className="w-3.5 h-3.5" /> My Drive
          </button>
          {breadcrumbs.map((b) => (
            <React.Fragment key={b._id}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => {
                  setCurrentFolderId(b._id);
                  fetchFolderContent(b._id);
                }}
                className="font-semibold hover:text-brand-600"
              >
                {b.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Subfolders List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 min-h-[16rem]">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading folders...</div>
          ) : subfolders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No subfolders here.</div>
          ) : (
            subfolders.map((folder) => {
              const isTargetFolderBeingMoved = pickerAction.folderIds?.includes(folder._id);
              return (
                <button
                  key={folder._id}
                  disabled={isTargetFolderBeingMoved}
                  onClick={() => {
                    setCurrentFolderId(folder._id);
                    fetchFolderContent(folder._id);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50 dark:hover:bg-brand-500/10 border border-slate-200/50 dark:border-slate-800 transition-colors text-left text-sm disabled:opacity-40"
                >
                  <div className="flex items-center gap-2.5">
                    <Folder className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{folder.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              );
            })
          )}
        </div>

        {/* Action footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={() => setFolderPickerOpen(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAction}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{isCopy ? 'Copy Here' : 'Move Here'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
