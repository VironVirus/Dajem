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
  getAppBaseUrl,
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

export default function LandingPage() {
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
      id: "poultry",
      title: "Dajem Poultry",
      description: "Sustainable agriculture, premium poultry breeding, organic feed distribution, and modern processing technology.",
      href: getAppBaseUrl("poultry"),
      icon: Egg,
      themeColor: "from-amber-500/20 to-yellow-600/10 dark:from-amber-500/10 dark:to-yellow-600/5",
      iconColor: "text-amber-500",
      stats: "10K+ Daily Capacity",
      cta: "Browse Products",
      badge: "Agriculture"
    },
    {
      id: "real-estate",
      title: "Dajem Real Estate",
      description: "Discover and secure premium luxury properties, commercial spaces, residential estates, and flexible lease options.",
      href: getAppBaseUrl("real-estate"),
      icon: Building2,
      themeColor: "from-emerald-500/20 to-teal-600/10 dark:from-emerald-500/10 dark:to-teal-600/5",
      iconColor: "text-emerald-500",
      stats: "250+ Listings Available",
      cta: "Find Properties",
      badge: "Real Estate"
    },
    {
      id: "survey",
      title: "Dajem Survey & Plans",
      description: "High-precision engineering surveys, boundary mapping, geomatics, and stunning architectural drafting.",
      href: getAppBaseUrl("survey"),
      icon: Map,
      themeColor: "from-cyan-500/20 to-blue-600/10 dark:from-cyan-500/10 dark:to-blue-600/5",
      iconColor: "text-cyan-500",
      stats: "100% Survey Success",
      cta: "Get Estimate",
      badge: "Geomatics & Architecture"
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="landing" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32 bg-gradient-to-b from-primary/5 via-transparent to-background">
          {/* Decorative shapes */}
          <div className="absolute top-1/4 left-1/10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl -z-10" />
          <div className="absolute top-1/3 right-1/10 w-96 h-96 rounded-full bg-primary/10 blur-3xl -z-10" />

          <div className="container mx-auto px-4 text-center max-w-4xl">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm rounded-full">
              Pioneering Multi-Industry Synergy
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary via-slate-800 to-emerald-600 dark:from-blue-400 dark:via-white dark:to-emerald-400 bg-clip-text text-transparent leading-[1.15]">
              Innovative Solutions for Agriculture, Real Estate, and Geomatics
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Dajem Group is a unified conglomerate operating at the intersection of modern agricultural solutions, premium structural assets, and precise cartographic surveying.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button size="lg" className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90" onClick={() => {
                const el = document.getElementById("companies");
                el?.scrollIntoView({ behavior: "smooth" });
              }}>
                Explore Our Companies
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => {
                const el = document.getElementById("contact");
                el?.scrollIntoView({ behavior: "smooth" });
              }}>
                Contact Corporate Office
              </Button>
            </div>
          </div>
        </section>

        {/* Corporate Trust Banner */}
        <section className="py-12 border-y border-border bg-card/40 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <p className="text-3xl font-extrabold text-primary dark:text-blue-400">100%</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compliance & Trust</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-extrabold text-emerald-500">15+</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Years Experience</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-extrabold text-primary dark:text-blue-400">50K+</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customers Reached</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-extrabold text-emerald-500">A+</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                Corporate Foundations
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-foreground mb-6">
                Built on Integrity, Driven by Excellence
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Founded as a unified front to tackle key sectors, Dajem Group coordinates operations across three specialized companies. We blend cutting-edge technology, eco-friendly workflows, and a customer-first philosophy to build lasting value.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Whether supplying organic feed to nourish farming operations, matching families with premium properties, or calculating precise boundaries for large infrastructures, our mission remains absolute: delivering trust and quality.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Precision Mapping", icon: Cpu },
                  { title: "Sustainable Breeding", icon: ShieldCheck },
                  { title: "Certified Developers", icon: Award },
                  { title: "Client First Team", icon: Users2 }
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                    <item.icon className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-semibold text-foreground/80">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Decorative Grid */}
            <div className="relative h-[400px] w-full rounded-2xl overflow-hidden border bg-gradient-to-tr from-primary/10 to-emerald-500/10 p-6 flex flex-col justify-between">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />
              
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Landmark className="h-6 w-6 text-primary dark:text-blue-400" />
                </div>
                <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  Corporate HQ
                </Badge>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-bold text-primary dark:text-foreground">Dajem Group Conglomerate</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Integrating logistics, management, compliance, and corporate finance under a single, highly-scalable administration.
                </p>
                <div className="flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs text-emerald-500 font-semibold tracking-wider uppercase">Active & Operating</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Companies Section */}
        <section id="companies" className="py-20 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="secondary" className="mb-4">
                Corporate Portfolio
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-foreground mb-4">
                Our Subsidiaries
              </h2>
              <p className="text-muted-foreground">
                Each company operates independently with specialized teams, while drawing core administrative and strategic support from the Dajem Group structure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {companies.map((company) => (
                <Card key={company.id} className="relative overflow-hidden flex flex-col group h-full hover:-translate-y-1 duration-300">
                  {/* Color strip / overlay */}
                  <div className={`h-24 bg-gradient-to-br ${company.themeColor} flex items-center p-6 border-b border-border/50`} />
                  
                  {/* Icon floating */}
                  <div className="absolute top-12 left-6 h-12 w-12 rounded-xl bg-background border shadow-md flex items-center justify-center">
                    <company.icon className={`h-6 w-6 ${company.iconColor}`} />
                  </div>

                  <CardHeader className="pt-8">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl">{company.title}</CardTitle>
                      <Badge variant="outline">{company.badge}</Badge>
                    </div>
                    <CardDescription className="line-clamp-3 min-h-[60px] pt-1">
                      {company.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col justify-end pt-0">
                    <div className="text-xs font-semibold text-muted-foreground bg-muted p-2 rounded-md flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{company.stats}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 mt-4">
                    <Button 
                      className="w-full bg-primary hover:bg-primary/95 text-white flex items-center justify-center gap-1.5 group-hover:bg-emerald-500 transition-colors"
                      onClick={() => window.location.href = company.href}
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

        {/* Contact Form Section */}
        <section id="contact" className="py-20 container mx-auto px-4 max-w-4xl">
          <Card className="shadow-xl border-border/70 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5">
              {/* Sidebar Info */}
              <div className="bg-primary p-8 text-primary-foreground md:col-span-2 flex flex-col justify-between space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Corporate Office</h3>
                  <p className="text-primary-foreground/80 text-sm leading-relaxed">
                    Have questions about Dajem Group or interested in partnership opportunities? Drop us a line.
                  </p>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-emerald-400">Headquarters</p>
                    <p className="opacity-80">12 Dajem Avenue, Abuja</p>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-400">Hotline</p>
                    <p className="opacity-80">+234 803 123 4567</p>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-400">Email Address</p>
                    <p className="opacity-80">info@dajemgroup.com</p>
                  </div>
                </div>

                <div className="text-xs opacity-60">
                  Response within 24 hours.
                </div>
              </div>

              {/* Form Input */}
              <div className="p-8 md:col-span-3">
                <h3 className="text-xl font-bold text-primary dark:text-foreground mb-6">Send a Message</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        required
                        placeholder="John Doe" 
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
                        placeholder="john@example.com" 
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
                        { value: "poultry", label: "Dajem Poultry Operations" },
                        { value: "realestate", label: "Dajem Real Estate Listings" },
                        { value: "survey", label: "Dajem Survey & Plans Division" }
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      required
                      placeholder="Collaboration opportunity" 
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
                      placeholder="Provide detailed description..." 
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
              Your inquiry has been successfully routed to the <strong className="text-emerald-500 uppercase">{formData.department}</strong> department. A Dajem representative will contact you at <strong>{formData.email}</strong> shortly.
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
