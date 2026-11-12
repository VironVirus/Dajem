#!/usr/bin/env node
// Restore uploaded backup files only into a deliberately selected staging Supabase project.
const { createDecipheriv, createHash, scryptSync } = require("node:crypto");
const { readFile } = require("node:fs/promises");
const readline = require("node:readline");

const MAX_ARCHIVE_BYTES = 32 * 1024 * 1024;
const PRODUCTION_PROJECT_REF = "inkttilgzxkqhviejglb";
const ALLOWED_BUCKETS = new Set(["dajem-media", "dajem-documents"]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function projectRefFromUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("DAJEM_STAGING_SUPABASE_URL must be a valid HTTPS Supabase URL.");
  }
  if (url.protocol !== "https:") throw new Error("DAJEM_STAGING_SUPABASE_URL must use HTTPS.");
  const match = url.hostname.match(/^([a-z0-9]+)\.supabase\.co$/i);
  if (!match) throw new Error("DAJEM_STAGING_SUPABASE_URL must use a project.supabase.co hostname.");
  return match[1].toLowerCase();
}

function readStagingConfig(env = process.env) {
  const url = String(env.DAJEM_STAGING_SUPABASE_URL || "").trim();
  const serviceKey = String(env.DAJEM_STAGING_SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !serviceKey) throw new Error("Set DAJEM_STAGING_SUPABASE_URL and DAJEM_STAGING_SUPABASE_SERVICE_ROLE_KEY for a staging project.");
  const projectRef = projectRefFromUrl(url);
  if (projectRef === PRODUCTION_PROJECT_REF) throw new Error("Refusing the production Supabase project. Use a separate staging project.");
  if (env.DAJEM_STAGING_PROJECT_REF && String(env.DAJEM_STAGING_PROJECT_REF).trim().toLowerCase() !== projectRef) {
    throw new Error("DAJEM_STAGING_PROJECT_REF does not match DAJEM_STAGING_SUPABASE_URL.");
  }
  return { url, serviceKey, projectRef };
}

function decodeBase64(value, name) {
  if (typeof value !== "string" || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new Error(`Invalid base64 ${name}.`);
  }
  return Buffer.from(value, "base64");
}

function decryptArchive(rawArchive, passphrase) {
  if (Buffer.byteLength(rawArchive) > MAX_ARCHIVE_BYTES) throw new Error("Backup file is too large.");
  let archive;
  try {
    archive = JSON.parse(rawArchive);
  } catch {
    throw new Error("Backup file is not valid JSON.");
  }
  if (archive.format !== "dajem-encrypted-backup" || archive.version !== 1 || archive.cipher !== "aes-256-gcm" || archive.kdf !== "scrypt") {
    throw new Error("Unsupported backup format. Only DAJEM encrypted backup version 1 is supported.");
  }
  if (typeof passphrase !== "string" || !passphrase) throw new Error("No backup passphrase entered.");
  const key = scryptSync(passphrase, decodeBase64(archive.salt, "salt"), 32);
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, decodeBase64(archive.iv, "IV"));
    decipher.setAuthTag(decodeBase64(archive.tag, "authentication tag"));
    const plaintext = Buffer.concat([decipher.update(decodeBase64(archive.ciphertext, "ciphertext")), decipher.final()]);
    return JSON.parse(plaintext.toString("utf8"));
  } catch {
    throw new Error("The passphrase does not unlock this DAJEM encrypted backup.");
  } finally {
    key.fill(0);
  }
}

