import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import FileGrid from '../components/files/FileGrid';
import FileList from '../components/files/FileList';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useDriveStore } from '../store/driveStore';
import api from '../services/api';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { viewMode } = useDriveStore();

  useEffect(() => {
    if (query) {
      setLoading(true);
      api.get(`/search?q=${encodeURIComponent(query)}`)
        .then((res) => {
          if (res.data.success) {
            setFolders(res.data.folders || []);
            setFiles(res.data.files || []);
          }
        })
        .catch((e) => console.warn(e))
        .finally(() => setLoading(false));
    }
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <Search className="w-6 h-6 text-brand-500" />
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Search Results for "{query}"
          </h1>
          <p className="text-xs text-slate-400">
            Found {folders.length + files.length} matching items
          </p>
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
