import * as React from "react";
import { Landmark, Mail, Phone, MapPin, ExternalLink, Globe } from "lucide-react";
import { getAppBaseUrl, getCompanyLinks } from "../lib/store";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const companies = getCompanyLinks().filter((company) => company.id !== "landing");
  const landingUrl = getAppBaseUrl("landing");

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Corporate Summary */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <Landmark className="h-6 w-6 text-primary dark:text-blue-400" />
              <span className="text-lg font-bold tracking-tight text-primary dark:text-foreground">
                Dajem Group
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              A premium, diversified conglomerate providing sustainable agricultural products, exceptional real estate assets, and geomatics surveying services.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary dark:text-foreground">
              Companies
            </h4>
            <ul className="space-y-2">
              {companies.map((company) => (
                <li key={company.name}>
                  <a
                    href={company.url}
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
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary dark:text-foreground">
              Corporate Office
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <span>12 Dajem Avenue, Commercial District, Abuja, Nigeria</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span>+234 803 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-500" />
                <span>info@dajemgroup.com</span>
              </li>
            </ul>
          </div>

          {/* Trust and Certifications */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary dark:text-foreground">
              Our Vision
            </h4>
            <p className="text-sm text-muted-foreground">
              Driven by reliability, precision, and sustainability. Building a brighter, more connected, and resource-rich future across Africa and globally.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5 text-emerald-500" />
              <span>Certified Sustainable Builder & Surveyor</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-border/60 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>&copy; {currentYear} Dajem Group. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href={`${landingUrl}#privacy`} className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href={`${landingUrl}#terms`} className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <span className="text-emerald-500 dark:text-emerald-400 font-semibold">
              Ready for Supabase & Flutterwave
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