function validateFiles(payload) {
  if (payload?.format !== "dajem-platform-state" || payload.version !== 2 || !Array.isArray(payload.files)) {
    throw new Error("Unsupported backup contents. A current DAJEM platform backup with a files array is required.");
  }
  return payload.files.map((file, index) => {
    if (!file || typeof file !== "object") throw new Error(`File ${index + 1} is invalid.`);
    const bucket = String(file.bucket || "");
    const path = String(file.path || "");
    const contentType = String(file.contentType || "application/octet-stream");
    if (!ALLOWED_BUCKETS.has(bucket)) throw new Error(`File ${index + 1} uses an unsupported bucket.`);
    if (!path || path.startsWith("/") || path.includes("\\") || path.split("/").some((part) => !part || part === "." || part === "..")) {
      throw new Error(`File ${index + 1} has an unsafe storage path.`);
    }
    if (/[\r\n\0]/.test(contentType)) throw new Error(`File ${index + 1} has an unsafe content type.`);
    const bytes = decodeBase64(file.data, `data for file ${index + 1}`);
    return { bucket, path, contentType, bytes, sha256: sha256(bytes) };
  });
}

async function restoreFiles(files, storage, { apply = false } = {}) {
  const report = [];
  for (const file of files) {
    const item = { bucket: file.bucket, path: file.path, contentType: file.contentType, bytes: file.bytes.length, sha256: file.sha256, status: apply ? "pending" : "dry-run" };
    if (apply) {
      const { error: uploadError } = await storage.from(file.bucket).upload(file.path, file.bytes, { contentType: file.contentType, upsert: false });
      if (uploadError) {
        if (/already exists|duplicate|409/i.test(String(uploadError.message || uploadError))) throw new Error(`Refusing to overwrite existing staging object: ${file.bucket}/${file.path}`);
        throw new Error(`Could not upload ${file.bucket}/${file.path}: ${uploadError.message || uploadError}`);
      }
      const { data, error: downloadError } = await storage.from(file.bucket).download(file.path);
      if (downloadError || !data) throw new Error(`Could not verify ${file.bucket}/${file.path} after upload.`);
      const restored = Buffer.from(await data.arrayBuffer());
      if (restored.length !== file.bytes.length || sha256(restored) !== file.sha256) throw new Error(`SHA-256 verification failed for ${file.bucket}/${file.path}.`);
      item.status = "restored";
    }
    report.push(item);
  }
  return report;
}

function printReport(report) {
  for (const item of report) console.log(`${item.status}: ${item.bucket}/${item.path}; ${item.bytes} bytes; ${item.contentType}; sha256 ${item.sha256}`);
  console.log(`${report.length} file(s) ${report.some((item) => item.status === "restored") ? "restored and verified" : "listed only; run again with --apply to restore to staging"}.`);
}

async function prompt(question, { hidden = false } = {}) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("A private interactive terminal is required.");
  const output = hidden ? new (require("node:stream").Writable)({ write(_chunk, _encoding, done) { done(); } }) : process.stdout;
  const rl = readline.createInterface({ input: process.stdin, output, terminal: true });
  if (hidden) process.stdout.write(question);
  const value = await new Promise((resolve) => rl.question(hidden ? "" : question, resolve));
  rl.close();
  if (hidden) process.stdout.write("\n");
  return value;
}

async function main() {
  const input = process.argv.find((argument) => !argument.startsWith("--") && argument !== process.argv[0] && argument !== process.argv[1]);
  const apply = process.argv.includes("--apply");
  if (!input) throw new Error("Usage: node scripts/restore-backup-files.cjs <encrypted-backup.json> [--apply]");
  const config = readStagingConfig();
  const rawArchive = await readFile(input, "utf8");
  const passphrase = await prompt("Backup passphrase (input hidden): ", { hidden: true });
  const files = validateFiles(decryptArchive(rawArchive, passphrase));
  if (!apply) return printReport(await restoreFiles(files, null));
  const confirmedRef = (await prompt(`Type staging project reference ${config.projectRef} to restore files: `)).trim().toLowerCase();
  if (confirmedRef !== config.projectRef) throw new Error("Staging project reference was not confirmed. No files were uploaded.");
  const { createClient } = require("@supabase/supabase-js");
  const client = createClient(config.url, config.serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  printReport(await restoreFiles(files, client.storage, { apply: true }));
}

if (require.main === module) main().catch((error) => { console.error(`File restore failed: ${error.message}`); process.exitCode = 1; });

module.exports = { decryptArchive, projectRefFromUrl, readStagingConfig, restoreFiles, validateFiles };
