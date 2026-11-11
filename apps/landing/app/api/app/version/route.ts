import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    appName: "DAJEM Group",
    appId: "com.dajemgroup.app",
    version: "1.0.2",
    versionCode: 102,
    minSupportedVersion: "1.0.0",
    apkUrl: "/downloads/dajem-app.apk",
    apkSize: "22 MB",
    releasedAt: "2026-11-11T17:15:00Z",
    releaseNotes: [
      "Unified Android app synced 1:1 with the full DAJEM web application (Option 1 Dynamic Island & Floating Glass)",
      "DAJEM Orbital: full 10-service estimator, consultation booking, document upload desk, DHL shipping & plan tracker",
      "DAJEM Homes: all property types & house types, tracked bidding, and owner/agent property submission",
      "DAJEM Farms: all 7 categories, Chicken Order Studio (up to 30 cuts), Bulk Supply, and Flutterwave checkout",
      "Native Android Back button navigation + automatic APK & Hostinger cloud updates",
    ],
    mandatory: false,
  });
}
