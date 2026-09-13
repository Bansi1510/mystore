import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Star, MoreVertical, Download, Eye, Share2, Trash2 } from 'lucide-react';
import { getFileIcon } from '../../utils/fileIcons';
import { formatBytes, formatDate } from '../../utils/formatters';
import { useDriveStore } from '../../store/driveStore';

export default function FileRow({ item, isFolder = false }) {
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
    <tr
      onClick={handleClick}
      className={`group border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
        isSelected ? 'bg-brand-50/30 dark:bg-brand-500/10' : ''
      }`}
    >
      <td className="py-3 px-4 no-select w-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckbox}
          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer"
        />
      </td>

      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-3">
          {isFolder ? (
            <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20 shrink-0" />
          ) : (
            getFileIcon(item.category, item.mimeType, 'w-5 h-5 shrink-0')
          )}
          <span className="truncate max-w-xs sm:max-w-md">
            {isFolder ? item.name : item.filename}
          </span>
        </div>
      </td>

      <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 capitalize hidden sm:table-cell">
        {isFolder ? 'Folder' : item.category}
      </td>

      <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 hidden md:table-cell">
        {isFolder ? '-' : formatBytes(item.size)}
      </td>

      <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 hidden lg:table-cell">
        {formatDate(item.updatedAt)}
      </td>

      <td className="py-3 px-4 text-right no-select w-20">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isFolder) toggleStarFolder(item._id, item.isStarred);
              else toggleStarFile(item._id, item.isStarred);
            }}
            className={`p-1 rounded-full ${
              item.isStarred
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-amber-400'
            }`}
          >
            <Star className="w-4 h-4" />
          </button>

          {!isFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShareModalOpen(true, item);
              }}
              className="p-1 rounded text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
