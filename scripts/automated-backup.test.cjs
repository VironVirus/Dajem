const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDecipheriv, scryptSync } = require('node:crypto');
const { mkdtemp, readFile, rm } = require('node:fs/promises');
const { createServer } = require('node:http');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { spawn } = require('node:child_process');

test('backup encrypts records and files and preserves the previous copy on failure', async () => {
  let fail = false;
  const server = createServer((req, res) => {
    if (fail) { res.writeHead(500).end(); return; }
    if (req.url.startsWith('/rest/v1/')) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify([{ value: { users: [{ id: 'test' }], orders: [] }, updated_at: '1' }])); return; }
    if (req.url.startsWith('/storage/v1/object/list/')) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(req.url.endsWith('dajem-media') ? [{ id: '1', name: 'photo.webp', metadata: { size: 5, mimetype: 'image/webp' } }] : [])); return; }
    res.end('image');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const home = await mkdtemp(join(tmpdir(), 'dajem-backup-test-'));
  const env = { ...process.env, HOME: home, NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${server.address().port}`, SUPABASE_SERVICE_ROLE_KEY: 'test', DAJEM_AUTOMATED_BACKUP_PASSPHRASE: 'a-test-passphrase-long-enough' };
  const execute = () => new Promise((resolve) => { const child = spawn(process.execPath, [join(__dirname, 'automated-backup.cjs')], { env, stdio: 'ignore' }); child.on('exit', resolve); });
  try {
    assert.equal(await execute(), 0);
    const file = join(home, '.dajem-private-backups', 'daily.encrypted.json');
    const archive = JSON.parse(await readFile(file, 'utf8'));
    const decipher = createDecipheriv('aes-256-gcm', scryptSync(env.DAJEM_AUTOMATED_BACKUP_PASSPHRASE, Buffer.from(archive.salt, 'base64'), 32), Buffer.from(archive.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(archive.tag, 'base64'));
    const recovered = JSON.parse(Buffer.concat([decipher.update(Buffer.from(archive.ciphertext, 'base64')), decipher.final()]));
    assert.equal(recovered.state.users[0].id, 'test');
    assert.equal(Buffer.from(recovered.files[0].data, 'base64').toString(), 'image');
    const original = await readFile(file, 'utf8');
    fail = true;
    assert.equal(await execute(), 1);
    assert.equal(await readFile(file, 'utf8'), original);
  } finally {
    server.close();
    await rm(home, { recursive: true, force: true });
  }
});
