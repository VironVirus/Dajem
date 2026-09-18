import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, getSupabaseMediaBucket, readPlatformState } from "./server/platform-backend";
import { readSessionEmail } from "./server/session";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const host = request.headers.get("host");
  if (!host || new URL(origin).host !== host) throw new Error("Cross-site uploads are not allowed.");
}

function safeSegment(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "upload";
}

function hasExpectedFileSignature(bytes: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/webp") return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

function watermarkSvg(width: number, height: number) {
  const size = Math.max(26, Math.round(Math.min(width, height) / 8));
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
        transform="rotate(-28 ${width / 2} ${height / 2})"
        font-family="Arial, sans-serif" font-size="${size}" font-weight="700" letter-spacing="${Math.max(4, Math.round(size / 5))}"
        fill="rgba(255,255,255,0.58)" stroke="rgba(15,23,42,0.32)" stroke-width="1">DAJEM</text>
    </svg>
  `);
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const sessionEmail = readSessionEmail(request);
    if (!sessionEmail) return NextResponse.json({ error: "Please log in before uploading images." }, { status: 401 });

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE_BYTES + 128 * 1024) {
      throw new Error("Each image must be 5MB or less.");
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const scope = String(formData.get("scope") ?? "property");
    if (scope !== "property" && scope !== "farm") throw new Error("Select a valid image destination.");
    if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") throw new Error("Please choose an image file.");
    if (file.size > MAX_FILE_SIZE_BYTES) throw new Error("Each image must be 5MB or less.");
    if (!ALLOWED_MIME_TYPES.has(file.type)) throw new Error("Only JPG, PNG, and WebP images are allowed.");

    const bytes = Buffer.from(await file.arrayBuffer());
    if (!hasExpectedFileSignature(bytes, file.type)) throw new Error("The image does not match its declared file type.");
    const state = await readPlatformState();
    const user = state.users.find((entry) => entry.email.toLowerCase() === sessionEmail.toLowerCase());
    if (!user || (scope === "farm" && user.role !== "admin")) throw new Error("You are not allowed to upload this image.");

    const prepared = sharp(bytes, { failOn: "error", limitInputPixels: 40_000_000 }).rotate();
    const metadata = await prepared.metadata();
    const sourceWidth = metadata.width ?? 1600;
    const sourceHeight = metadata.height ?? 1600;
    const scale = Math.min(1, 1600 / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const output = await prepared
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .composite([{ input: watermarkSvg(width, height), gravity: "centre" }])
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const path = `${scope}/${safeSegment(sessionEmail)}/${Date.now()}-${randomUUID().slice(0, 8)}.webp`;
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      if (process.env.NODE_ENV === "production") throw new Error("Supabase Storage is required for production image uploads.");
      return NextResponse.json({ imageUrl: `data:image/webp;base64,${output.toString("base64")}`, storagePath: `local-preview/${path}` });
    }

    const bucket = getSupabaseMediaBucket();
    const { error } = await supabase.storage.from(bucket).upload(path, output, { contentType: "image/webp", upsert: false });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ imageUrl: data.publicUrl, storagePath: path });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image upload failed." }, { status: 400 });
  }
}
