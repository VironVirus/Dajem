#!/usr/bin/env node
// Hostinger cron: keep one encrypted, recovery-compatible copy outside the web root.
const { createCipheriv, createDecipheriv, randomBytes, scryptSync } = require('node:crypto');
const { chmod, mkdir, rename, rm, writeFile } = require('node:fs/promises');
const { homedir } = require('node:os');
const { join } = require('node:path');

const MAX_BYTES = 20 * 1024 * 1024;
const MAX_FILES = 2000;

async function run() {
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const passphrase = process.env.DAJEM_AUTOMATED_BACKUP_PASSPHRASE;
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '');
  if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) throw new Error('Supabase requires HTTPS');
  if (!secret || !passphrase || passphrase.length < 16 || passphrase.length > 256) throw new Error('Backup credentials are not configured');
  const headers = { apikey: secret, Authorization: `Bearer ${secret}` };
  const api = async (path, options = {}) => {
    const response = await fetch(new URL(path, url.origin), { ...options, headers: { ...headers, ...options.headers }, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Backup source request failed (${response.status})`);
    return response;
  };
  const table = process.env.SUPABASE_DAJEM_STATE_TABLE || 'dajem_state';
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(table)) throw new Error('Invalid state table');
  const key = process.env.SUPABASE_DAJEM_STATE_KEY || 'platform';
  const statePath = `/rest/v1/${table}?select=value,updated_at&key=eq.${encodeURIComponent(key)}`;
  async function readState() {
    const rows = await (await api(statePath)).json();
    if (!Array.isArray(rows) || rows.length !== 1 || !rows[0].value || !Array.isArray(rows[0].value.users)) throw new Error('Platform state is unavailable');
    return rows[0];
  }
  const before = await readState();
  const files = [];
  let bytes = 0;
  for (const bucket of new Set([process.env.SUPABASE_MEDIA_BUCKET || 'dajem-media', process.env.SUPABASE_STORAGE_BUCKET || 'dajem-documents'])) {
    const directories = [''];
    while (directories.length) {
      const prefix = directories.pop();
      for (let offset = 0; ; offset += 100) {
        const list = await (await api(`/storage/v1/object/list/${encodeURIComponent(bucket)}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prefix, limit: 100, offset, sortBy: { column: 'name', order: 'asc' } }),
        })).json();
        if (!Array.isArray(list)) throw new Error('Invalid storage listing');
        for (const item of list) {
          const path = prefix ? `${prefix}/${item.name}` : item.name;
          if (!item.id) {
            if (path.split('/').length > 32 || directories.length >= MAX_FILES) throw new Error('Storage directory limit exceeded');
            directories.push(path);
            continue;
          }
          if (files.length >= MAX_FILES || bytes + Number(item.metadata?.size || 0) > MAX_BYTES) throw new Error('Storage backup limit exceeded');
          const response = await api(`/storage/v1/object/${encodeURIComponent(bucket)}/${path.split('/').map(encodeURIComponent).join('/')}`);
          const data = Buffer.from(await response.arrayBuffer());
          bytes += data.length;
          if (bytes > MAX_BYTES) throw new Error('Storage backup limit exceeded');
          files.push({ bucket, path, contentType: item.metadata?.mimetype || response.headers.get('content-type') || 'application/octet-stream', data: data.toString('base64') });
        }
        if (list.length < 100) break;
      }
    }
  }
  const after = await readState();
  if (before.updated_at !== after.updated_at || JSON.stringify(before.value) !== JSON.stringify(after.value)) throw new Error('Records changed during backup; retry later');
  const plaintext = Buffer.from(JSON.stringify({ format: 'dajem-platform-state', version: 2, createdAt: new Date().toISOString(), state: before.value, files }));
  const salt = randomBytes(16), iv = randomBytes(12), derived = scryptSync(passphrase, salt, 32);
  const cipher = createCipheriv('aes-256-gcm', derived, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  const archive = JSON.stringify({ format: 'dajem-encrypted-backup', version: 1, cipher: 'aes-256-gcm', kdf: 'scrypt', salt: salt.toString('base64'), iv: iv.toString('base64'), tag: tag.toString('base64'), ciphertext: encrypted.toString('base64') });
  if (Buffer.byteLength(archive) > 32 * 1024 * 1024) throw new Error('Encrypted archive limit exceeded');
  const verifier = createDecipheriv('aes-256-gcm', derived, iv);
  verifier.setAuthTag(tag);
  const verified = Buffer.concat([verifier.update(encrypted), verifier.final()]);
  if (!verified.equals(plaintext)) throw new Error('Backup verification failed');
  derived.fill(0); plaintext.fill(0); verified.fill(0);
  const directory = join(homedir(), '.dajem-private-backups');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await chmod(directory, 0o700);
  const temporary = join(directory, `.backup-${randomBytes(12).toString('hex')}.tmp`);
  try {
    await writeFile(temporary, archive, { mode: 0o600, flag: 'wx' });
    await rename(temporary, join(directory, 'daily.encrypted.json'));
  } finally {
    await rm(temporary, { force: true });
  }
  console.log(`DAJEM backup completed; ${files.length} files, ${bytes} bytes.`);
}

run().catch((error) => { console.error(`DAJEM backup failed: ${error.message}`); process.exitCode = 1; });
