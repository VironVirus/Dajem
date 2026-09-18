import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "dajem_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function getSessionSecret() {
  const secret = process.env.DAJEM_SESSION_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("DAJEM_SESSION_SECRET must be configured in production.");
  }

  return "dajem-dev-session-secret";
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function encode(payload: { email: string; issuedAt: string }) {
  const raw = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${raw}.${sign(raw)}`;
}

function decode(token: string) {
  const [raw, signature] = token.split(".");
  if (!raw || !signature) return null;

  const expected = sign(raw);
  if (signature.length !== expected.length) return null;
  const safe = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!safe) return null;

  try {
    const payload = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as {
      email: string;
      issuedAt: string;
    };

    const issuedAt = Date.parse(payload.issuedAt);
    if (!Number.isFinite(issuedAt)) return null;

    const ageMs = Date.now() - issuedAt;
    if (ageMs < 0 || ageMs > SESSION_MAX_AGE_SECONDS * 1000) return null;

    return payload.email?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export function readSessionEmail(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decode(token);
}

export function writeSessionCookie(response: NextResponse, email: string) {
  response.cookies.set(SESSION_COOKIE, encode({ email: email.toLowerCase(), issuedAt: new Date().toISOString() }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}
