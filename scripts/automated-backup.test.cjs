const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDecipheriv, scryptSync } = require('node:crypto');
const { mkdtemp, readFile, readdir, rm, writeFile } = require('node:fs/promises');
const { createServer } = require('node:http');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { spawn } = require('node:child_process');

test('backup encrypts records and files and preserves the previous copy on failure', async () => {
  let fail = false;
  const monitorEvents = [];
  const server = createServer((req, res) => {
    if (req.url.startsWith('/monitor')) { monitorEvents.push(req.url); res.writeHead(200).end('OK'); return; }
    if (fail) { res.writeHead(500).end(); return; }
    if (req.url.startsWith('/rest/v1/')) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify([{ value: { users: [{ id: 'test' }], orders: [] }, updated_at: '1' }])); return; }
    if (req.url.startsWith('/storage/v1/object/list/')) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(req.url.endsWith('dajem-media') ? [{ id: '1', name: 'photo.webp', metadata: { size: 5, mimetype: 'image/webp' } }] : [])); return; }
    res.end('image');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const home = await mkdtemp(join(tmpdir(), 'dajem-backup-test-'));
  const env = { ...process.env, HOME: home, NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${server.address().port}`, SUPABASE_SERVICE_ROLE_KEY: 'test', DAJEM_AUTOMATED_BACKUP_PASSPHRASE: 'a-test-passphrase-long-enough', DAJEM_BACKUP_HEALTHCHECK_URL: `http://127.0.0.1:${server.address().port}/monitor` };
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
    const names = await readdir(join(home, '.dajem-private-backups'));
    assert.equal(names.filter((name) => /^daily-\d{8}T\d{6}Z\.encrypted\.json$/.test(name)).length, 1);
    assert.deepEqual(monitorEvents, ['/monitor/start', '/monitor']);
    for (let index = 1; index <= 8; index += 1) {
      await writeFile(join(home, '.dajem-private-backups', `daily-2020010${index}T000000Z.encrypted.json`), 'old', { mode: 0o600 });
    }
    assert.equal(await execute(), 0);
    const retained = await readdir(join(home, '.dajem-private-backups'));
    assert.equal(retained.filter((name) => /^daily-\d{8}T\d{6}Z\.encrypted\.json$/.test(name)).length, 7);
    const original = await readFile(file, 'utf8');
    fail = true;
    assert.equal(await execute(), 1);
    assert.equal(await readFile(file, 'utf8'), original);
    assert.deepEqual(monitorEvents, ['/monitor/start', '/monitor', '/monitor/start', '/monitor', '/monitor/start', '/monitor/fail']);
  } finally {
    server.close();
    await rm(home, { recursive: true, force: true });
  }
});
