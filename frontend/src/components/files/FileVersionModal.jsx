import React, { useState, useEffect } from 'react';
import { X, History, Upload, Download, CheckCircle2 } from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import { useNotificationStore } from '../../store/notificationStore';
import { formatBytes, formatDate } from '../../utils/formatters';
import api from '../../services/api';
import { triggerFileDownload } from '../../utils/downloadHelper';

export default function FileVersionModal() {
  const { isVersionModalOpen, versionTargetFile, setVersionModalOpen, refreshFolder } = useDriveStore();
  const { addToast } = useNotificationStore();

  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingNew, setUploadingNew] = useState(false);

  const fetchVersions = async () => {
    if (!versionTargetFile) return;
    setLoading(true);
    try {
      const res = await api.get(`/files/${versionTargetFile._id}/versions`);
      if (res.data.success) {
        setVersions(res.data.versions);
      }
    } catch (e) {
      console.warn('Failed to fetch versions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVersionModalOpen && versionTargetFile) {
      fetchVersions();
    }
  }, [isVersionModalOpen, versionTargetFile]);

  if (!isVersionModalOpen || !versionTargetFile) return null;

  const handleUploadNewVersion = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingNew(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post(`/files/${versionTargetFile._id}/versions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        addToast({ type: 'success', message: 'New version uploaded successfully!' });
        fetchVersions();
        refreshFolder();
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to upload new version.' });
    } finally {
      setUploadingNew(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={() => setVersionModalOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div className="relative z-50 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Version History</h3>
          </div>
          <button
            onClick={() => setVersionModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current active version */}
        <div className="p-4 bg-brand-50 dark:bg-brand-500/10 border border-brand-500/30 rounded-2xl mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Current Active Version</span>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                v{versionTargetFile.currentVersion || 1}
              </h4>
            </div>
            <label className="cursor-pointer px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingNew ? 'Uploading...' : 'Upload New'}</span>
              <input type="file" onChange={handleUploadNewVersion} disabled={uploadingNew} className="hidden" />
            </label>
          </div>
        </div>

        {/* Previous Versions list */}
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Older Versions</h4>
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-400">Loading version history...</div>
          ) : versions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No previous versions stored.</div>
          ) : (
            versions.map((ver) => (
              <div
                key={ver._id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800 text-sm"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">v{ver.versionNumber}</span>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {formatBytes(ver.size)} • {formatDate(ver.createdAt)}
                  </div>
                </div>
                <button
                  onClick={() => triggerFileDownload({ _id: versionTargetFile._id, filename: `v${ver.versionNumber}_${versionTargetFile.filename}` })}
                  className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                  title="Download Version"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
