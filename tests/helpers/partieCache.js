"use strict";

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');
const CACHE_DIR = path.join(os.tmpdir(), 'cage-legacy-cache-tests');
const memory = new Map();

function empreinte(files, appelant, args, seed){
  const hash = crypto.createHash('sha1');
  for(const rel of files){ hash.update(rel).update('\0').update(fs.readFileSync(path.join(ROOT, rel))); }
  hash.update('\0').update(appelant).update('\0').update(JSON.stringify(args)).update('\0').update(String(seed));
  return hash.digest('hex');
}

function nettoyer(){
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const maintenant = Date.now();
  const entries = fs.readdirSync(CACHE_DIR).map(name => {
    const file = path.join(CACHE_DIR, name);
    try { return { file, stat: fs.statSync(file) }; } catch(_){ return null; }
  }).filter(Boolean);
  for(const entry of entries){ if(maintenant - entry.stat.mtimeMs > 7 * 86400000) fs.rmSync(entry.file, { force: true }); }
  const actifs = entries.filter(e => maintenant - e.stat.mtimeMs <= 7 * 86400000).sort((a,b) => a.stat.mtimeMs - b.stat.mtimeMs);
  let total = actifs.reduce((n,e) => n + e.stat.size, 0);
  while(total > 2 * 1024 * 1024 * 1024 && actifs.length){ const e = actifs.shift(); total -= e.stat.size; fs.rmSync(e.file, { force: true }); }
}

function wrapper(window, files, nom, orig){
  return function(...args){
    const seed = window.eval('SEED');
    const key = empreinte(files, nom, args, seed);
    let record = memory.get(key);
    const file = path.join(CACHE_DIR, key + '.json');
    if(!record){
      try { record = JSON.parse(fs.readFileSync(file, 'utf8')); } catch(_) { record = null; }
    }
    if(record){
      window.__cacheTmp = JSON.parse(record.partie);
      window.eval(`SEED=${record.seedApres}; _idCounter=${record.idCounterApres}; G.mgmt=window.__cacheTmp`);
      memory.set(key, record);
      return window.__cacheTmp;
    }
    const partie = orig.apply(this, args);
    record = { partie: JSON.stringify(partie), seedApres: window.eval('SEED'), idCounterApres: window.eval('_idCounter') };
    memory.set(key, record);
    nettoyer();
    const tmp = file + '.' + process.pid + '.' + Date.now() + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(record));
    fs.renameSync(tmp, file);
    return partie;
  };
}

function installer(window, files){
  if(process.env.CL_TEST_CACHE === '0') return;
  nettoyer();
  if(typeof window.mgmtPasseGenerer === 'function'){
    const orig = window.mgmtPasseGenerer;
    window.mgmtPasseGenerer = wrapper(window, files, 'passe', orig);
  }
  if(typeof window.mgmtMondeVivantGenerer === 'function'){
    const orig = window.mgmtMondeVivantGenerer;
    window.mgmtMondeVivantGenerer = wrapper(window, files, 'monde', orig);
  }
}

module.exports = { installer, empreinte, CACHE_DIR, memory };
