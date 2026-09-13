/**
 * Helper to trigger single file download with exact original filename from backend proxy stream
 */
export function triggerFileDownload(file) {
  if (!file) return;

  const token = localStorage.getItem('auth_token') || '';
  const downloadUrl = `/api/files/${file._id}/download?token=${encodeURIComponent(token)}`;

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', file.filename || file.originalName || 'download');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
