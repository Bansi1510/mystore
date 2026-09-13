import React, { useState } from 'react';
import { X, Info, Edit3, Check, Star, History, HardDrive, Calendar, Shield, Hash } from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import { formatBytes, formatDate } from '../../utils/formatters';
import api from '../../services/api';

export default function FileDetailsDrawer() {
  const { selectedItemDetails, closeDetails, refreshFolder, setVersionModalOpen } = useDriveStore();
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');

  if (!selectedItemDetails) return null;

  const item = selectedItemDetails;
  const isFolder = !item.cloudinaryPublicId;

  const handleRename = async () => {
    if (!nameInput.trim()) return;
    try {
      const endpoint = isFolder ? `/folders/${item._id}/rename` : `/files/${item._id}/rename`;
      await api.patch(endpoint, { name: nameInput.trim() });
      setIsEditing(false);
      refreshFolder();
      closeDetails();
    } catch (e) {
      console.warn('Rename error:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div onClick={closeDetails} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" />

      <div className="relative z-50 w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Item Details</h3>
          </div>
          <button
            onClick={closeDetails}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* File Name & Rename */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</span>
              {!isEditing ? (
                <button
                  onClick={() => {
                    setNameInput(isFolder ? item.name : item.filename);
                    setIsEditing(true);
                  }}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Rename
                </button>
              ) : (
                <button
                  onClick={handleRename}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
              )}
            </div>

            {!isEditing ? (
              <h4 className="font-bold text-slate-900 dark:text-white text-base break-all">
                {isFolder ? item.name : item.filename}
              </h4>
            ) : (
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-brand-500 rounded-xl focus:outline-none"
              />
            )}
          </div>

          {/* Properties list */}
          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-500">
                <HardDrive className="w-4 h-4" /> Size
              </span>
              <span className="font-medium">{isFolder ? 'Folder' : formatBytes(item.size)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-4 h-4" /> Created Date
              </span>
              <span className="font-medium">{formatDate(item.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-4 h-4" /> Last Modified
              </span>
              <span className="font-medium">{formatDate(item.updatedAt)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-500">
                <Shield className="w-4 h-4" /> Owner Role
              </span>
              <span className="font-medium capitalize">{item.ownerRole || 'user'}</span>
            </div>

            {!isFolder && (
              <>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-2 text-slate-500">
                    <History className="w-4 h-4" /> Current Version
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-brand-600 dark:text-brand-400">v{item.currentVersion || 1}</span>
                    <button
                      onClick={() => setVersionModalOpen(true, item)}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      History
                    </button>
                  </div>
                </div>

                {item.checksum && (
                  <div className="py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-2 text-slate-500 mb-1">
                      <Hash className="w-4 h-4" /> SHA-256 Checksum
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 break-all block bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                      {item.checksum}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
