import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, getSupabaseStorageBucket } from "./server/platform-backend";
import { readSessionEmail } from "./server/session";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const host = request.headers.get("host");
  if (!host || new URL(origin).host !== host) {
    throw new Error("Cross-site uploads are not allowed.");
  }
}

function safeSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "file";
}

function jsonError(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Upload failed.";
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);

    const sessionEmail = readSessionEmail(request);
    if (!sessionEmail) {
      return jsonError(new Error("Please log in before uploading documents."), 401);
    }

    const formData = await request.formData();
    const documentName = String(formData.get("documentName") ?? "").trim();
    const file = formData.get("file");

    if (!documentName) {
      throw new Error("Document name is required.");
    }

    if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
      throw new Error("Please attach a valid PDF, JPG, or PNG document.");
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error("Each document must be 5MB or less.");
    }

    if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
      throw new Error("Only PDF, JPG, and PNG documents are allowed.");
    }

    const safeEmail = safeSegment(sessionEmail);
    const safeDocument = safeSegment(documentName);
    const safeFileName = safeSegment(file.name);
    const storagePath = `survey-documents/${safeEmail}/${Date.now()}-${safeDocument}-${safeFileName}`;
    const fileSizeKb = Math.max(1, Math.round(file.size / 1024));
    const supabase = getSupabaseAdminClient();

    if (!supabase) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Supabase Storage is required for production document uploads.");
      }

      return NextResponse.json({
        attachment: {
          documentName,
          fileName: file.name,
          fileSizeKb,
          storagePath: `local-preview/${storagePath}`,
        },
      });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from(getSupabaseStorageBucket())
      .upload(storagePath, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      attachment: {
        documentName,
        fileName: file.name,
        fileSizeKb,
        storagePath,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
