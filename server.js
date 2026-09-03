const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT_DIR = path.join(__dirname, 'portfolio');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.jsx': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

process.on('uncaughtException', (err) => {
  console.log('Handled exception:', err && err.message ? err.message : err);
});
process.on('unhandledRejection', (reason) => {
  console.log('Handled rejection:', reason);
});
process.on('exit', (code) => {
  console.log(`[${new Date().toISOString()}] Server process exiting with code: ${code}`);
});

// Explicit keepAlive timer to ensure Node event loop never empties
setInterval(() => {}, 1000 * 60 * 60);

const server = http.createServer((req, res) => {
  req.on('error', () => {});
  res.on('error', () => {});

  const decodedUrl = decodeURI(req.url.split('?')[0]);
  let filePath = path.join(ROOT_DIR, decodedUrl);

  const safePath = path.normalize(filePath);
  if (!safePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  if (fs.existsSync(safePath) && fs.statSync(safePath).isDirectory()) {
    filePath = path.join(safePath, 'index.html');
  } else {
    filePath = safePath;
  }

  if (!fs.existsSync(filePath)) {
    const fallbackPath = path.join(__dirname, decodedUrl);
    if (fs.existsSync(fallbackPath) && !fs.statSync(fallbackPath).isDirectory()) {
      filePath = fallbackPath;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
  }

  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Range requests for video streaming & seeking
  const range = req.headers.range;
  if (range && (ext === '.mp4' || ext === '.webm' || ext === '.ogg')) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = (end - start) + 1;

    try {
      const file = fs.createReadStream(filePath, { start, end });
      file.on('error', () => {});
      res.on('close', () => { file.destroy(); });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      };
      res.writeHead(206, head);
      file.pipe(res);
    } catch (e) {
      if (!res.headersSent) {
        res.writeHead(500);
        res.end();
      }
    }
    return;
  }

  const headers = {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Access-Control-Allow-Origin': '*',
    'Accept-Ranges': 'bytes',
    'Cache-Control': ext === '.mp4' ? 'max-age=3600' : 'no-cache, no-store, must-revalidate'
  };

  if (ext === '.pdf') {
    headers['Content-Disposition'] = 'inline; filename="Pritam_Biswas_CV.pdf"';
  }

  try {
    res.writeHead(200, headers);
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {});
    res.on('close', () => { stream.destroy(); });
    stream.pipe(res);
  } catch (e) {
    if (!res.headersSent) {
      res.writeHead(500);
      res.end();
    }
  }
});

server.on('error', (err) => {
  console.log('HTTP Server error:', err.message);
});

server.listen(PORT, () => {
  console.log(`Portfolio server is running live at http://localhost:${PORT}`);
});
