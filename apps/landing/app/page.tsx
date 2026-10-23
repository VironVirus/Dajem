"use client";

import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { Footer, Header, HeroSlideshow, SectionNav, dajemCompanyProfiles } from "@repo/ui";

const businesses = [
  { number: "01", name: "DAJEM Orbital", category: "SURVEY & GEOMATICS", description: "Surveying and land services for informed property decisions.", image: "/images/orbital-hero-field-v2.png", href: "/survey", action: "Explore Orbital" },
  { number: "02", name: "DAJEM Farms", category: "FOOD & AGRICULTURE", description: "Fresh farm products, livestock and supplies for your home or business.", image: "/images/farms-hero-farm-v2.png", href: "/farms", action: "Explore Farms" },
  { number: "03", name: "DAJEM Homes", category: "PROPERTY & HOSPITALITY", description: "Find property, discover short stays and explore investment opportunities.", image: "/images/homes-hero-suite-v2.png", href: "/properties", action: "Explore Homes" },
];

export default function LandingPage() {
  const group = dajemCompanyProfiles.landing;
  return <div className="flex min-h-screen flex-col bg-background">
    <Header activeApp="landing" />
    <main className="flex-1">
      <SectionNav label="DAJEM Group" items={[{ href: "#companies", label: "Our businesses" }, { href: "#about", label: "About" }, { href: "#contact", label: "Contact" }]} />
      <HeroSlideshow className="dajem-mobile-hero min-h-[35rem] py-12 sm:min-h-[40rem] sm:py-20" contentClassName="landing-hero-copy" overlayClassName="bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/45" slides={[
        { src: "/images/group-hero-boardroom-v2.png", label: "DAJEM Group", actionLabel: "Explore our businesses", href: "/#companies" },
        { src: "/images/orbital-hero-field-v2.png", label: "DAJEM Orbital", actionLabel: "Request a survey", href: "/survey/inquiry" },
        { src: "/images/farms-hero-farm-v2.png", label: "DAJEM Farms", actionLabel: "Shop farm products", href: "/farms/shop" },
        { src: "/images/homes-hero-suite-v2.png", label: "DAJEM Homes", actionLabel: "Find a property", href: "/properties/listings" },
      ]}>
        <div className="mx-auto flex w-full max-w-6xl items-center px-5 py-10 sm:px-8"><div className="max-w-2xl text-left text-white">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-slate-950/50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white sm:text-xs"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Rooted in Nigeria. Built for progress.</p>
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">One group.<br /><span className="text-emerald-300">More possibilities.</span></h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-100 sm:text-lg">From farm to home, and from land to opportunity, discover services designed around your needs.</p>
          <div className="mt-8 flex flex-wrap gap-3"><a href="#companies" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-6 text-sm font-bold text-slate-950 transition hover:bg-emerald-100">Explore our businesses <ArrowRight className="h-4 w-4" /></a><a href="/support" className="inline-flex min-h-12 items-center rounded-full border border-white/50 bg-slate-950/40 px-6 text-sm font-semibold text-white transition hover:bg-white/15">Talk to us</a></div>
        </div></div>
      </HeroSlideshow>
      <section id="companies" className="scroll-mt-28 px-5 py-16 sm:px-8 sm:py-24"><div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:mb-10 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">The DAJEM family</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Find what you need.</h2></div><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">Three dedicated businesses, connected by one commitment to serve you.</p></div>
        <div className="grid gap-4 md:grid-cols-3">{businesses.map((business) => <a key={business.name} href={business.href} className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="relative h-44 overflow-hidden bg-slate-900 sm:h-52"><div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${business.image})` }} /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 to-transparent" /><span className="absolute bottom-4 left-5 text-xs font-bold tracking-[0.2em] text-white/90">{business.number} / DAJEM GROUP</span></div><div className="p-5 sm:p-6"><p className="text-[10px] font-bold tracking-[0.18em] text-emerald-700 dark:text-emerald-400">{business.category}</p><h3 className="mt-2 text-xl font-bold text-foreground">{business.name}</h3><p className="mt-2 min-h-12 text-sm leading-relaxed text-muted-foreground">{business.description}</p><span className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm font-bold text-foreground">{business.action}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div></a>)}</div>
      </div></section>
      <section id="about" className="scroll-mt-28 bg-slate-950 px-5 py-14 text-white sm:px-8 sm:py-20"><div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">About DAJEM</p><h2 className="mt-3 max-w-md text-3xl font-bold leading-tight sm:text-4xl">Local roots. A wider vision.</h2><p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">DAJEM Group brings together agriculture, property and surveying services under one family of businesses in Enugu.</p></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/15 bg-white/5 p-5"><ShieldCheck className="h-5 w-5 text-emerald-300" /><p className="mt-4 font-bold">Registered in Nigeria</p><p className="mt-1 text-sm text-slate-300">{group.registrationNumber}</p></div><div className="rounded-2xl border border-white/15 bg-white/5 p-5"><MapPin className="h-5 w-5 text-emerald-300" /><p className="mt-4 font-bold">Based in Enugu</p><p className="mt-1 text-sm leading-relaxed text-slate-300">{group.address}</p></div></div></div></section>
      <section id="contact" className="scroll-mt-28 px-5 py-16 sm:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-border bg-muted/40 p-7 sm:p-10 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Here to help</p><h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Let&apos;s make your next step easier.</h2><p className="mt-2 text-sm text-muted-foreground">Have a question? Our team is ready to help.</p></div><a href="/support" className="inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-slate-950 px-6 text-sm font-bold text-white dark:bg-white dark:text-slate-950">Contact support <ArrowRight className="h-4 w-4" /></a></div></section>
      <section id="privacy" className="mx-auto max-w-6xl scroll-mt-28 px-5 pb-12 text-sm text-muted-foreground sm:px-8"><h2 className="font-bold text-foreground">Your privacy</h2><p className="mt-2">Read about how we use and protect your information in our <a href="/terms" className="font-semibold text-primary underline">terms of service</a>.</p></section>
    </main><Footer />
  </div>;
}
