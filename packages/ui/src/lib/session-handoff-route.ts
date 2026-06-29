import { NextRequest, NextResponse } from "next/server";
import { readSessionHandoffToken, writeSessionCookie } from "./server/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  const payload = readSessionHandoffToken(token, request.nextUrl.origin);
  if (!payload?.email) {
    return NextResponse.redirect(new URL("/?auth=expired", request.nextUrl.origin));
  }

  const response = NextResponse.redirect(new URL(payload.nextPath, request.nextUrl.origin));
  writeSessionCookie(response, payload.email);
  return response;
}
