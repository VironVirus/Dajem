const { readFile, writeFile } = require("node:fs/promises");
const { createDecipheriv, scryptSync } = require("node:crypto");

async function main() {
  const [input, output] = process.argv.slice(2);
  const passphrase = process.env.DAJEM_BACKUP_PASSPHRASE;
  if (!input || !passphrase) throw new Error("Provide a backup file and set DAJEM_BACKUP_PASSPHRASE securely.");
  const backup = JSON.parse(await readFile(input, "utf8"));
  if (backup.format !== "dajem-encrypted-backup" || backup.version !== 1 || backup.cipher !== "aes-256-gcm" || backup.kdf !== "scrypt") throw new Error("Unsupported backup format.");
  const key = scryptSync(passphrase, Buffer.from(backup.salt, "base64"), 32);
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(backup.iv, "base64"));
  decipher.setAuthTag(Buffer.from(backup.tag, "base64"));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(backup.ciphertext, "base64")), decipher.final()]);
  key.fill(0);
  const data = JSON.parse(plaintext.toString("utf8"));
  if (data.format !== "dajem-platform-state" || ![1, 2].includes(data.version) || !Array.isArray(data.state?.users) || (data.version === 2 && !Array.isArray(data.files))) throw new Error("Invalid platform backup.");
  if (output) {
    await writeFile(output, plaintext, { mode: 0o600, flag: "wx" });
    console.log("Verified backup and wrote a private plaintext recovery file. Protect and delete it when no longer needed.");
  } else {
    console.log(`Verified platform backup created ${data.createdAt}; ${data.version === 2 ? `${data.files.length} uploaded files included` : "records only"}. No plaintext file was written.`);
  }
}
main().catch(() => { console.error("Backup verification failed. Check the file and passphrase."); process.exitCode = 1; });
