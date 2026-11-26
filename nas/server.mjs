// Mini-Server für das NAS: liefert die App aus (dist/) und speichert die
// Einheiten der Familie in einer JSON-Datei. Keine externen Abhängigkeiten.
// Die API ist kompatibel zur Supabase-REST-Schnittstelle, die die App nutzt.
import { createServer } from 'node:http';
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const PORT = Number(process.env.PORT || 8080);
const DIST = resolve(process.env.DIST_DIR || './dist');
const DATA_DIR = resolve(process.env.DATA_DIR || './data');
const DATA_FILE = join(DATA_DIR, 'completions.json');
const FAMILY = process.env.FAMILY_CODE || 'familie-ski-2027';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon',
};

await mkdir(DATA_DIR, { recursive: true });
let rows = [];
if (existsSync(DATA_FILE)) {
  try { rows = JSON.parse(await readFile(DATA_FILE, 'utf8')); } catch { rows = []; }
}

let writing = Promise.resolve();
const persist = () => {
  writing = writing.then(async () => {
    const tmp = `${DATA_FILE}.tmp`;
    await writeFile(tmp, JSON.stringify(rows));
    await rename(tmp, DATA_FILE);
  });
  return writing;
};

const json = (res, code, body) => {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((ok, fail) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > 1_000_000) { fail(new Error('too large')); req.destroy(); }
      else chunks.push(c);
    });
    req.on('end', () => ok(Buffer.concat(chunks).toString('utf8')));
    req.on('error', fail);
  });

const valid = (r) =>
  r && typeof r.id === 'string' && r.id.length <= 64 && typeof r.person === 'string' && r.person.length <= 20 &&
  Number.isInteger(r.session_idx) && typeof r.title === 'string' && r.title.length <= 100 &&
  typeof r.completed_at === 'string' && !Number.isNaN(Date.parse(r.completed_at)) &&
  Number.isInteger(r.points) && Number.isInteger(r.effort);

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');

    if (url.pathname === '/config.js') {
      res.writeHead(200, { 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' });
      res.end(`window.SKIFIT={supabaseUrl:location.origin,supabaseKey:'local',familyCode:${JSON.stringify(FAMILY)}};`);
      return;
    }

    if (url.pathname === '/rest/v1/completions') {
      if (req.method === 'GET') {
        const fam = (url.searchParams.get('family') || '').replace(/^eq\./, '');
        const out = rows.filter((r) => r.family === fam).sort((a, b) => a.completed_at.localeCompare(b.completed_at));
        return json(res, 200, out);
      }
      if (req.method === 'POST') {
        const body = JSON.parse(await readBody(req));
        const list = Array.isArray(body) ? body : [body];
        const known = new Set(rows.map((r) => r.id));
        for (const r of list) {
          if (!valid(r) || known.has(r.id)) continue;
          rows.push({ id: r.id, family: FAMILY, person: r.person, session_idx: r.session_idx, title: r.title, completed_at: r.completed_at, points: r.points, effort: r.effort });
          known.add(r.id);
        }
        await persist();
        res.writeHead(201);
        res.end();
        return;
      }
      return json(res, 405, { error: 'method not allowed' });
    }

    let file = normalize(join(DIST, decodeURIComponent(url.pathname)));
    if (!file.startsWith(DIST)) { res.writeHead(403); res.end(); return; }
    if (url.pathname.endsWith('/') || !existsSync(file)) file = join(DIST, 'index.html');
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    json(res, 400, { error: 'bad request' });
  }
}).listen(PORT, () => console.log(`Ski-Fit läuft auf Port ${PORT} (Daten: ${DATA_FILE})`));
