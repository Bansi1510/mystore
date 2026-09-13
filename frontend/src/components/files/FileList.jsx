import React from 'react';
import FileRow from './FileRow';
import { useDriveStore } from '../../store/driveStore';

export default function FileList({ folders = [], files = [] }) {
  const { selectedFileIds, selectedFolderIds, selectAll, clearSelection } = useDriveStore();
  const totalItems = folders.length + files.length;
  const totalSelected = selectedFileIds.length + selectedFolderIds.length;
  const isAllSelected = totalItems > 0 && totalSelected === totalItems;

  const handleSelectAllChange = () => {
    if (isAllSelected) clearSelection();
    else selectAll();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAllChange}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4 hidden sm:table-cell">Category</th>
              <th className="py-3 px-4 hidden md:table-cell">Size</th>
              <th className="py-3 px-4 hidden lg:table-cell">Last Modified</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {folders.map((folder) => (
              <FileRow key={folder._id} item={folder} isFolder={true} />
            ))}
            {files.map((file) => (
              <FileRow key={file._id} item={file} isFolder={false} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
