import React, { useEffect, useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import FileGrid from '../components/files/FileGrid';
import FileList from '../components/files/FileList';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ConfirmModal from '../components/common/ConfirmModal';
import { useDriveStore } from '../store/driveStore';
import { useNotificationStore } from '../store/notificationStore';
import api from '../services/api';

export default function TrashPage() {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmEmptyOpen, setIsConfirmEmptyOpen] = useState(false);
  const { viewMode } = useDriveStore();
  const { addToast } = useNotificationStore();

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trash');
      if (res.data.success) {
        setFolders(res.data.folders || []);
        setFiles(res.data.files || []);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleEmptyTrash = async () => {
    try {
      const res = await api.delete('/trash/empty');
      if (res.data.success) {
        addToast({ type: 'success', message: 'Trash emptied successfully.' });
        setIsConfirmEmptyOpen(false);
        fetchTrash();
      }
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to empty trash.' });
    }
  };

  const hasItems = folders.length > 0 || files.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Trash2 className="w-6 h-6 text-rose-500" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Recycle Bin / Trash</h1>
            <p className="text-xs text-slate-400">Items in trash are soft-deleted and can be restored</p>
          </div>
        </div>

        {hasItems && (
          <button
            onClick={() => setIsConfirmEmptyOpen(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton viewMode={viewMode} />
      ) : viewMode === 'grid' ? (
        <FileGrid folders={folders} files={files} />
      ) : (
        <FileList folders={folders} files={files} />
      )}

      <ConfirmModal
        isOpen={isConfirmEmptyOpen}
        title="Empty Trash?"
        message="Are you sure you want to permanently delete all items in trash? This action cannot be undone."
        confirmText="Empty Trash"
        isDanger={true}
        onConfirm={handleEmptyTrash}
        onCancel={() => setIsConfirmEmptyOpen(false)}
      />
    </div>
  );
}
