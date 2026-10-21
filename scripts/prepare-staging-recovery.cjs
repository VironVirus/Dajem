const { createDecipheriv, scryptSync } = require("node:crypto");
const { mkdtemp, readFile, writeFile } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");
const readline = require("node:readline");
const { Writable } = require("node:stream");

async function readPassphrase() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("A private terminal is required.");
  const muted = new Writable({ write(_chunk, _encoding, callback) { callback(); } });
  const prompt = readline.createInterface({ input: process.stdin, output: muted, terminal: true });
  process.stdout.write("Backup passphrase (input hidden): ");
  const value = await new Promise((resolve) => prompt.question("", resolve));
  prompt.close();
  process.stdout.write("\n");
  if (!value) throw new Error("No passphrase entered.");
  return value;
}

async function main() {
  const input = process.argv[2];
  if (!input) throw new Error("Provide the encrypted backup file path.");
  const backup = JSON.parse(await readFile(input, "utf8"));
  if (backup.format !== "dajem-encrypted-backup" || backup.version !== 1 || backup.cipher !== "aes-256-gcm" || backup.kdf !== "scrypt") throw new Error("Unsupported backup format.");
  const passphrase = await readPassphrase();
  const key = scryptSync(passphrase, Buffer.from(backup.salt, "base64"), 32);
  let data;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(backup.iv, "base64"));
    decipher.setAuthTag(Buffer.from(backup.tag, "base64"));
    data = JSON.parse(Buffer.concat([decipher.update(Buffer.from(backup.ciphertext, "base64")), decipher.final()]).toString("utf8"));
  } finally {
    key.fill(0);
  }
  if (data.format !== "dajem-platform-state" || data.version !== 2 || !Array.isArray(data.state?.users) || !Array.isArray(data.files)) throw new Error("Invalid or unsupported backup contents.");
  if (data.files.length !== 0) throw new Error("This helper cannot restore uploaded files; no import was created.");
  const stateHex = Buffer.from(JSON.stringify(data.state), "utf8").toString("hex");
  const sql = `USE \`u999427255_dajemstage\`;\nCREATE TABLE dajem_platform_state (state_key VARCHAR(191) NOT NULL PRIMARY KEY, value LONGTEXT NOT NULL, revision BIGINT UNSIGNED NOT NULL DEFAULT 0, updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\nINSERT INTO dajem_platform_state (state_key, value, revision) VALUES ('platform', CONVERT(0x${stateHex} USING utf8mb4), 0);\n`;
  const directory = await mkdtemp(path.join(tmpdir(), "dajem-staging-recovery-"));
  const output = path.join(directory, "staging-import.sql");
  await writeFile(output, sql, { mode: 0o600, flag: "wx" });
  console.log(`Private staging import ready: ${output}`);
  console.log("This file contains unencrypted customer data. Do not share it; remove it after import and verification.");
}

main().catch((error) => {
  console.error(`Recovery preparation failed: ${error.message}`);
  process.exitCode = 1;
});
