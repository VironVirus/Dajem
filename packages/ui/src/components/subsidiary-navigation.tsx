"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";

export interface SubsidiaryNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

type SubsidiaryAccent = "cyan" | "emerald" | "blue";

const accentStyles: Record<
  SubsidiaryAccent,
  {
    active: string;
    icon: string;
    eyebrow: string;
    card: string;
    glow: string;
    border: string;
  }
> = {
  cyan: {
    active: "bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 text-white shadow-md shadow-cyan-500/25 ring-1 ring-cyan-400/30 font-bold",
    icon: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 ring-1 ring-cyan-500/25 shadow-sm shadow-cyan-500/10",
    eyebrow: "text-cyan-700 dark:text-cyan-300",
    card: "hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5",
    glow: "from-cyan-500/15 via-sky-500/10 to-transparent",
    border: "border-cyan-500/20",
  },
  emerald: {
    active: "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-500/25 ring-1 ring-emerald-400/30 font-bold",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/25 shadow-sm shadow-emerald-500/10",
    eyebrow: "text-emerald-700 dark:text-emerald-300",
    card: "hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5",
    glow: "from-emerald-500/15 via-teal-500/10 to-transparent",
    border: "border-emerald-500/20",
  },
  blue: {
    active: "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400/30 font-bold",
    icon: "bg-blue-500/15 text-blue-600 dark:text-blue-300 ring-1 ring-blue-500/25 shadow-sm shadow-blue-500/10",
    eyebrow: "text-blue-700 dark:text-blue-300",
    card: "hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5",
    glow: "from-blue-500/15 via-indigo-500/10 to-transparent",
    border: "border-blue-500/20",
  },
};

interface SubsidiaryNavProps {
  label: string;
  items: SubsidiaryNavItem[];
  accent: SubsidiaryAccent;
}

export function SubsidiaryNav({ label, items, accent }: SubsidiaryNavProps) {
  const pathname = usePathname();
  const styles = accentStyles[accent];

  return (
    <nav
      aria-label={`${label} navigation`}
      className="sticky top-[4.5rem] z-30 border-b border-border/50 bg-background/85 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/85"
    >
      <div className="container mx-auto max-w-6xl px-3 py-2 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Subtle mobile brand label */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            <span className={cn("h-2 w-2 rounded-full", accent === "emerald" ? "bg-emerald-500 animate-pulse" : accent === "blue" ? "bg-blue-500 animate-pulse" : "bg-cyan-500 animate-pulse")} />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">
              {label} Portal
            </p>
          </div>

          {/* Segmented Pill Tray (Scrolls horizontally on mobile, fits cleanly on desktop) */}
          <div className="flex w-full items-center gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:w-auto lg:justify-end">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 mobile-tap-target",
                    isActive
                      ? styles.active
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:hover:bg-white/10",
                  )}
                >
                  <item.icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-white" : "text-muted-foreground")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

interface SubsidiaryPageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  accent: SubsidiaryAccent;
}

export function SubsidiaryPageIntro({ eyebrow, title, description, accent }: SubsidiaryPageIntroProps) {
  const styles = accentStyles[accent];

  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_55%),linear-gradient(to_bottom,hsl(var(--muted)/0.35),transparent)] py-8 sm:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] shadow-sm backdrop-blur-sm">
          <Sparkles className={cn("h-3 w-3", styles.eyebrow)} />
          <span className={styles.eyebrow}>{eyebrow}</span>
        </div>
        <h1 className="mt-3 max-w-3xl text-2xl font-black tracking-[-0.035em] text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
    </section>
  );
}

interface SubsidiaryRouteGridProps {
  title: string;
  description?: string;
  items: Array<SubsidiaryNavItem & { description: string; meta?: string }>;
  accent: SubsidiaryAccent;
}

export function SubsidiaryRouteGrid({ title, description, items, accent }: SubsidiaryRouteGridProps) {
  const styles = accentStyles[accent];

  return (
    <section className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-5 sm:mb-7">
        <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">{description}</p>}
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex min-h-36 flex-col overflow-hidden rounded-[1.6rem] border border-border/70 bg-card p-4.5 shadow-sm transition-all duration-300 hover:-translate-y-1 sm:p-5",
              styles.card,
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105", styles.icon)}>
                <item.icon className="h-5 w-5" />
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-muted/40 text-muted-foreground transition-all duration-200 group-hover:border-primary/40 group-hover:bg-primary group-hover:text-white">
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
            <div className="mt-auto pt-4">
              {item.meta && (
                <p className={cn("mb-1 text-[10px] font-black uppercase tracking-wider", styles.eyebrow)}>
                  {item.meta}
                </p>
              )}
              <h3 className="text-sm font-extrabold leading-snug text-foreground sm:text-base group-hover:text-primary transition-colors">
                {item.label}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

