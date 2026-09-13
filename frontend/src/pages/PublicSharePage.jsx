import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Share2, Download, Lock, AlertCircle, HardDrive, FileText } from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import api from '../services/api';

import { triggerFileDownload } from '../utils/downloadHelper';

export default function PublicSharePage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [data, setData] = useState(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchShareData = async (pass = '') => {
    setLoading(true);
    setError('');
    try {
      const url = `/share/public/${token}${pass ? `?password=${encodeURIComponent(pass)}` : ''}`;
      const res = await api.get(url);
      if (res.data.success) {
        setData(res.data);
        setRequiresPassword(false);
      }
    } catch (err) {
      if (err.response?.data?.requiresPassword) {
        setRequiresPassword(true);
      } else {
        setError(err.response?.data?.message || 'Invalid or expired share link.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShareData();
  }, [token]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    fetchShareData(password);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading shared document...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Share Link Unavailable</h2>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <form onSubmit={handlePasswordSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <Lock className="w-10 h-10 text-indigo-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">Password Protected Link</h2>
            <p className="text-xs text-slate-400">Enter password to view shared content</p>
          </div>

          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-lg transition-all"
          >
            Access Shared Files
          </button>
        </form>
      </div>
    );
  }

  const { share, targetData } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white truncate max-w-xs">{targetData.filename || targetData.name}</h1>
            <p className="text-xs text-slate-400">Shared via CloudVault Drive</p>
          </div>
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2 text-sm text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Size:</span>
            <span className="font-semibold">{formatBytes(targetData.size || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Type:</span>
            <span className="font-semibold uppercase">{targetData.extension || 'Folder'}</span>
          </div>
        </div>

        {share.allowDownload && (
          <button
            onClick={() => triggerFileDownload(targetData)}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Shared File</span>
          </button>
        )}
      </div>
    </div>
  );
}
