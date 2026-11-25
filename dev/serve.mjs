import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';

const PORT = 5000;
const ROOT = resolve('dist');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.zip': 'application/zip',
};

/** Resolves a request URL to a file inside dist/, or null when it escapes the root or does not exist. */
function resolveAsset(url) {
  const decoded = decodeURIComponent(url.split('?')[0]);
  let filePath = resolve(join(ROOT, decoded === '/' ? 'index.html' : decoded));
  if (!filePath.startsWith(ROOT + '/') && filePath !== ROOT) {
    return null;
  }
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }
  return existsSync(filePath) ? filePath : null;
}

createServer((req, res) => {
  const asset = resolveAsset(req.url ?? '/');
  if (!asset) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const mime = MIME_TYPES[extname(asset).toLowerCase()] ?? 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime });
  createReadStream(asset).pipe(res);
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Block Saber dev server: http://127.0.0.1:${PORT}/`);
});
