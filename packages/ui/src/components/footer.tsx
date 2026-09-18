import * as React from "react";
import { Landmark, Mail, MapPin, ExternalLink, Globe } from "lucide-react";
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
  const { navigateToUrl } = useDajem();

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
    <footer className="border-t border-border/50 bg-card/60 backdrop-blur-md text-card-foreground">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Corporate Summary */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <Landmark className="h-6 w-6 text-primary dark:text-blue-400" />
              <span className="text-lg font-bold tracking-tight text-foreground">
                {group.displayName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {group.summary}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Companies
            </h4>
            <ul className="space-y-2">
              {companies.map((company) => (
                <li key={company.name}>
                  <a
                    href={company.url}
                    onClick={(event) => handleNavigate(event, company.url)}
                    className="group text-sm text-muted-foreground hover:text-primary dark:hover:text-foreground flex items-center gap-1.5 transition-colors"
                  >
                    <span>{company.name}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Group General info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Corporate Office
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <span>{group.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-500" />
                <span>{group.email}</span>
              </li>
            </ul>
          </div>

          {/* Trust and Certifications */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Our Vision
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Coordinating DAJEM Orbital Resources Limited, DAJEM Farms Limited, and DAJEM Homes Limited through shared strategic management.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5 text-emerald-500" />
              <span>Unified DAJEM web portal</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-border/50 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>&copy; {currentYear} {group.displayName}. All rights reserved. Registered in Nigeria · {group.registrationNumber}</p>
          <div className="flex items-center gap-6">
            <a href={`${landingUrl}#privacy`} className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" onClick={(event) => handleNavigate(event, "/terms")} className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Verified Corporate Entity
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
