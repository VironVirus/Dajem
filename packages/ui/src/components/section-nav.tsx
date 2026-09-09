"use client";

import * as React from "react";
import { Compass } from "lucide-react";
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
  const [activeHash, setActiveHash] = React.useState<string>("");

  React.useEffect(() => {
    const updateActive = () => {
      const hash = window.location.hash;
      if (hash) {
        setActiveHash(hash);
      } else if (items[0]) {
        setActiveHash(items[0].href);
      }
    };

    updateActive();
    window.addEventListener("hashchange", updateActive);
    return () => window.removeEventListener("hashchange", updateActive);
  }, [items]);

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    setActiveHash(href);
    window.history.replaceState(null, "", href);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      aria-label={label}
      className={cn(
        "sticky top-[4.5rem] z-30 border-b border-border/50 bg-background/80 py-2.5 backdrop-blur-xl transition-all dark:border-white/10 dark:bg-slate-950/80",
        className,
      )}
    >
      <div className="container mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Compass className="h-3.5 w-3.5 text-primary dark:text-blue-400" />
          <span className="hidden uppercase tracking-wider sm:inline">Explore</span>
          <span className="font-bold text-foreground">{label}</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const isActive = activeHash === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className={cn(
                  "inline-flex items-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-tight transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground dark:hover:bg-white/10",
                )}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
