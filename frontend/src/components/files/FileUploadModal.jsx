import React, { useState, useRef } from 'react';
import { UploadCloud, X, File, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import { useNotificationStore } from '../../store/notificationStore';
import { formatBytes } from '../../utils/formatters';
import api from '../../services/api';

export default function FileUploadModal() {
  const { isUploadModalOpen, setUploadModalOpen, currentFolder, refreshFolder } = useDriveStore();
  const { addToast } = useNotificationStore();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  if (!isUploadModalOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (idx) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== idx));
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      if (currentFolder) {
        formData.append('parentFolder', currentFolder._id);
      }

      let endpoint = '/files/upload';
      if (selectedFiles.length === 1) {
        formData.append('file', selectedFiles[0]);
      } else {
        endpoint = '/files/upload-multiple';
        selectedFiles.forEach((f) => formData.append('files', f));
      }

      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (res.data.success) {
        addToast({ type: 'success', message: res.data.message || 'File(s) uploaded successfully!' });
        setSelectedFiles([]);
        setUploadModalOpen(false);
        refreshFolder();
      }
    } catch (err) {
      addToast({
        type: 'error',
        message: err.response?.data?.message || 'Upload failed. Please check server connection.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={() => !isUploading && setUploadModalOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div className="relative z-50 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Files</h3>
          <button
            disabled={isUploading}
            onClick={() => setUploadModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 rounded-3xl p-8 text-center bg-slate-50 dark:bg-slate-800/40 cursor-pointer transition-colors"
        >
          <UploadCloud className="w-12 h-12 text-brand-500 mx-auto mb-3 animate-bounce" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Drag and drop files here, or <span className="text-brand-600 dark:text-brand-400">browse</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Supports images, videos, docs, audio, archives up to 100MB</p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Selected files preview list */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <File className="w-4 h-4 text-brand-500 shrink-0" />
                  <span className="truncate font-medium text-slate-800 dark:text-slate-200">{file.name}</span>
                  <span className="text-xs text-slate-400 shrink-0">({formatBytes(file.size)})</span>
                </div>
                {!isUploading && (
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {isUploading && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            disabled={isUploading}
            onClick={() => setUploadModalOpen(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            disabled={selectedFiles.length === 0 || isUploading}
            onClick={handleUploadSubmit}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-lg shadow-brand-500/25 transition-all"
          >
            {isUploading ? 'Uploading...' : 'Start Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
