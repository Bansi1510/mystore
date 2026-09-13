import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import FileGrid from '../components/files/FileGrid';
import FileList from '../components/files/FileList';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useDriveStore } from '../store/driveStore';
import api from '../services/api';

export default function RecentPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { viewMode } = useDriveStore();

  useEffect(() => {
    setLoading(true);
    api.get('/search?q=&limit=30')
      .then((res) => {
        if (res.data.success) {
          setFiles(res.data.files);
        }
      })
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <Clock className="w-6 h-6 text-brand-500" />
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Recent Files</h1>
          <p className="text-xs text-slate-400">Recently opened, uploaded, or modified documents</p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton viewMode={viewMode} />
      ) : viewMode === 'grid' ? (
        <FileGrid folders={[]} files={files} />
      ) : (
        <FileList folders={[]} files={files} />
      )}
    </div>
  );
}
