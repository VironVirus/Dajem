import { NextRequest, NextResponse } from "next/server";
import { verifyUserEmail } from "@repo/ui/lib/server/platform-repository";
import { writeSessionCookie } from "@repo/ui/lib/server/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  try {
    const result = await verifyUserEmail({
      email: url.searchParams.get("email") ?? "",
      token: url.searchParams.get("token") ?? "",
    });
    const redirect = NextResponse.redirect(new URL("/dashboard?verified=1", request.url));
    writeSessionCookie(redirect, result.sessionEmail);
    return redirect;
  } catch {
    return NextResponse.redirect(new URL("/?verification=failed", request.url));
  }
}
