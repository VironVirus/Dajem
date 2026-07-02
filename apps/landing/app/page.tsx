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
  CheckCircle2
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
        <HeroSlideshow
          className="py-20 sm:py-24 md:py-32"
          contentClassName="landing-hero-copy"
          overlayClassName="bg-[linear-gradient(180deg,rgba(248,250,252,0.18),rgba(248,250,252,0.34),rgba(248,250,252,0.68))] dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.4),rgba(2,6,23,0.74))]"
          slides={[
            { src: "/images/landing-boardroom-1.png", position: "center" },
            { src: "/images/landing-boardroom-2.png", position: "center" },
            { src: "/images/landing-boardroom-3.png", position: "center" },
            { src: "/images/landing-boardroom-4.png", position: "center" },
          ]}
        >
          <div className="absolute left-[-4rem] top-12 h-44 w-44 rounded-full bg-emerald-500/14 blur-3xl -z-10 sm:h-64 sm:w-64" />
          <div className="absolute right-[-5rem] top-20 h-56 w-56 rounded-full bg-primary/14 blur-3xl -z-10 sm:h-80 sm:w-80" />
          <div className="absolute bottom-0 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-amber-400/12 blur-3xl -z-10 sm:h-48 sm:w-48" />

          <div className="container mx-auto max-w-5xl px-4 text-center sm:px-6">
            <Badge variant="secondary" className="landing-hero-chip mb-5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] sm:mb-6 sm:text-sm">
              DAJEM Group corporate leadership
            </Badge>

            <h1 className="mb-5 bg-gradient-to-r from-primary via-slate-900 to-emerald-600 bg-clip-text text-[2.6rem] font-extrabold leading-[1.02] text-transparent dark:from-blue-400 dark:via-white dark:to-emerald-400 sm:text-5xl md:mb-6 md:text-6xl">
              <span className="block">DAJEM Group</span>
              <span className="mt-2 block text-[1.1rem] leading-[1.3] text-slate-800 dark:text-slate-100 sm:text-[1.45rem] md:text-[1.7rem]">
                Strategic direction and shared oversight for the DAJEM subsidiary companies
              </span>
            </h1>

            <p className="mx-auto mb-8 max-w-3xl text-base leading-relaxed text-slate-700/90 dark:text-slate-200/85 sm:text-lg md:mb-10 md:text-xl">
              Ownership, governance, and operational coordination across {orbitalProfile.displayName}, {farmsProfile.displayName}, and {homesProfile.displayName} from the corporate base in Enugu.
            </p>

            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button size="lg" className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90" onClick={() => {
                const el = document.getElementById("companies");
                el?.scrollIntoView({ behavior: "smooth" });
              }}>
                Explore Our Subsidiaries
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => {
                const el = document.getElementById("contact");
                el?.scrollIntoView({ behavior: "smooth" });
              }}>
                Contact Group Office
              </Button>
            </div>
          </div>
        </HeroSlideshow>

        <section className="border-y border-border bg-card/42 py-10 backdrop-blur-sm sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 gap-5 text-center sm:gap-8 lg:grid-cols-4">
              <div className="space-y-2">
                <p className="text-3xl font-extrabold text-primary dark:text-blue-400">4</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registered Companies</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-extrabold text-emerald-500">2026</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Group Opened</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-extrabold text-primary dark:text-blue-400">2023</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Earliest Subsidiary Year</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-extrabold text-emerald-500">Enugu</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Corporate Base</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="container mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
            <div>
              <Badge variant="secondary" className="mb-4">
                Corporate Foundations
              </Badge>
              <p className="text-muted-foreground mb-0 leading-relaxed">
                DAJEM Group was opened in May, 2026 to own, direct, and coordinate the subsidiary companies within the DAJEM group structure.
              </p>
              <p className="text-muted-foreground mb-8 mt-8 leading-relaxed">
                DAJEM Group Owns and Controls all Subsidiary Companies and facilitates Strategic Management
              </p>
              <div className="mb-8 grid grid-cols-1 gap-3 rounded-3xl border bg-card/72 p-4 text-sm text-muted-foreground shadow-sm sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Registration Details</p>
                {[groupProfile, orbitalProfile, farmsProfile, homesProfile].map((company) => (
                  <div key={company.id} className="grid gap-1 rounded-2xl border bg-background/70 px-4 py-3 sm:grid-cols-[1.2fr_auto_auto] sm:items-center sm:gap-3">
                    <span className="font-semibold text-foreground">{company.displayName}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{company.registrationNumber}</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Registered {getRegistrationYear(company.startDate)}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { title: "Strategic Management", icon: Cpu },
                  { title: "Subsidiary Governance", icon: ShieldCheck },
                  { title: "Registered Operations", icon: Award },
                  { title: "Shared Admin Team", icon: Users2 }
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-3 rounded-2xl border bg-card/55 p-4">
                    <item.icon className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-semibold text-foreground/80">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[30px] border bg-card/78 shadow-2xl shadow-slate-900/8">
              <div className="landing-map-frame relative min-h-[360px] sm:min-h-[420px] lg:min-h-[540px]">
                <iframe
                  title="Corporate HQ Map"
                  src={`https://www.google.com/maps?q=${mapQuery}&z=16&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full border-0"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.16),rgba(15,23,42,0.28))]" />
              </div>

              <div className="absolute inset-x-4 bottom-4 rounded-[24px] border border-white/50 bg-background/88 p-4 shadow-xl backdrop-blur-xl dark:border-white/12 dark:bg-slate-950/78 sm:inset-x-6 sm:bottom-6 sm:p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                    <Landmark className="h-6 w-6 text-primary dark:text-blue-400" />
                  </div>
                  <Badge variant="default" className="bg-emerald-500 text-white hover:bg-emerald-600">
                    Corporate HQ
                  </Badge>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-primary dark:text-foreground">{groupProfile.shortName}</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {groupProfile.address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Google Maps pin preview is currently based on the corporate address and can be fine-tuned when you send the exact location.
                  </p>
                  <div className="flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Active & operating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="companies" className="border-y border-border bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="secondary" className="mb-4">
                Corporate Portfolio
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-foreground mb-4">
                Our Subsidiaries
              </h2>
              <p className="text-muted-foreground">
                Each subsidiary operates in its own sector while drawing strategic support from {groupProfile.shortName}.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {companies.map((company) => (
                <Card key={company.id} className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border-white/40 bg-card/92 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className={`flex h-24 items-center border-b border-border/50 bg-gradient-to-br p-6 ${company.themeColor}`} />

                  <div className="absolute left-6 top-12 flex h-12 w-12 items-center justify-center rounded-xl border bg-background shadow-md">
                    <company.icon className={`h-6 w-6 ${company.iconColor}`} />
                  </div>

                  <CardHeader className="pt-8">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <CardTitle className="text-xl leading-snug">{company.title}</CardTitle>
                      <Badge variant="outline">{company.badge}</Badge>
                    </div>
                    <CardDescription className="line-clamp-3 min-h-[60px] pt-1">
                      {company.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col justify-end pt-0">
                    <div className="flex items-center gap-1.5 rounded-xl bg-muted p-3 text-xs font-semibold text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{company.stats}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 mt-4">
                    <Button 
                      className="w-full bg-primary hover:bg-primary/95 text-white flex items-center justify-center gap-1.5 group-hover:bg-emerald-500 transition-colors"
                      onClick={() => void navigateToUrl(company.href)}
                    >
                      <span>{company.cta}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-20">
          <Card className="overflow-hidden border-border/70 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-5">
              <div className="flex flex-col justify-between space-y-8 bg-primary p-6 text-primary-foreground sm:p-8 md:col-span-2">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Corporate Office</h3>
                  <p className="text-primary-foreground/80 text-sm leading-relaxed">
                    Have questions about {groupProfile.shortName} or interested in partnership opportunities? Drop us a line.
                  </p>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-emerald-400">Headquarters</p>
                    <p className="opacity-80">{groupProfile.address}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-400">Email Address</p>
                    <p className="opacity-80">{groupProfile.email}</p>
                  </div>
                </div>

                <div className="text-xs opacity-60">
                  Response within 24 hours.
                </div>
              </div>

              <div className="p-6 sm:p-8 md:col-span-3">
                <h3 className="text-xl font-bold text-primary dark:text-foreground mb-6">Send a Message</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                    />
                  </div>

                  <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
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
