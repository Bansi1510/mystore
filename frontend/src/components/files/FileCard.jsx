import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder,
  Star,
  MoreVertical,
  Download,
  Share2,
  FolderInput,
  Copy,
  Edit2,
  Trash2,
  Eye,
  History,
} from 'lucide-react';
import { getFileIcon } from '../../utils/fileIcons';
import { formatBytes, truncateString } from '../../utils/formatters';
import { useDriveStore } from '../../store/driveStore';

export default function FileCard({ item, isFolder = false }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    selectedFileIds,
    selectedFolderIds,
    toggleSelectFile,
    toggleSelectFolder,
    openPreview,
    openDetails,
    toggleStarFile,
    toggleStarFolder,
    deleteFile,
    deleteFolder,
    setShareModalOpen,
    setVersionModalOpen,
    setFolderPickerOpen,
  } = useDriveStore();

  const isSelected = isFolder
    ? selectedFolderIds.includes(item._id)
    : selectedFileIds.includes(item._id);

  const handleClick = (e) => {
    if (e.target.closest('.no-select')) return;
    if (isFolder) {
      navigate(`/drive/${item._id}`);
    } else {
      openPreview(item);
    }
  };

  const handleCheckbox = (e) => {
    e.stopPropagation();
    if (isFolder) toggleSelectFolder(item._id);
    else toggleSelectFile(item._id);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative bg-white dark:bg-slate-900/90 rounded-3xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5 ${
        isSelected
          ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20 dark:bg-brand-500/10'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top Bar: Checkbox & Star & Options menu */}
      <div className="flex items-center justify-between mb-3 no-select">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckbox}
          className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer"
        />

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isFolder) toggleStarFolder(item._id, item.isStarred);
              else toggleStarFile(item._id, item.isStarred);
            }}
            className={`p-1.5 rounded-full transition-colors ${
              item.isStarred
                ? 'text-amber-400 fill-amber-400 hover:bg-amber-500/10'
                : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star className="w-4 h-4" />
          </button>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                  className="fixed inset-0 z-10"
                />
                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-20 space-y-0.5 text-xs font-medium text-slate-700 dark:text-slate-200 animate-in fade-in">
                  {!isFolder && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          openPreview(item);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60"
                      >
                        <Eye className="w-4 h-4 text-brand-500" />
                        <span>Preview</span>
                      </button>

                      <a
                        href={item.cloudinaryUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60"
                      >
                        <Download className="w-4 h-4 text-emerald-500" />
                        <span>Download</span>
                      </a>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          setShareModalOpen(true, item);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60"
                      >
                        <Share2 className="w-4 h-4 text-indigo-500" />
                        <span>Share Link</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          setVersionModalOpen(true, item);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60"
                      >
                        <History className="w-4 h-4 text-purple-500" />
                        <span>Versions</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      setFolderPickerOpen(true, {
                        type: 'move',
                        fileIds: !isFolder ? [item._id] : [],
                        folderIds: isFolder ? [item._id] : [],
                      });
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60"
                  >
                    <FolderInput className="w-4 h-4 text-amber-500" />
                    <span>Move</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      setFolderPickerOpen(true, {
                        type: 'copy',
                        fileIds: !isFolder ? [item._id] : [],
                        folderIds: isFolder ? [item._id] : [],
                      });
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60"
                  >
                    <Copy className="w-4 h-4 text-blue-500" />
                    <span>Copy</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      openDetails(item);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500" />
                    <span>Details</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      if (isFolder) deleteFolder(item._id);
                      else deleteFile(item._id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Move to Trash</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Thumbnail / Icon preview */}
      <div className="flex-1 flex flex-col items-center justify-center py-3">
        {isFolder ? (
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Folder className="w-10 h-10 fill-amber-500/20" />
          </div>
        ) : item.category === 'images' && item.cloudinaryUrl ? (
          <div className="w-full h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
            <img
              src={item.cloudinaryUrl}
              alt={item.filename}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {getFileIcon(item.category, item.mimeType, 'w-9 h-9')}
          </div>
        )}
      </div>

      {/* Bottom info */}
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <h4
          className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate"
          title={isFolder ? item.name : item.filename}
        >
          {isFolder ? item.name : item.filename}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          <span>{isFolder ? 'Folder' : formatBytes(item.size)}</span>
          {!isFolder && item.currentVersion > 1 && (
            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-medium text-brand-600 dark:text-brand-400">
              v{item.currentVersion}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
