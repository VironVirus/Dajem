import { createDecipheriv, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";
import { getIntegrationStatus, readPlatformState } from "./server/platform-backend";
import { readSessionEmail } from "./server/session";

const scrypt = promisify(scryptCallback);
const MAX_ARCHIVE_SIZE = 32 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const email = readSessionEmail(request);
  if (!email) return NextResponse.json({ error: "Please sign in as an administrator." }, { status: 401 });
  try {
    const origin = request.headers.get("origin");
    if (!origin || new URL(origin).host !== request.headers.get("host")) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    if (getIntegrationStatus().backend === "unconfigured") return NextResponse.json({ error: "Persistent records are not configured." }, { status: 503 });
    const current = await readPlatformState();
    if (!current.users.some((user) => user.email.trim().toLowerCase() === email.toLowerCase() && user.role === "admin")) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    const size = Number(request.headers.get("content-length"));
    if (!size || size > MAX_ARCHIVE_SIZE + 8192) return NextResponse.json({ error: "The archive is too large or has no declared size." }, { status: 413 });
    const form = await request.formData();
    const file = form.get("file");
    const passphrase = form.get("passphrase");
    if (!(file instanceof File) || file.size > MAX_ARCHIVE_SIZE || typeof passphrase !== "string" || passphrase.length < 16 || passphrase.length > 256) return NextResponse.json({ error: "Select an archive and enter its passphrase." }, { status: 400 });
    const backup = JSON.parse(await file.text());
    if (backup.format !== "dajem-encrypted-backup" || backup.version !== 1 || backup.cipher !== "aes-256-gcm" || backup.kdf !== "scrypt") throw new Error("Invalid archive");
    const salt = Buffer.from(backup.salt, "base64");
    const iv = Buffer.from(backup.iv, "base64");
    const tag = Buffer.from(backup.tag, "base64");
    if (salt.length !== 16 || iv.length !== 12 || tag.length !== 16 || typeof backup.ciphertext !== "string") throw new Error("Invalid archive");
    const key = await scrypt(passphrase, salt, 32) as Buffer;
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(Buffer.from(backup.ciphertext, "base64")), decipher.final()]);
    key.fill(0);
    const data = JSON.parse(plain.toString("utf8"));
    if (data.format !== "dajem-platform-state" || ![1, 2].includes(data.version) || !Array.isArray(data.state?.users) || (data.version === 2 && !Array.isArray(data.files))) throw new Error("Invalid archive");
    return NextResponse.json({ valid: true, createdAt: data.createdAt, fileCount: data.version === 2 ? data.files.length : 0, includesUploads: data.version === 2 }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "The backup could not be verified. Check the file and passphrase." }, { status: 400 });
  }
}
