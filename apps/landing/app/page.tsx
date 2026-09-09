"use client";

import React from "react";
import { 
  Header, 
  Footer, 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  Input, 
  Textarea, 
  Label, 
  Select, 
  Badge, 
  Dialog,
  dajemCompanyProfiles,
  getAppBaseUrl,
  HeroSlideshow,
  SectionNav,
  TrustRibbon,
  useDajem,
} from "@repo/ui";
import { 
  Building2, 
  Map, 
  Egg, 
  Landmark,
  ArrowUpRight, 
  ShieldCheck, 
  Cpu, 
  Award, 
  Users2,
  CheckCircle2,
  Sparkles
} from "lucide-react";

function getRegistrationYear(value: string) {
  return value.match(/\b(19|20)\d{2}\b/)?.[0] ?? value;
}

export default function LandingPage() {
  const groupProfile = dajemCompanyProfiles.landing;
  const farmsProfile = dajemCompanyProfiles.poultry;
  const homesProfile = dajemCompanyProfiles["real-estate"];
  const orbitalProfile = dajemCompanyProfiles.survey;
  const { navigateToUrl } = useDajem();
  const mapQuery = encodeURIComponent(groupProfile.address);
  const [inquirySent, setInquirySent] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    department: "general",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setInquirySent(true);
  };

  const companies = [
    {
      id: "survey",
      title: orbitalProfile.displayName,
      description: orbitalProfile.summary,
      href: getAppBaseUrl("survey"),
      icon: Map,
      themeColor: "from-cyan-500/22 via-sky-500/12 to-blue-700/10 dark:from-cyan-500/14 dark:to-blue-700/8",
      iconColor: "text-cyan-500",
      stats: "Surveying, mapping, engineering, logistics, and contracts",
      cta: "Get Estimate",
      badge: "Surveying & Contracts"
    },
    {
      id: "poultry",
      title: farmsProfile.displayName,
      description: farmsProfile.summary,
      href: getAppBaseUrl("poultry"),
      icon: Egg,
      themeColor: "from-amber-500/24 via-lime-500/10 to-yellow-600/10 dark:from-amber-500/12 dark:to-lime-500/8",
      iconColor: "text-amber-500",
      stats: "Livestock, grills, eggs, produce, equipment, and consultancy",
      cta: "Browse Farm Products",
      badge: "General Farming"
    },
    {
      id: "real-estate",
      title: homesProfile.displayName,
      description: homesProfile.summary,
      href: getAppBaseUrl("real-estate"),
      icon: Building2,
      themeColor: "from-emerald-500/22 via-blue-500/10 to-slate-700/10 dark:from-emerald-500/12 dark:to-blue-500/8",
      iconColor: "text-emerald-500",
      stats: "Short-let, hospitality, development, sales, and management",
      cta: "Find Properties",
      badge: "Homes & Hospitality"
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="landing" />

      <main className="flex-1">
        <SectionNav label="DAJEM Group" items={[
          { href: "#about", label: "Overview" },
          { href: "#companies", label: "Companies" },
          { href: "#contact", label: "Contact" },
        ]} />

        <HeroSlideshow
          className="dajem-mobile-hero flex min-h-[34rem] items-center py-16 sm:min-h-[38rem] sm:py-24 md:py-32"
          contentClassName="landing-hero-copy"
          overlayClassName="bg-[linear-gradient(180deg,rgba(248,250,252,0.25),rgba(248,250,252,0.45),rgba(248,250,252,0.8))] dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.35),rgba(2,6,23,0.55),rgba(2,6,23,0.85))]"
          slides={[
            { src: "/images/landing-boardroom-1.png", position: "center", label: "Group leadership" },
            { src: "/images/landing-boardroom-2.png", position: "center", label: "Corporate planning" },
            { src: "/images/landing-boardroom-3.png", position: "center", label: "Team collaboration" },
            { src: "/images/landing-boardroom-4.png", position: "center", label: "Group operations" },
          ]}
        >
          <div className="absolute left-[-4rem] top-12 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl -z-10 sm:h-72 sm:w-72" />
          <div className="absolute right-[-5rem] top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl -z-10 sm:h-96 sm:w-96" />

          <div className="container mx-auto max-w-5xl px-5 text-center sm:px-6">
            <div className="dajem-hero-copy-panel mx-auto max-w-4xl rounded-[2rem] p-6 sm:p-10 md:p-12 transition-all">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary dark:border-white/20 dark:bg-white/10 dark:text-white">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>DAJEM Group Corporate Leadership</span>
              </div>

              <h1 className="mb-6 text-[2.5rem] font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                <span className="dajem-hero-title block tracking-tight">
                  DAJEM Group
                </span>
                <span className="mt-3 block text-base font-semibold leading-snug tracking-normal text-muted-foreground sm:text-xl md:text-2xl">
                  Strategic direction and shared oversight for every DAJEM company
                </span>
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base md:mb-10 md:text-lg">
                Ownership, governance, and operational coordination across {orbitalProfile.displayName}, {farmsProfile.displayName}, and {homesProfile.displayName} from the corporate base in Enugu.
              </p>

              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Button 
                  size="lg" 
                  className="sheen-glow w-full rounded-full bg-primary px-8 font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 sm:w-auto" 
                  onClick={() => {
                    const el = document.getElementById("companies");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Explore Our Subsidiaries
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full rounded-full border-border/80 bg-background/60 px-8 font-semibold backdrop-blur-sm hover:bg-accent sm:w-auto" 
                  onClick={() => {
                    const el = document.getElementById("contact");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Contact Group Office
                </Button>
              </div>
            </div>
          </div>
        </HeroSlideshow>

        <TrustRibbon companyName={groupProfile.displayName} registrationNumber={groupProfile.registrationNumber} />

        {/* Enterprise Metrics Section */}
        <section className="border-b border-border/50 bg-card/40 py-10 backdrop-blur-sm sm:py-14">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {[
                { value: "4", label: "Registered Companies", sub: "Under Group Leadership" },
                { value: "2026", label: "Group Opened", sub: "Corporate Governance" },
                { value: "2023", label: "Earliest Subsidiary", sub: "Proven Operations" },
                { value: "Enugu", label: "Corporate Base", sub: "Regional Headquarters" },
              ].map((stat) => (
                <div key={stat.label} className="group relative rounded-2xl border border-border/60 bg-card/60 p-5 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                  <p className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{stat.value}</p>
                  <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-primary dark:text-blue-400">{stat.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About & Corporate Foundations */}
        <section id="about" className="container mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary dark:border-white/15 dark:bg-white/10 dark:text-white">
                Corporate Foundations
              </div>
              <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Unified Ownership & Strategic Governance
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base mb-6">
                DAJEM Group was established to provide institutional stewardship, resource optimization, and strategic management for our growing portfolio of specialized enterprises.
              </p>

              {/* Clean Registration Table */}
              <div className="mb-8 overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
                <div className="border-b border-border/50 bg-muted/40 px-5 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Subsidiary Registration Directory</p>
                </div>
                <div className="divide-y divide-border/40">
                  {[groupProfile, orbitalProfile, farmsProfile, homesProfile].map((company) => (
                    <div key={company.id} className="flex flex-col justify-between gap-1.5 px-5 py-3.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center">
                      <span className="font-semibold text-foreground text-sm">{company.displayName}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground">{company.registrationNumber}</span>
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Registered {getRegistrationYear(company.startDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clean 2x2 Capabilities Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { title: "Strategic Management", desc: "Cohesive group direction", icon: Cpu },
                  { title: "Subsidiary Governance", desc: "Corporate oversight & policy", icon: ShieldCheck },
                  { title: "Registered Operations", desc: "Fully certified CAC businesses", icon: Award },
                  { title: "Shared Admin Team", desc: "Unified client & finance support", icon: Users2 }
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-border/50 bg-card/40 p-4 transition-colors hover:border-primary/30">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-foreground">{item.title}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HQ Map Preview with High-Contrast Glass Overlay */}
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 shadow-2xl shadow-slate-950/10">
              <div className="landing-map-frame relative min-h-[380px] sm:min-h-[440px] lg:min-h-[520px]">
                <iframe
                  title="Corporate HQ Map"
                  src={`https://www.google.com/maps?q=${mapQuery}&z=16&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full border-0"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05),rgba(15,23,42,0.15),rgba(15,23,42,0.3))]" />
              </div>

              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-border/80 bg-background/95 p-5 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-slate-950/92 sm:inset-x-6 sm:bottom-6">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-blue-400">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <Badge className="bg-emerald-600 text-white dark:bg-emerald-500 font-semibold text-xs px-3 py-1">
                    Corporate HQ
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-foreground">{groupProfile.shortName}</h4>
                  <p className="text-sm font-medium leading-relaxed text-foreground/80">
                    {groupProfile.address}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                      Active & Operating Hub
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Subsidiaries Section */}
        <section id="companies" className="border-y border-border/50 bg-muted/30 py-16 sm:py-24">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary dark:border-white/15 dark:bg-white/10 dark:text-white">
                Corporate Portfolio
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-3">
                Our Subsidiaries
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Each subsidiary operates in its own sector while drawing strategic governance from {groupProfile.shortName}.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {companies.map((company) => (
                <Card key={company.id} className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border-border/60 bg-card/85 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                  <div className={`h-2 w-full bg-gradient-to-r ${company.themeColor}`} />

                  <CardHeader className="pt-6 pb-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/80 ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-110">
                        <company.icon className={`h-6 w-6 ${company.iconColor}`} />
                      </div>
                      <Badge variant="outline" className="rounded-full border-border/70 px-3 py-1 text-xs font-semibold">
                        {company.badge}
                      </Badge>
                    </div>

                    <CardTitle className="text-xl font-bold leading-snug">{company.title}</CardTitle>
                    <CardDescription className="line-clamp-3 min-h-[58px] pt-1.5 text-xs sm:text-sm leading-relaxed">
                      {company.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col justify-end pt-0">
                    <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="truncate">{company.stats}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 border-t border-border/40">
                    <Button 
                      className="sheen-glow w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 font-semibold shadow-md shadow-primary/15 transition-all"
                      onClick={() => void navigateToUrl(company.href)}
                    >
                      <span>{company.cta}</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Executive Contact Section */}
        <section id="contact" className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24">
          <Card className="overflow-hidden rounded-[2rem] border-border/70 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-5">
              {/* Executive Slate Left Panel */}
              <div className="flex flex-col justify-between space-y-8 bg-slate-900 text-white p-7 sm:p-9 md:col-span-2 dark:bg-slate-950 dark:border-r dark:border-white/10">
                <div>
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                    <Sparkles className="h-3 w-3" />
                    Corporate Registry
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight mb-3">Corporate Office</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Have questions about {groupProfile.shortName} or interested in partnership opportunities? Drop us a line.
                  </p>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-bold text-xs uppercase tracking-wider text-emerald-400">Headquarters</p>
                    <p className="text-slate-200 mt-1 leading-relaxed text-xs sm:text-sm">{groupProfile.address}</p>
                  </div>
                  <div>
                    <p className="font-bold text-xs uppercase tracking-wider text-emerald-400">Official Email</p>
                    <p className="text-slate-200 mt-1 text-xs sm:text-sm">{groupProfile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Direct response within 24 business hours.</span>
                </div>
              </div>

              {/* Form Right Panel */}
              <div className="p-7 sm:p-9 md:col-span-3 bg-card">
                <h3 className="text-xl font-bold text-foreground mb-6">Send an Executive Inquiry</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Select
                      label="Inquiry Department"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      options={[
                        { value: "general", label: "General Corporate Inquiry" },
                        { value: "survey", label: `${orbitalProfile.displayName} Division` },
                        { value: "poultry", label: `${farmsProfile.displayName} Operations` },
                        { value: "realestate", label: `${homesProfile.displayName} Listings` },
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="Brief topic summary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      required
                      rows={4} 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Describe your inquiry or partnership proposal..."
                    />
                  </div>

                  <Button type="submit" className="sheen-glow w-full rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 shadow-lg shadow-emerald-600/20 transition-all">
                    Submit Inquiry
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <Footer />

      {/* Success Dialog Popup */}
      <Dialog 
        isOpen={inquirySent} 
        onClose={() => {
          setInquirySent(false);
          setFormData({ name: "", email: "", department: "general", subject: "", message: "" });
        }}
        title="Corporate Inquiry Received"
      >
        <div className="text-center py-6 space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-foreground text-lg">Thank you, {formData.name}!</p>
            <p className="text-sm text-muted-foreground">
              Your inquiry has been successfully routed to the <strong className="text-emerald-500 uppercase">{formData.department}</strong> department. A DAJEM representative will contact you at <strong>{formData.email}</strong> shortly.
            </p>
          </div>
          <Button 
            className="mt-4 bg-primary text-white" 
            onClick={() => {
              setInquirySent(false);
              setFormData({ name: "", email: "", department: "general", subject: "", message: "" });
            }}
          >
            Close Window
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
