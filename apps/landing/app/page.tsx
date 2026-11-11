"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  Compass,
  Drumstick,
  Egg,
  House,
  Landmark,
  Layers,
  MapPin,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
} from "lucide-react";
import {
  Badge,
  Footer,
  Header,
  HeroSlideshow,
  SectionNav,
  TrustRibbon,
  dajemCompanyProfiles,
} from "@repo/ui";

const businesses = [
  {
    number: "01",
    name: "DAJEM Orbital",
    rc: "RC:6922761",
    category: "SURVEY & GEOMATICS",
    description:
      "Cadastral surveying, perimeter & topography mapping, beacon re-establishment, and DHL survey plan delivery.",
    image: "/images/orbital-hero-field-v2.png",
    href: "/survey",
    action: "Open Orbital Workspace",
    accentText: "text-cyan-700 dark:text-cyan-300",
    accentBg: "bg-cyan-500/10 border-cyan-500/25 text-cyan-700 dark:text-cyan-300",
    accentHover: "hover:border-cyan-500/45 hover:shadow-cyan-500/10",
    icon: Compass,
    quickLinks: [
      { label: "Fee Estimator", href: "/survey/estimate" },
      { label: "Inquiry Desk", href: "/survey/inquiry" },
      { label: "Plan Tracker", href: "/survey/tracker" },
    ],
  },
  {
    number: "02",
    name: "DAJEM Farms",
    rc: "RC:8539786",
    category: "FOOD & AGRICULTURE",
    description:
      "Fresh poultry, custom chicken cut studio, catfish, livestock, eggs, farm produce, and commercial bulk supply.",
    image: "/images/farms-hero-farm-v2.png",
    href: "/farms",
    action: "Open Farms Marketplace",
    accentText: "text-emerald-700 dark:text-emerald-300",
    accentBg: "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300",
    accentHover: "hover:border-emerald-500/45 hover:shadow-emerald-500/10",
    icon: Egg,
    quickLinks: [
      { label: "Farm Shop", href: "/farms/shop" },
      { label: "Chicken Studio", href: "/farms/chicken" },
      { label: "Bulk Orders", href: "/farms/bulk-order" },
    ],
  },
  {
    number: "03",
    name: "DAJEM Homes",
    rc: "RC:8805120",
    category: "PROPERTY & HOSPITALITY",
    description:
      "Verified land plots, houses for sale or rent, luxury short-let suites, tracked bidding, and property management.",
    image: "/images/homes-hero-suite-v2.png",
    href: "/properties",
    action: "Open Homes Portal",
    accentText: "text-blue-700 dark:text-blue-300",
    accentBg: "bg-blue-500/10 border-blue-500/25 text-blue-700 dark:text-blue-300",
    accentHover: "hover:border-blue-500/45 hover:shadow-blue-500/10",
    icon: House,
    quickLinks: [
      { label: "All Listings", href: "/properties/listings" },
      { label: "Short-Lets", href: "/properties/listings?group=short-let" },
      { label: "Submit Property", href: "/properties/submit" },
    ],
  },
];

