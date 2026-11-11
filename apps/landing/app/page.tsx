"use client";

import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Download,
  Egg,
  House,
  LayoutDashboard,
  LifeBuoy,
} from "lucide-react";
import { Footer, Header } from "@repo/ui";

const subsidiaries = [
  {
    name: "DAJEM Orbital",
    subtitle: "Survey & Geomatics",
    description: "Calculate survey estimates, book consultations, submit papers & track DHL plan delivery.",
    image: "/images/orbital-hero-field-v2.jpg",
    href: "/survey",
    action: "Open Orbital",
    accentBadge: "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
    accentBorder: "hover:border-cyan-500/45",
    icon: Compass,
    quickLinks: [
      { label: "Estimate", href: "/survey/estimate" },
      { label: "Book & Papers", href: "/survey/inquiry" },
      { label: "Track DHL", href: "/survey/tracker" },
    ],
  },
  {
    name: "DAJEM Homes",
    subtitle: "Property & Hospitality",
    description: "Browse land, houses, rentals & short-lets, submit bids, or list your own property.",
    image: "/images/homes-hero-suite-v2.jpg",
    href: "/properties",
    action: "Open Homes",
    accentBadge: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    accentBorder: "hover:border-blue-500/45",
    icon: House,
    quickLinks: [
      { label: "All Listings", href: "/properties/listings" },
      { label: "Short-Lets", href: "/properties/listings?group=short-let" },
      { label: "List Property", href: "/properties/submit" },
    ],
  },
  {
    name: "DAJEM Farms",
    subtitle: "Food & Agriculture",
    description: "Order fresh poultry, customized chicken cuts, catfish, eggs, livestock & bulk farm supply.",
    image: "/images/farms-hero-farm-v2.jpg",
    href: "/farms",
    action: "Open Farms",
    accentBadge: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    accentBorder: "hover:border-emerald-500/45",
    icon: Egg,
    quickLinks: [
      { label: "Farm Shop", href: "/farms/shop" },
      { label: "Chicken Studio", href: "/farms/chicken" },
      { label: "Bulk Orders", href: "/farms/bulk-order" },
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header activeApp="landing" />

      <main className="flex-1 px-4 pb-8 pt-4 sm:px-6 sm:pb-12 sm:pt-8">
        <div className="mx-auto max-w-6xl space-y-5 sm:space-y-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">
                DAJEM Ecosystem
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Choose a subsidiary
              </h1>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                One account across Survey &amp; Geomatics, Real Estate, and Fresh Food &amp; Poultry.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground shadow-sm transition hover:bg-accent sm:mt-0"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
              <span>My Activity &amp; Orders</span>
            </Link>
          </div>

          <section aria-label="DAJEM subsidiaries" className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {subsidiaries.map((subsidiary) => {
              const Icon = subsidiary.icon;
              return (
                <article
                  key={subsidiary.name}
                  className={`flex flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm transition hover:shadow-md ${subsidiary.accentBorder}`}
                >
                  <Link href={subsidiary.href} className="group relative block h-36 overflow-hidden bg-slate-900 sm:h-44">
                    <img
                      src={subsidiary.image}
                      alt={subsidiary.name}
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                    <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/75 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                          <Icon className="h-3 w-3" />
                          {subsidiary.subtitle}
                        </span>
                        <h2 className="mt-1.5 text-lg font-black tracking-tight text-white sm:text-xl">
                          {subsidiary.name}
                        </h2>
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-950 shadow-md">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {subsidiary.description}
                    </p>

                    <div className="mt-3.5 space-y-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        {subsidiary.quickLinks.map((shortcut) => (
                          <Link
                            key={shortcut.href}
                            href={shortcut.href}
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition hover:opacity-85 ${subsidiary.accentBadge}`}
                          >
                            {shortcut.label}
                          </Link>
                        ))}
                      </div>

                      <Link
                        href={subsidiary.href}
                        className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-extrabold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 mobile-tap-target"
                      >
                        <span>{subsidiary.action}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section id="contact" className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-3">
            <Link
              href="/support"
              className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-xs font-bold text-foreground transition hover:bg-accent"
            >
              <span className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-primary" />
                Support Desk
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
            <Link
              href="/download"
              className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-xs font-bold text-foreground transition hover:bg-accent"
            >
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4 text-emerald-600" />
                Android APK App
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
            <Link
              id="privacy"
              href="/terms"
              className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-xs font-bold text-foreground transition hover:bg-accent"
            >
              <span>Privacy &amp; Terms</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </section>
        </div>
      </main>

      <Footer compact />
    </div>
  );
}
