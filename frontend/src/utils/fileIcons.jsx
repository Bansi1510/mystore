import React from 'react';
import {
  FileText,
  Image,
  Video,
  Music,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  File,
  Folder,
  FileCheck,
} from 'lucide-react';

export function getFileIcon(category, mimeType, className = 'w-6 h-6') {
  switch (category) {
    case 'images':
      return <Image className={`${className} text-emerald-500`} />;
    case 'videos':
      return <Video className={`${className} text-rose-500`} />;
    case 'audio':
      return <Music className={`${className} text-amber-500`} />;
    case 'pdf':
      return <FileText className={`${className} text-red-500`} />;
    case 'documents':
      return <FileText className={`${className} text-blue-500`} />;
    case 'spreadsheets':
    case 'csv':
      return <FileSpreadsheet className={`${className} text-emerald-600`} />;
    case 'text':
      return <FileText className={`${className} text-slate-500`} />;
    case 'json':
      return <FileCode className={`${className} text-purple-500`} />;
    case 'archives':
      return <FileArchive className={`${className} text-orange-500`} />;
    default:
      return <File className={`${className} text-slate-400`} />;
  }
}
