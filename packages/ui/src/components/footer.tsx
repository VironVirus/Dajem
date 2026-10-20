import * as React from "react";
import { Mail, MapPin, ExternalLink, Globe } from "lucide-react";
import { dajemCompanyProfiles, getAppBaseUrl, getCompanyLinks } from "../lib/store";
import { useDajem } from "./dajem-provider";

interface FooterProps {
  compact?: boolean;
}

export function Footer({ compact = false }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const companies = getCompanyLinks().filter((company) => company.id !== "landing");
  const landingUrl = getAppBaseUrl("landing");
  const group = dajemCompanyProfiles.landing;
  const { navigateToUrl, snapshot } = useDajem();
  const logoUrl = snapshot.brandLogoUrl || "/images/dajem-logo.jpg";

  const handleNavigate = React.useCallback((event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) {
      return;
    }

    event.preventDefault();
    void navigateToUrl(href);
  }, [navigateToUrl]);

  if (compact) {
    return (
      <footer className="border-t border-border/60 bg-card/70 text-card-foreground">
        <div className="container mx-auto flex max-w-6xl flex-col gap-4 px-5 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-bold text-foreground">{group.displayName}</p>
            <p className="mt-1">&copy; {currentYear} · {group.registrationNumber}</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {companies.map((company) => (
              <a
                key={company.name}
                href={company.url}
                onClick={(event) => handleNavigate(event, company.url)}
                className="font-semibold hover:text-foreground"
              >
                {company.name.replace(" Limited", "").replace("DAJEM ", "")}
              </a>
            ))}
            <a href={`${landingUrl}#contact`} className="font-semibold hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border/50 bg-card/75 backdrop-blur-xl text-card-foreground pb-28 lg:pb-12">
      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Corporate Summary */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 overflow-hidden rounded-xl bg-slate-950 shadow-md ring-1 ring-white/20">
                <img src={logoUrl} alt="DAJEM Group" className="h-full w-full object-cover" />
              </span>
              <span className="text-base font-extrabold tracking-tight text-foreground">
                {group.displayName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {group.summary}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold">Unified DAJEM Enterprise</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
              DAJEM Companies
            </h4>
            <ul className="space-y-2">
              {companies.map((company) => (
                <li key={company.name}>
                  <a
                    href={company.url}
                    onClick={(event) => handleNavigate(event, company.url)}
                    className="group text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
                  >
                    <span>{company.name}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Group General info */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
              Corporate Headquarters
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                <span className="leading-relaxed">{group.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-amber-500" />
                <span className="font-mono text-xs">{group.email}</span>
              </li>
            </ul>
          </div>

          {/* Trust and Certifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
              Corporate Governance
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Institutional coordination across DAJEM Orbital Resources, DAJEM Farms, and DAJEM Homes from the corporate base in Enugu.
            </p>
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
              <p className="font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                CAC Registered & Certified
              </p>
              <p className="font-mono text-[11px] mt-0.5 text-muted-foreground">{group.registrationNumber}</p>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-border/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>&copy; {currentYear} {group.displayName}. All rights reserved. Registered in Nigeria · {group.registrationNumber}</p>
          <div className="flex items-center gap-5">
            <a href={`${landingUrl}#privacy`} className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" onClick={(event) => handleNavigate(event, "/terms")} className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Verified Operations
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
