import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { readPlatformState } from "./platform-backend";

export const SESSION_COOKIE = "dajem_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
const ADMIN_MAX_AGE_SECONDS = 60 * 60;

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

type SessionPayload = { email: string; userId: string; sessionVersion: string; mfaConfirmed: boolean; issuedAt: string; version: 2 };

function encode(payload: SessionPayload) {
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
    const payload = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as SessionPayload;
    if (payload.version !== 2 || typeof payload.email !== "string" || typeof payload.userId !== "string" || typeof payload.sessionVersion !== "string") return null;

    const issuedAt = Date.parse(payload.issuedAt);
    if (!Number.isFinite(issuedAt)) return null;

    const ageMs = Date.now() - issuedAt;
    if (ageMs < 0 || ageMs > SESSION_MAX_AGE_SECONDS * 1000) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function readSessionEmail(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = decode(token);
  if (!payload) return null;
  const state = await readPlatformState();
  const user = state.users.find((entry) => entry.id === payload.userId && entry.email.toLowerCase() === payload.email.toLowerCase());
  if (!user || !user.emailVerified || (user.sessionVersion ?? "initial") !== payload.sessionVersion) return null;
  if (user.mfaEnabled && !payload.mfaConfirmed) return null;
  if (user.role === "admin" && Date.now() - Date.parse(payload.issuedAt) > ADMIN_MAX_AGE_SECONDS * 1000) return null;
  return user.email;
}

export async function writeSessionCookie(response: NextResponse, email: string, mfaConfirmed = false) {
  const state = await readPlatformState();
  const user = state.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (!user?.emailVerified || (user.mfaEnabled && !mfaConfirmed)) throw new Error("Account verification is required before signing in.");
  const maxAge = user.role === "admin" ? ADMIN_MAX_AGE_SECONDS : SESSION_MAX_AGE_SECONDS;
  response.cookies.set(SESSION_COOKIE, encode({ email: user.email, userId: user.id, sessionVersion: user.sessionVersion ?? "initial", mfaConfirmed, issuedAt: new Date().toISOString(), version: 2 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
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
