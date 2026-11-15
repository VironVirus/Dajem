import { NextRequest, NextResponse } from "next/server";
import { listApprovedLiftingEstates, lookupApprovedLiftingPlot } from "@repo/ui/lib/server/platform-repository";
import { readSessionEmail } from "@repo/ui/lib/server/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionEmail = await readSessionEmail(request);
  if (!sessionEmail) return NextResponse.json({ error: "Sign in to view lifting estates." }, { status: 401 });
  const estateId = request.nextUrl.searchParams.get("estate")?.slice(0, 100);
  const plotNumber = request.nextUrl.searchParams.get("plot")?.slice(0, 40);
  if (estateId && plotNumber) {
    const plot = await lookupApprovedLiftingPlot(sessionEmail, estateId, plotNumber);
    return NextResponse.json({ plot }, { headers: { "Cache-Control": "private, no-store" } });
  }
  return NextResponse.json({ estates: await listApprovedLiftingEstates(sessionEmail) }, { headers: { "Cache-Control": "private, no-store" } });
}