export default function LandingPage() {
  const group = dajemCompanyProfiles.landing;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header activeApp="landing" />
      <main className="flex-1">
        <SectionNav
          label="DAJEM Group"
          items={[
            { href: "#companies", label: "Our Businesses" },
            { href: "#mobile-app", label: "Mobile App" },
            { href: "#about", label: "About" },
            { href: "#contact", label: "Contact" },
          ]}
        />

        <HeroSlideshow
          className="dajem-mobile-hero min-h-[22rem] py-8 sm:min-h-[42rem] sm:py-20"
          contentClassName="landing-hero-copy"
          overlayClassName="bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/45"
          slides={[
            {
              src: "/images/group-hero-boardroom-v2.png",
              label: "DAJEM Group",
              actionLabel: "Explore our businesses",
              href: "/#companies",
            },
            {
              src: "/images/orbital-hero-field-v2.png",
              label: "DAJEM Orbital",
              actionLabel: "Calculate survey cost",
              href: "/survey/estimate",
            },
            {
              src: "/images/farms-hero-farm-v2.png",
              label: "DAJEM Farms",
              actionLabel: "Shop farm products",
              href: "/farms/shop",
            },
            {
              src: "/images/homes-hero-suite-v2.png",
              label: "DAJEM Homes",
              actionLabel: "Browse verified properties",
              href: "/properties/listings",
            },
          ]}
        >
          <div className="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 px-4 py-3 sm:px-8 sm:py-6 lg:grid-cols-12 lg:gap-10">
            <div className="dajem-hero-copy-panel space-y-4 rounded-[1.75rem] p-5 sm:space-y-6 sm:p-9 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Rooted in Nigeria · Built for Progress
              </div>

              <h1 className="text-3xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                <span className="dajem-hero-title block">One group.</span>
                <span className="mt-1.5 block bg-gradient-to-r from-cyan-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent dark:from-cyan-300 dark:via-emerald-300 dark:to-blue-300 sm:mt-2">
                  More possibilities.
                </span>
              </h1>

              <p className="dajem-hero-lede max-w-xl text-sm leading-relaxed sm:text-lg">
                From land surveying and cadastral mapping to verified homes and fresh farm produce — access three specialized DAJEM companies with one unified account.
              </p>

              <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:flex-wrap sm:gap-3 sm:pt-2">
                <a
                  href="#companies"
                  className="sheen-glow inline-flex min-h-11 items-center justify-center gap-2.5 rounded-full bg-slate-950 px-6 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 sm:min-h-12"
                >
                  <span>Explore Our Businesses</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/download"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-5 text-sm font-bold text-emerald-800 backdrop-blur-md transition hover:bg-emerald-500/20 dark:text-emerald-200 sm:min-h-12"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Download Android App</span>
                </Link>
                <Link
                  href="/support"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-border/80 bg-background/60 px-5 text-sm font-semibold text-foreground backdrop-blur-md transition hover:bg-background/90 sm:min-h-12"
                >
                  Talk to Us
                </Link>
              </div>
            </div>

            <div className="dajem-hero-info-panel hidden space-y-4 rounded-[1.75rem] border p-6 shadow-2xl backdrop-blur-xl lg:col-span-5 lg:block">
              <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                    Unified Enterprise Hub
                  </h2>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {group.registrationNumber}
                </Badge>
              </div>

              <div className="space-y-2.5">
                {businesses.map((biz) => (
                  <Link
                    key={biz.name}
                    href={biz.href}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/60 p-3.5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${biz.accentBg}`}>
                        <biz.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
                          {biz.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {biz.category} · {biz.rc}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="rounded-xl border border-border/50 bg-muted/35 p-3">
                  <p className="font-bold text-foreground">Single Sign-On</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">One account across all 3 portals</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/35 p-3">
                  <p className="font-bold text-foreground">Instant Receipts</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Flutterwave & DHL integrated</p>
                </div>
              </div>
            </div>
          </div>
        </HeroSlideshow>

        <TrustRibbon companyName={group.displayName} registrationNumber={group.registrationNumber} />

        {/* Subsidiaries Section */}
        <section id="companies" className="scroll-mt-28 px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
                  The DAJEM Family
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  Three dedicated businesses. One standard of excellence.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Switch seamlessly between land surveying, farm e-commerce, and property listings under one verified profile.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {businesses.map((business) => (
                <div
                  key={business.name}
                  className={`group flex flex-col overflow-hidden rounded-[1.75rem] border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${business.accentHover}`}
                >
                  <Link href={business.href} className="relative block h-52 overflow-hidden bg-slate-900">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${business.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                    <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                      <span className="rounded-full border border-white/20 bg-slate-950/65 px-3 py-1 text-[10px] font-black tracking-[0.18em] text-white backdrop-blur-md">
                        {business.number} / DAJEM
                      </span>
                      <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-1 font-mono text-[10px] font-bold text-white backdrop-blur-md">
                        {business.rc}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-extrabold tracking-[0.2em] text-white/80">
                          {business.category}
                        </p>
                        <h3 className="mt-0.5 text-2xl font-black text-white">{business.name}</h3>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md transition group-hover:bg-white group-hover:text-slate-950">
                        <business.icon className="h-5 w-5" />
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {business.description}
                      </p>

                      {/* Quick Sub-Links */}
                      <div className="mt-5">
                        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                          Direct Shortcuts
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {business.quickLinks.map((q) => (
                            <Link
                              key={q.href}
                              href={q.href}
                              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold transition hover:opacity-85 ${business.accentBg}`}
                            >
                              <span>{q.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={business.href}
                      className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-sm font-extrabold text-foreground group-hover:text-primary transition-colors"
                    >
                      <span>{business.action}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile App Download & Super-App Banner */}
        <section id="mobile-app" className="scroll-mt-28 px-5 pb-16 sm:px-8 sm:pb-24">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-indigo-500/25 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-2xl sm:p-10 lg:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-bold text-cyan-300">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Unified Android &amp; iOS App</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight sm:text-4xl">
                  Every DAJEM service in your pocket.
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  Install the Android APK for seamless mobile access to <strong className="text-cyan-300">DAJEM Orbital</strong> (estimates to document submission &amp; DHL shipping), <strong className="text-blue-300">DAJEM Homes</strong> (all property &amp; house types + listing submissions), and <strong className="text-emerald-300">DAJEM Farms</strong> (categorized farm catalog &amp; Chicken Order Studio).
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/download"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-extrabold text-slate-950 shadow-lg transition hover:bg-emerald-100"
                  >
                    <span>Download Android APK</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/survey/estimate"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/20"
                  >
                    <span>Start Survey Estimate</span>
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:col-span-5">
                <Link href="/survey" className="rounded-2xl border border-cyan-400/25 bg-cyan-950/40 p-4 backdrop-blur-md transition hover:border-cyan-400/60">
                  <Calculator className="h-5 w-5 text-cyan-300" />
                  <p className="mt-3 text-sm font-extrabold">DAJEM Orbital</p>
                  <p className="mt-1 text-xs text-slate-300">Cost estimator, booking, document upload, DHL plan shipping &amp; tracker.</p>
                </Link>
                <Link href="/properties" className="rounded-2xl border border-blue-400/25 bg-blue-950/40 p-4 backdrop-blur-md transition hover:border-blue-400/60">
                  <Building2 className="h-5 w-5 text-blue-300" />
                  <p className="mt-3 text-sm font-extrabold">DAJEM Homes</p>
                  <p className="mt-1 text-xs text-slate-300">Land plots, rentals, homes for sale, short-lets, bidding &amp; owner submission.</p>
                </Link>
                <Link href="/farms" className="rounded-2xl border border-emerald-400/25 bg-emerald-950/40 p-4 backdrop-blur-md transition hover:border-emerald-400/60">
                  <ShoppingCart className="h-5 w-5 text-emerald-300" />
                  <p className="mt-3 text-sm font-extrabold">DAJEM Farms</p>
                  <p className="mt-1 text-xs text-slate-300">Categorized farm shop, Chicken Order Studio, bulk quotes &amp; Flutterwave cart.</p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="scroll-mt-28 bg-slate-950 px-5 py-16 text-white sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12 lg:items-center">
            <div className="space-y-4 lg:col-span-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-300">
                About DAJEM Group Limited
              </p>
              <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                Local roots in Enugu. Built for institutional trust.
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                {group.summary}
              </p>
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {group.services.map((service) => (
                  <div key={service} className="flex items-start gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-6">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
                <ShieldCheck className="h-6 w-6 text-emerald-300" />
                <p className="mt-4 text-base font-extrabold">CAC Registered Group</p>
                <p className="mt-1 font-mono text-sm text-emerald-300">{group.registrationNumber}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  Each DAJEM subsidiary is individually incorporated and coordinated under group governance.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
                <MapPin className="h-6 w-6 text-cyan-300" />
                <p className="mt-4 text-base font-extrabold">Enugu Headquarters</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{group.address}</p>
                <p className="mt-2 font-mono text-xs text-cyan-300">{group.email}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Support Section */}
        <section id="contact" className="scroll-mt-28 px-5 py-16 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[2rem] border border-border bg-card p-7 shadow-sm sm:p-10 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
                Customer & Client Desk
              </p>
              <h2 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">
                Let&apos;s make your next step easier.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Need assistance with a survey inquiry, property bid, or farm order delivery? Open a tracked support ticket or reach our Enugu headquarters directly.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/support"
                className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary/90"
              >
                <span>Open Support Desk</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-bold text-foreground transition hover:bg-accent"
              >
                <span>Client Dashboard</span>
              </Link>
            </div>
          </div>
        </section>

        <section id="privacy" className="mx-auto max-w-6xl scroll-mt-28 px-5 pb-12 text-sm text-muted-foreground sm:px-8">
          <div className="rounded-2xl border border-border/60 bg-muted/25 p-5">
            <h2 className="font-bold text-foreground">Your privacy & terms</h2>
            <p className="mt-1.5">
              Read how we protect your account, uploaded survey documents, property listings, and payment records in our{" "}
              <Link href="/terms" className="font-bold text-primary underline underline-offset-4">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

