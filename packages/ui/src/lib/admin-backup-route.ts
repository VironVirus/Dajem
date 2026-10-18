import { createCipheriv, randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";
import { getIntegrationStatus, getSupabaseAdminClient, getSupabaseMediaBucket, getSupabaseStorageBucket, readPlatformState } from "./server/platform-backend";
import { readSessionEmail } from "./server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const scrypt = promisify(scryptCallback);
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const MAX_FILES = 2000;
const MAX_ARCHIVE_BYTES = 32 * 1024 * 1024;

async function collectUploads() {
  const client = getSupabaseAdminClient();
  if (!client) throw new Error("File storage is not configured. A complete backup cannot be created.");
  const files: { bucket: string; path: string; contentType: string; data: string }[] = [];
  let bytes = 0;
  for (const bucket of new Set([getSupabaseMediaBucket(), getSupabaseStorageBucket()])) {
    const directories = [""];
    while (directories.length) {
      const directory = directories.pop()!;
      for (let offset = 0; ; offset += 100) {
        const { data, error } = await client.storage.from(bucket).list(directory, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
        if (error || !data) throw new Error("Could not list all uploaded files. No backup was created.");
        for (const item of data) {
          const path = directory ? `${directory}/${item.name}` : item.name;
          if (!item.id) {
            if (path.split("/").length > 32 || directories.length >= MAX_FILES) throw new Error("The file storage is too large to back up in the app.");
            directories.push(path);
            continue;
          }
          if (files.length >= MAX_FILES) throw new Error("The file storage is too large to back up in the app.");
          const expectedSize = Number(item.metadata?.size ?? 0);
          if (Number.isFinite(expectedSize) && bytes + expectedSize > MAX_UPLOAD_BYTES) throw new Error("Uploaded files exceed the 20 MB in-app backup limit. Use a separate storage backup instead.");
          const result = await client.storage.from(bucket).download(path);
          if (result.error || !result.data) throw new Error("An uploaded file could not be downloaded. No backup was created.");
          if (bytes + result.data.size > MAX_UPLOAD_BYTES) throw new Error("Uploaded files exceed the 20 MB in-app backup limit. Use a separate storage backup instead.");
          const buffer = Buffer.from(await result.data.arrayBuffer());
          bytes += buffer.length;
          files.push({ bucket, path, contentType: String(item.metadata?.mimetype || result.data.type || "application/octet-stream"), data: buffer.toString("base64") });
        }
        if (data.length < 100) break;
      }
    }
  }
  return files;
}

export async function POST(request: NextRequest) {
  const email = readSessionEmail(request);
  if (!email) return NextResponse.json({ error: "Please sign in as an administrator." }, { status: 401 });
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try {
    sameOrigin = Boolean(origin && request.headers.get("host") && new URL(origin).host === request.headers.get("host"));
  } catch {
    sameOrigin = false;
  }
  if (!sameOrigin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const passphrase = body?.passphrase;
    if (typeof passphrase !== "string" || passphrase.length < 16 || passphrase.length > 256) {
      return NextResponse.json({ error: "Use a backup passphrase between 16 and 256 characters." }, { status: 400 });
    }
    if (getIntegrationStatus().backend === "unconfigured") {
      return NextResponse.json({ error: "Persistent records are not configured." }, { status: 503 });
    }
    const state = await readPlatformState();
    const user = state.users.find((entry) => entry.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (user?.role !== "admin") return NextResponse.json({ error: "Administrator access required." }, { status: 403 });

    const files = await collectUploads();
    const currentState = await readPlatformState();
    if (JSON.stringify(state) !== JSON.stringify(currentState)) {
      return NextResponse.json({ error: "Records changed during backup. Please try again when activity is low." }, { status: 409 });
    }
    const salt = randomBytes(16);
    const iv = randomBytes(12);
    const key = await scrypt(passphrase, salt, 32) as Buffer;
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const createdAt = new Date().toISOString();
    const plaintext = JSON.stringify({ format: "dajem-platform-state", version: 2, createdAt, state, files });
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    key.fill(0);
    const archive = JSON.stringify({
      format: "dajem-encrypted-backup", version: 1, cipher: "aes-256-gcm", kdf: "scrypt",
      salt: salt.toString("base64"), iv: iv.toString("base64"),
      tag: cipher.getAuthTag().toString("base64"), ciphertext: encrypted.toString("base64"),
    });
    if (Buffer.byteLength(archive, "utf8") > MAX_ARCHIVE_BYTES) {
      return NextResponse.json({ error: "The encrypted backup exceeds the 32 MB in-app recovery limit. Use a separate backup method." }, { status: 413 });
    }
    return new NextResponse(archive, { headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="dajem-records-${createdAt.slice(0, 10)}.encrypted.json"`,
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) {
    const message = error instanceof Error && /^(File storage|Could not list|An uploaded|Uploaded files exceed|The file storage is too large)/.test(error.message)
      ? error.message : "The backup could not be created. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
