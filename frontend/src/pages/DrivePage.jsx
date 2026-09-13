import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/layout/Breadcrumb';
import FileGrid from '../components/files/FileGrid';
import FileList from '../components/files/FileList';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useDriveStore } from '../store/driveStore';
import {
  Image,
  Video,
  Music,
  FileText,
  FileArchive,
  Layers,
  FileCode,
} from 'lucide-react';

export default function DrivePage() {
  const { folderId } = useParams();
  const {
    currentFolder,
    breadcrumbs,
    folders,
    files,
    viewMode,
    isLoading,
    fetchFolder,
    filterCategory,
    setFilterCategory,
  } = useDriveStore();

  useEffect(() => {
    fetchFolder(folderId || 'root');
  }, [folderId]);

  const categories = [
    { id: 'all', name: 'All Files', icon: Layers },
    { id: 'images', name: 'Images', icon: Image },
    { id: 'videos', name: 'Videos', icon: Video },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'pdf', name: 'PDFs', icon: FileText },
    { id: 'audio', name: 'Audio', icon: Music },
    { id: 'archives', name: 'Archives', icon: FileArchive },
  ];

  const filteredFiles = filterCategory === 'all'
    ? files
    : files.filter((f) => f.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <Breadcrumb breadcrumbs={breadcrumbs} currentFolder={currentFolder} />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = filterCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Files View */}
      {isLoading ? (
        <LoadingSkeleton viewMode={viewMode} />
      ) : viewMode === 'grid' ? (
        <FileGrid folders={folders} files={filteredFiles} />
      ) : (
        <FileList folders={folders} files={filteredFiles} />
      )}
    </div>
  );
}
