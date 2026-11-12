const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createCipheriv, randomBytes, scryptSync } = require("node:crypto");
const { decryptArchive, readStagingConfig, restoreFiles, validateFiles } = require("./restore-backup-files.cjs");

function encryptedPayload(payload, passphrase = "a private test passphrase long enough") {
  const salt = randomBytes(16), iv = randomBytes(12), key = scryptSync(passphrase, salt, 32);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload)), cipher.final()]);
  return { raw: JSON.stringify({ format: "dajem-encrypted-backup", version: 1, cipher: "aes-256-gcm", kdf: "scrypt", salt: salt.toString("base64"), iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), ciphertext: ciphertext.toString("base64") }), passphrase };
}

function samplePayload(files = []) {
  return { format: "dajem-platform-state", version: 2, state: { users: [], orders: [] }, files };
}

test("decrypts the supported encrypted archive and lists file metadata", async () => {
  const archive = encryptedPayload(samplePayload([{ bucket: "dajem-media", path: "test/photo.webp", contentType: "image/webp", data: Buffer.from("image bytes").toString("base64") }]));
  const files = validateFiles(decryptArchive(archive.raw, archive.passphrase));
  const report = await restoreFiles(files, null);
  assert.deepEqual(report.map(({ bucket, path, contentType, bytes, status }) => ({ bucket, path, contentType, bytes, status })), [{ bucket: "dajem-media", path: "test/photo.webp", contentType: "image/webp", bytes: 11, status: "dry-run" }]);
  assert.match(report[0].sha256, /^[a-f0-9]{64}$/);
});

test("refuses production, non-Supabase, and mismatched staging targets", () => {
  const key = "test-service-key";
  assert.throws(() => readStagingConfig({ DAJEM_STAGING_SUPABASE_URL: "https://inkttilgzxkqhviejglb.supabase.co", DAJEM_STAGING_SUPABASE_SERVICE_ROLE_KEY: key }), /production/i);
  assert.throws(() => readStagingConfig({ DAJEM_STAGING_SUPABASE_URL: "https://example.com", DAJEM_STAGING_SUPABASE_SERVICE_ROLE_KEY: key }), /project\.supabase\.co/i);
  assert.throws(() => readStagingConfig({ DAJEM_STAGING_SUPABASE_URL: "https://stagingref.supabase.co", DAJEM_STAGING_SUPABASE_SERVICE_ROLE_KEY: key, DAJEM_STAGING_PROJECT_REF: "different" }), /does not match/i);
});

test("refuses invalid archive payloads and unsafe file paths", () => {
  const archive = encryptedPayload({ format: "dajem-platform-state", version: 1, files: [] });
  assert.throws(() => validateFiles(decryptArchive(archive.raw, archive.passphrase)), /current DAJEM platform backup/i);
  assert.throws(() => validateFiles(samplePayload([{ bucket: "dajem-media", path: "../outside.txt", data: "WA==" }])), /unsafe storage path/i);
  assert.throws(() => validateFiles(samplePayload([{ bucket: "other-bucket", path: "file.txt", data: "WA==" }])), /unsupported bucket/i);
  assert.throws(() => validateFiles(samplePayload([{ bucket: "dajem-media", path: "file.txt", data: "invalid*base64" }])), /Invalid base64/i);
});

test("uploads without overwrite and verifies bytes through a fake staging storage client", async () => {
  const files = validateFiles(samplePayload([{ bucket: "dajem-documents", path: "recovery/test.pdf", contentType: "application/pdf", data: Buffer.from("safe test document").toString("base64") }]));
  const stored = new Map();
  const storage = { from(bucket) { return { upload: async (path, bytes, options) => {
    assert.equal(options.upsert, false);
    const key = `${bucket}/${path}`;
    if (stored.has(key)) return { error: { message: "already exists" } };
    stored.set(key, Buffer.from(bytes));
    return { error: null };
  }, download: async (path) => {
    const bytes = stored.get(`${bucket}/${path}`);
    return bytes ? { data: new Blob([bytes]), error: null } : { data: null, error: { message: "not found" } };
  } }; } };
  const report = await restoreFiles(files, storage, { apply: true });
  assert.equal(report[0].status, "restored");
  await assert.rejects(() => restoreFiles(files, storage, { apply: true }), /Refusing to overwrite/);
});
