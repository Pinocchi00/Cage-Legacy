'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, 'out');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/project/';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (p.endsWith('/')) {
    const liste = JSON.parse(fs.readFileSync(path.join(ROOT, 'liste.json'), 'utf8'));
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(liste.map(x => `<a href="/project/${x}">${x}</a>`).join('<br>'));
  }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end(); }
    const t = p.startsWith('/_blob/') ? 'image/jpeg' : (TYPES[path.extname(f)] || 'application/octet-stream');
    res.writeHead(200, { 'content-type': t, 'cache-control': 'no-store' });
    res.end(d);
  });
}).listen(8790, '127.0.0.1');
