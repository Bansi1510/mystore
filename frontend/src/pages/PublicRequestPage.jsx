import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UploadCloud, CheckCircle2, AlertCircle, HardDrive } from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import api from '../services/api';

export default function PublicRequestPage() {
  const { token } = useParams();
  const [requestInfo, setRequestInfo] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/share/request/${token}`)
      .then((res) => {
        if (res.data.success) {
          setRequestInfo(res.data.request);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Invalid or expired upload request link.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post(`/share/request/${token}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setSuccessMsg('File uploaded successfully! Thank you.');
        setFile(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading request portal...</div>;
  }

  if (error && !requestInfo) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Upload Request Unavailable</h2>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white">{requestInfo.title}</h1>
          {requestInfo.description && <p className="text-xs text-slate-400">{requestInfo.description}</p>}
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center bg-slate-950 cursor-pointer">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-700"
            />
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-lg transition-all"
          >
            {uploading ? 'Uploading...' : 'Submit File'}
          </button>
        </form>
      </div>
    </div>
  );
}
