"use client";

import * as React from "react";
import { ChevronDown, Menu } from "lucide-react";
import { cn } from "../lib/utils";

export interface SectionNavItem {
  href: string;
  label: string;
}

interface SectionNavProps {
  items: SectionNavItem[];
  label?: string;
  className?: string;
}

export function SectionNav({ items, label = "this page", className }: SectionNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleDesktopChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const href = event.target.value;
    if (!href) return;

    window.history.replaceState(null, "", href);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
    event.target.value = "";
  };

  return (
    <nav
      aria-label={label}
      className={cn(
        "sticky top-16 z-30 bg-background/88 py-2 backdrop-blur-xl dark:bg-slate-950/88",
        className,
      )}
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="hidden min-h-11 items-center justify-between gap-5 lg:flex">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Explore {label}
          </span>
          <label className="relative block w-64">
            <span className="sr-only">Jump to a {label} section</span>
            <select
              defaultValue=""
              onChange={handleDesktopChange}
              className="h-10 w-full appearance-none rounded-xl border border-border/80 bg-card/85 px-3 pr-10 text-sm font-semibold text-foreground shadow-sm outline-none transition-colors hover:border-primary/35 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="" disabled>Jump to section</option>
              {items.map((item) => (
                <option key={item.href} value={item.href}>{item.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </label>
        </div>

        <div className="relative lg:hidden">
          <button
            type="button"
            aria-expanded={isMobileMenuOpen}
            aria-controls="page-section-menu"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="inline-flex h-11 w-full items-center justify-between rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            <span className="flex items-center gap-2.5">
              <Menu className="h-4 w-4" />
              Explore {label}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground/72">
              Menu
            </span>
          </button>
          {isMobileMenuOpen && (
            <div id="page-section-menu" className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-border/80 bg-background/98 p-2 shadow-2xl backdrop-blur-xl dark:bg-slate-950/98">
              <div className="grid gap-1">
                {items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
