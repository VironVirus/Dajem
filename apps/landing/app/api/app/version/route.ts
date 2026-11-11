import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    appName: "DAJEM Group",
    appId: "com.dajemgroup.app",
    version: "1.0.3",
    versionCode: 103,
    minSupportedVersion: "1.0.0",
    apkUrl: "/downloads/dajem-app.apk",
    apkSize: "22 MB",
    releasedAt: "2026-11-11T18:00:00Z",
    releaseNotes: [
      "Rebuilt native launcher icon & splash screen with the official DAJEM logo",
      "15x faster mobile page loading via optimized image assets and zero GPU blur lag",
      "Clean, distraction-free mobile app homepage showing DAJEM Orbital, Homes & Farms directly",
      "Removed registration number clutter and redundant banners across app pages",
    ],
    mandatory: false,
  });
}
