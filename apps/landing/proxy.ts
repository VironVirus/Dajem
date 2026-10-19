import { NextResponse } from "next/server";

export function proxy() {
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

  return NextResponse.next();
}
