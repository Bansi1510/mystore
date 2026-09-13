const archiver = require('archiver');
const https = require('https');
const http = require('http');

function fetchStream(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      if (response.statusCode >= 400) {
        return reject(new Error(`Failed to fetch file stream, status code: ${response.statusCode}`));
      }
      resolve(response);
    }).on('error', (err) => reject(err));
  });
}

async function streamZipArchive(files, res, archiveName = 'download.zip') {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${archiveName}"`);

  const archive = archiver('zip', {
    zlib: { level: 6 },
  });

  archive.on('error', (err) => {
    console.error('❌ Archiver error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to compress archive.' });
    }
  });

  archive.pipe(res);

  for (const file of files) {
    try {
      if (file.cloudinaryUrl) {
        const fileStream = await fetchStream(file.cloudinaryUrl);
        archive.append(fileStream, { name: file.filename || file.originalName });
      }
    } catch (err) {
      console.warn(`⚠️ Skipped zip entry for file ${file.filename}: ${err.message}`);
    }
  }

  await archive.finalize();
}

module.exports = {
  streamZipArchive,
};
