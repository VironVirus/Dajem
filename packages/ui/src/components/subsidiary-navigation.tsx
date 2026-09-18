"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";

export interface SubsidiaryNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

type SubsidiaryAccent = "cyan" | "emerald" | "blue";

const accentStyles: Record<SubsidiaryAccent, {
  active: string;
  icon: string;
  eyebrow: string;
  card: string;
}> = {
  cyan: {
    active: "bg-cyan-600 text-white shadow-cyan-700/20",
    icon: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
    eyebrow: "text-cyan-700 dark:text-cyan-300",
    card: "hover:border-cyan-500/45 hover:shadow-cyan-950/10",
  },
  emerald: {
    active: "bg-emerald-600 text-white shadow-emerald-700/20",
    icon: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    eyebrow: "text-emerald-700 dark:text-emerald-300",
    card: "hover:border-emerald-500/45 hover:shadow-emerald-950/10",
  },
  blue: {
    active: "bg-blue-700 text-white shadow-blue-800/20",
    icon: "bg-blue-500/12 text-blue-700 dark:text-blue-300",
    eyebrow: "text-blue-700 dark:text-blue-300",
    card: "hover:border-blue-500/45 hover:shadow-blue-950/10",
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
      aria-label={`${label} pages`}
      className="sticky top-[4.5rem] z-30 border-b border-border/60 bg-background/94 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/94"
    >
      <div className="container mx-auto max-w-6xl px-2 py-2 sm:px-6">
        <p className="hidden text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground lg:mb-2 lg:block">
          {label} app
        </p>
        <div className={cn("grid gap-1.5", items.length === 3 ? "grid-cols-3" : items.length === 4 ? "grid-cols-4" : "grid-cols-5")}>
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-bold leading-none transition-all sm:flex-row sm:gap-2 sm:px-3 sm:text-xs lg:justify-start",
                  isActive
                    ? cn("shadow-lg", styles.active)
                    : "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-white/10",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
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
    <section className="border-b border-border/70 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.09),transparent_38%),linear-gradient(to_bottom,hsl(var(--muted)/0.46),transparent)]">
      <div className="container mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-11">
        <p className={cn("text-[11px] font-extrabold uppercase tracking-[0.2em]", styles.eyebrow)}>{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl text-2xl font-extrabold tracking-[-0.035em] text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
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
    <section className="container mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-14">
      <div className="mb-5 sm:mb-7">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">{title}</h2>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex min-h-36 flex-col rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg sm:min-h-40 sm:p-5",
              styles.card,
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", styles.icon)}>
                <item.icon className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
            <div className="mt-auto pt-5">
              {item.meta && <p className={cn("mb-1 text-[10px] font-extrabold uppercase tracking-wider", styles.eyebrow)}>{item.meta}</p>}
              <h3 className="text-sm font-extrabold leading-tight text-foreground sm:text-base">{item.label}</h3>
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
