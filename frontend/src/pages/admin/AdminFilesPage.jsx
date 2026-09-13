import React, { useEffect, useState } from 'react';
import { Files, Trash2, Search } from 'lucide-react';
import { formatBytes, formatDate } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminFilesPage() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/files?search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setFiles(res.data.files);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [search]);

  const handleDeletePermanent = async (fileId) => {
    try {
      await api.delete(`/files/${fileId}/permanent`);
      fetchFiles();
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Files className="w-6 h-6 text-brand-500" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">All System Files</h1>
            <p className="text-xs text-slate-400">Admin override view for all uploaded storage assets</p>
          </div>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search system files..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading files...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400">
                  <th className="pb-3 px-3">Filename</th>
                  <th className="pb-3 px-3">Category</th>
                  <th className="pb-3 px-3">Size</th>
                  <th className="pb-3 px-3">Owner</th>
                  <th className="pb-3 px-3">Created</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file._id} className="border-b border-slate-100 dark:border-slate-800/60 text-xs">
                    <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                      {file.filename}
                    </td>
                    <td className="py-3.5 px-3 capitalize text-slate-500">{file.category}</td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">{formatBytes(file.size)}</td>
                    <td className="py-3.5 px-3 capitalize text-amber-500 font-semibold">{file.ownerRole}</td>
                    <td className="py-3.5 px-3 text-slate-400">{formatDate(file.createdAt)}</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleDeletePermanent(file._id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Permanent Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
