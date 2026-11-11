import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    appName: "DAJEM Group",
    appId: "com.dajemgroup.app",
    version: "1.0.1",
    versionCode: 101,
    minSupportedVersion: "1.0.0",
    apkUrl: "/downloads/dajem-app.apk",
    apkSize: "22 MB",
    releasedAt: "2026-11-11T10:00:00Z",
    releaseNotes: [
      "Dynamic Island & Floating Glass navigation across Orbital, Homes, and Farms",
      "Interactive SURCON UTM 32N CAD blueprint with real-time perimeter fee calculator",
      "Verified property listings with C of O badges and tracked escrow bidding",
      "Cold-chain grocery store with Chicken Cut Studio prep styles and Flutterwave checkout",
      "Hostinger push-to-deploy instant updates",
    ],
    mandatory: false,
  });
}

