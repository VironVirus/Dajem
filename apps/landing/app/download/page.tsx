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
  Sparkles,
  Copy,
  Check,
  Compass,
  House,
  Egg,
} from "lucide-react";

export default function DownloadPage() {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownload = () => {
    setDownloadStarted(true);
    const link = document.createElement("a");
    link.href = "/downloads/dajem-app.apk";
    link.download = "dajem-app.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyUrl = async () => {
    const fullUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/downloads/dajem-app.apk`
        : "https://dajemgroup.com/downloads/dajem-app.apk";
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback ignored if clipboard permission unavailable
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Header activeApp="landing" />

      <main className="container mx-auto max-w-4xl px-4 py-10 sm:py-16 flex-1">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge variant="outline" className="px-3.5 py-1 text-xs font-black border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
            Official Android APK Release • v1.0.2
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Download the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-emerald-500 to-blue-600">DAJEM Group</span> Android App
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            The complete DAJEM web ecosystem wrapped in a fast Android app shell — featuring <strong>DAJEM Orbital</strong> (estimates, bookings, document submission &amp; DHL tracking), <strong>DAJEM Homes</strong> (all property types, listings &amp; property submissions), and <strong>DAJEM Farms</strong> (categorized farm catalog, Chicken Studio &amp; checkout).
          </p>
        </div>

        {/* Main Download Card */}
        <div className="mt-8 sm:mt-12 p-6 sm:p-10 rounded-3xl border border-border/70 bg-card/80 backdrop-blur-xl shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-muted-foreground font-mono">
                <span className="px-2.5 py-1 rounded-md bg-muted font-bold text-foreground">v1.0.2 Unified</span>
                <span>•</span>
                <span>Android 8.0+</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Signed &amp; Synced with Hostinger
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black">
                Identical webapp workflows, native Android feel
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Uses your single DAJEM account, shared cart, dashboard, Flutterwave checkout, DHL shipping, and dual-layer updates (instant Hostinger cloud updates + in-app APK updater).
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Button
                  size="lg"
                  onClick={handleDownload}
                  className="w-full sm:w-auto h-12 px-7 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm shadow-xl shadow-emerald-600/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2.5"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Android APK</span>
                </Button>

                <Link
                  href="/"
                  className="w-full sm:w-auto h-12 px-6 rounded-2xl border border-border/80 bg-background/80 hover:bg-accent font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Smartphone className="w-4 h-4 text-cyan-500" />
                  <span>Open Unified Web App</span>
                </Link>
              </div>

              {downloadStarted && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Your APK download has started! Once downloaded, tap the file in your notification bar to install.</span>
                </div>
              )}
            </div>

            {/* Direct Phone Share & Copy Link Box */}
            <div className="w-full md:w-72 p-5 rounded-2xl border border-border/80 bg-background/90 flex flex-col gap-3 shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-blue-500/20 border border-border flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black text-foreground">Share to Phone</p>
                  <p className="text-[11px] text-muted-foreground">Open this link on Android</p>
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/50 px-3 py-2 font-mono text-[11px] text-muted-foreground truncate">
                /downloads/dajem-app.apk
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleCopyUrl()}
                className="w-full rounded-xl font-bold text-xs gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "APK Link Copied" : "Copy Direct APK Link"}</span>
              </Button>
            </div>
          </div>

          {/* 3-Step Installation Guide */}
          <div className="pt-6 border-t border-border/70 space-y-4">
            <h3 className="text-base font-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span>How to Install the APK on Your Android Device</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h4 className="text-xs font-black">Download the APK file</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Tap <strong>Download Android APK</strong> above. If Chrome prompts <em>&ldquo;File might be harmful&rdquo;</em>, tap <strong>Download anyway</strong> (standard for direct APK downloads outside Google Play).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h4 className="text-xs font-black">Allow installation</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Open the downloaded <code className="font-mono">dajem-app.apk</code> file from your notifications. If prompted, tap <strong>Settings</strong> and toggle on <strong>Allow from this source</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-black flex items-center justify-center">
                  3
                </span>
                <h4 className="text-xs font-black">Launch &amp; Auto-Update</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Tap <strong>Install</strong> and open <strong>DAJEM Group</strong>. Any web update pushed to Hostinger syncs automatically, and future native APK releases can be downloaded inside the app.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="p-5 rounded-2xl border border-cyan-500/20 bg-card/60 space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider font-mono">
              <Compass className="w-4 h-4" />
              <span>01 • DAJEM ORBITAL</span>
            </div>
            <div className="text-sm font-black">Estimate → Inquiry → DHL → Track</div>
            <p className="text-xs text-muted-foreground">10-service fee estimator, area converter, booking &amp; document uploads, DHL plan shipping, and live tracker.</p>
          </div>

          <div className="p-5 rounded-2xl border border-blue-500/20 bg-card/60 space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider font-mono">
              <House className="w-4 h-4" />
              <span>02 • DAJEM HOMES</span>
            </div>
            <div className="text-sm font-black">Categories, House Types &amp; Submit</div>
            <p className="text-xs text-muted-foreground">Land plots, rentals, homes for sale &amp; short-lets across all house types, tracked bidding, and owner/agent property submission.</p>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-500/20 bg-card/60 space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
              <Egg className="w-4 h-4" />
              <span>03 • DAJEM FARMS</span>
            </div>
            <div className="text-sm font-black">Categorized Market &amp; Cut Studio</div>
            <p className="text-xs text-muted-foreground">Livestock, grills, eggs, produce, equipment, Chicken Order Studio (up to 30 cuts), bulk quotes, and Flutterwave checkout.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
