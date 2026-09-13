import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  FileCode,
  Table as TableIcon,
  HardDrive,
} from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import { formatBytes, formatDate } from '../../utils/formatters';
import api from '../../services/api';

export default function FilePreviewModal() {
  const { previewItem, closePreview } = useDriveStore();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [textContent, setTextContent] = useState('');
  const [csvRows, setCsvRows] = useState([]);
  const [loadingText, setLoadingText] = useState(false);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setTextContent('');
    setCsvRows([]);

    if (previewItem && (previewItem.category === 'text' || previewItem.category === 'json' || previewItem.category === 'csv')) {
      setLoadingText(true);
      fetch(previewItem.cloudinaryUrl)
        .then((res) => res.text())
        .then((txt) => {
          setTextContent(txt);
          if (previewItem.category === 'csv') {
            const lines = txt.split('\n').filter((l) => l.trim() !== '');
            const rows = lines.map((line) => line.split(','));
            setCsvRows(rows);
          }
          setLoadingText(false);
        })
        .catch((e) => {
          console.warn('Failed to fetch file text content:', e);
          setLoadingText(false);
        });
    }
  }, [previewItem]);

  if (!previewItem) return null;

  const category = previewItem.category;

  const renderContent = () => {
    if (category === 'images') {
      return (
        <div className="flex-1 flex items-center justify-center overflow-hidden relative p-4">
          <img
            src={previewItem.cloudinaryUrl}
            alt={previewItem.filename}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease',
            }}
            className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
          />
        </div>
      );
    }

    if (category === 'pdf') {
      return (
        <div className="flex-1 h-[75vh] w-full">
          <iframe
            src={previewItem.cloudinaryUrl}
            title={previewItem.filename}
            className="w-full h-full rounded-2xl border-0"
          />
        </div>
      );
    }

    if (category === 'videos') {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <video
            src={previewItem.cloudinaryUrl}
            controls
            autoPlay
            className="max-h-[75vh] w-full max-w-4xl rounded-2xl shadow-2xl"
          />
        </div>
      );
    }

    if (category === 'audio') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
          <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 animate-pulse">
            <FileText className="w-12 h-12" />
          </div>
          <audio src={previewItem.cloudinaryUrl} controls className="w-full max-w-md" />
        </div>
      );
    }

    if (category === 'json' || category === 'text') {
      return (
        <div className="flex-1 overflow-auto p-4 bg-slate-950 text-slate-100 rounded-2xl font-mono text-sm leading-relaxed max-h-[75vh]">
          {loadingText ? (
            <div className="p-8 text-center text-slate-400">Loading text content...</div>
          ) : (
            <pre>{textContent}</pre>
          )}
        </div>
      );
    }

    if (category === 'csv') {
      return (
        <div className="flex-1 overflow-auto p-4 max-h-[75vh]">
          {loadingText ? (
            <div className="p-8 text-center text-slate-400">Loading CSV table...</div>
          ) : (
            <table className="w-full border-collapse text-sm text-left">
              <tbody>
                {csvRows.map((row, idx) => (
                  <tr key={idx} className={idx === 0 ? 'bg-slate-100 dark:bg-slate-800 font-bold' : 'border-b border-slate-200 dark:border-slate-800'}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2 border border-slate-200 dark:border-slate-800">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    }

    // Unsupported fallback
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
        <HardDrive className="w-16 h-16 text-slate-400 dark:text-slate-600" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          No Preview Available
        </h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Direct preview is not supported for this file type ({previewItem.extension || 'file'}).
        </p>
        <a
          href={previewItem.cloudinaryUrl}
          download
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-lg shadow-brand-500/25 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download File</span>
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={closePreview} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />

      <div className="relative z-50 w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white truncate max-w-md">
              {previewItem.filename}
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              {formatBytes(previewItem.size)}
            </span>
          </div>

          {/* Tools */}
          <div className="flex items-center gap-2">
            {category === 'images' && (
              <>
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </>
            )}

            <a
              href={previewItem.cloudinaryUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>

            <button
              onClick={closePreview}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body View */}
        {renderContent()}
      </div>
    </div>
  );
}
