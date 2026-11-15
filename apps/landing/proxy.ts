import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSessionEmail } from "@repo/ui/lib/server/session";

export async function proxy(request: NextRequest) {
  if (process.env.DAJEM_DEPLOYMENT_LOCK === "true") {
    return new NextResponse("This website is temporarily unavailable.", {
      status: 503,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Retry-After": "300",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  const path = request.nextUrl.pathname;
  if (path === "/access" || path.startsWith("/auth/") || path === "/checkout/callback" || path.startsWith("/api/") || path.startsWith("/_next/") || path.includes(".")) {
    return NextResponse.next();
  }

  let sessionEmail: string | null = null;
  try {
    sessionEmail = await readSessionEmail(request);
  } catch {
    // Fail closed when the backing identity store is unavailable.
  }
  if (!sessionEmail) {
    const destination = new URL("/access", request.url);
    const nextPath = path === "/" ? "/dashboard" : path;
    destination.searchParams.set("next", `${nextPath}${request.nextUrl.search}`);
    return NextResponse.redirect(destination, { headers: { "Cache-Control": "private, no-store" } });
  }

  return NextResponse.next();
}
