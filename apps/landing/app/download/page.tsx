"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Header,
  Footer,
  Badge,
  Button,
} from "@repo/ui";
import {
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  QrCode,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Layers,
  Zap,
} from "lucide-react";

export default function DownloadPage() {
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownload = () => {
    setDownloadStarted(true);
    // Trigger download
    const link = document.createElement("a");
    link.href = "/downloads/dajem-app.apk";
    link.download = "dajem-app.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Header activeApp="landing" />

      <main className="container mx-auto max-w-4xl px-4 py-10 sm:py-16 flex-1">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge variant="outline" className="px-3.5 py-1 text-xs font-black border-emerald-500/30 text-emerald-500 bg-emerald-500/10 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
            Official Android APK Release • v1.0.1
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Download the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600">DAJEM Group</span> Android App
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Get instant access to <strong>DAJEM Orbital</strong> (Survey CAD), <strong>DAJEM Homes</strong> (Verified Real Estate), and <strong>DAJEM Farms</strong> (Cold-Chain E-Commerce) right on your Android phone.
          </p>
        </div>

        {/* Main Download Card */}
        <div className="mt-8 sm:mt-12 p-6 sm:p-10 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-xl shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-muted-foreground font-mono">
                <span className="px-2.5 py-1 rounded-md bg-muted font-bold text-foreground">v1.0.1 Stable</span>
                <span>•</span>
                <span>22.0 MB</span>
                <span>•</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified by DAJEM Group
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black">
                Ready to install on any Android 8.0+ device
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground">
                Equipped with automatic in-app updates: as soon as new features or native builds are released, your app notifies you and downloads updates seamlessly.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Button
                  size="lg"
                  onClick={handleDownload}
                  className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2.5"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Android APK (22 MB)</span>
                </Button>

                <Link
                  href="/app"
                  className="w-full sm:w-auto h-13 px-6 rounded-2xl border border-border/80 bg-background/60 hover:bg-accent font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>Open in Mobile Web</span>
                </Link>
              </div>

              {downloadStarted && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Your APK download has started! Once downloaded, tap the file in your notification bar to install.</span>
                </div>
              )}
            </div>

            {/* QR Code Card for Scanning from Phone */}
            <div className="p-5 rounded-2xl border border-border/80 bg-background/90 text-center flex flex-col items-center gap-3 shrink-0 shadow-md">
              <div className="w-36 h-36 rounded-xl bg-white p-2 flex items-center justify-center shadow-inner">
                {/* SVG QR Code Illustration pointing to direct download */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950 fill-current">
                  <path d="M10 10h30v30h-30z M15 15v20h20v-20z M20 20h10v10h-10z M60 10h30v30h-30z M65 15v20h20v-20z M70 20h10v10h-10z M10 60h30v30h-30z M15 65v20h20v-20z M20 70h10v10h-10z M45 10h10v10h-10z M45 25h10v10h-10z M45 45h10v10h-10z M10 45h20v10h-20z M60 45h15v10h-15z M80 45h10v20h-10z M45 60h10v20h-10z M60 60h15v10h-15z M80 70h10v20h-10z M60 80h15v10h-15z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-black flex items-center justify-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Scan to Download</span>
                </div>
                <div className="text-[10px] text-muted-foreground">Scan with phone camera to download directly</div>
              </div>
            </div>
          </div>

          {/* 3-Step Installation Guide */}
          <div className="pt-6 border-t border-border/70 space-y-4">
            <h3 className="text-base font-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>How to Install the APK on Your Android Device</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h4 className="text-xs font-black">Download the APK file</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Tap the green <strong>Download Android APK</strong> button above. If Chrome prompts <em>"File might be harmful"</em>, tap <strong>Download anyway</strong> (this is standard for direct APK downloads).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h4 className="text-xs font-black">Allow installation</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Open the downloaded file from your notifications. If prompted to allow installs from unknown sources, tap <strong>Settings</strong> and toggle on <strong>Allow from this source</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-black flex items-center justify-center">
                  3
                </span>
                <h4 className="text-xs font-black">Open &amp; Enjoy Instant Sync</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Tap <strong>Install</strong>. Once complete, tap <strong>Open</strong>. Your app connects directly to the live Hostinger cloud and automatically receives all future updates!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="p-4 rounded-2xl border border-border/60 bg-card/40 space-y-1">
            <div className="text-cyan-400 font-bold text-xs uppercase tracking-wider font-mono">01 • DAJEM ORBITAL</div>
            <div className="text-sm font-black">SURCON CAD Plan &amp; Geomatics</div>
            <p className="text-xs text-muted-foreground">UTM 32N parcel blueprint, live beacon coordinates, and zoning calculator.</p>
          </div>

          <div className="p-4 rounded-2xl border border-border/60 bg-card/40 space-y-1">
            <div className="text-blue-400 font-bold text-xs uppercase tracking-wider font-mono">02 • DAJEM HOMES</div>
            <div className="text-sm font-black">Verified Property Listings</div>
            <p className="text-xs text-muted-foreground">C of O verified duplexes, short-lets, and serviced plots with escrow bids.</p>
          </div>

          <div className="p-4 rounded-2xl border border-border/60 bg-card/40 space-y-1">
            <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">03 • DAJEM FARMS</div>
            <div className="text-sm font-black">Cold-Chain Food Market</div>
            <p className="text-xs text-muted-foreground">Broiler chickens with Cut Studio butchery cuts, fresh eggs, and catfish.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

