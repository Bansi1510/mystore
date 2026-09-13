import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import FileGrid from '../components/files/FileGrid';
import FileList from '../components/files/FileList';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useDriveStore } from '../store/driveStore';
import api from '../services/api';

export default function StarredPage() {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { viewMode } = useDriveStore();

  useEffect(() => {
    setLoading(true);
    api.get('/search?isStarred=true')
      .then((res) => {
        if (res.data.success) {
          setFolders(res.data.folders);
          setFiles(res.data.files);
        }
      })
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <Star className="w-6 h-6 text-amber-500 fill-amber-500/20" />
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Starred Items</h1>
          <p className="text-xs text-slate-400">Quick access to your bookmarked files and folders</p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton viewMode={viewMode} />
      ) : viewMode === 'grid' ? (
        <FileGrid folders={folders} files={files} />
      ) : (
        <FileList folders={folders} files={files} />
      )}
    </div>
  );
}
