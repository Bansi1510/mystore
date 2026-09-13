import React, { useState } from 'react';
import { Plus, FolderPlus, Upload, X } from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';

export default function MobileFab() {
  const [isOpen, setIsOpen] = useState(false);
  const { setUploadModalOpen, setCreateFolderOpen } = useDriveStore();

  return (
    <div className="md:hidden fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2.5">
      {isOpen && (
        <>
          <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30" />

          <div className="relative z-40 flex flex-col items-end gap-2 animate-in slide-in-from-bottom-3">
            <button
              onClick={() => {
                setIsOpen(false);
                setCreateFolderOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500 text-white font-semibold text-xs shadow-xl active:scale-95 transition-transform"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Folder</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                setUploadModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500 text-white font-semibold text-xs shadow-xl active:scale-95 transition-transform"
            >
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </button>
          </div>
        </>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-xl shadow-brand-500/30 flex items-center justify-center transition-transform active:scale-90 ${
          isOpen ? 'rotate-45 bg-slate-800' : ''
        }`}
        aria-label="Action Menu"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}
