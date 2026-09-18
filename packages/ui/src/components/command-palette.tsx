"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Calculator,
  Command,
  House,
  Map,
  Search,
  ShoppingBasket,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useDajem } from "./dajem-provider";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CommandItem {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: string;
}

const commands: CommandItem[] = [
  { label: "DAJEM Group Hub", description: "Corporate portfolio and contact", href: "/", icon: Building2, tone: "bg-slate-900 text-white" },
  { label: "Perimeter survey estimator", description: "Start a live estimate", href: "/survey/estimate", icon: Calculator, tone: "bg-cyan-500 text-white" },
  { label: "Survey inquiry desk", description: "Submit documents and a formal request", href: "/survey/inquiry", icon: Map, tone: "bg-sky-600 text-white" },
  { label: "Survey tracker", description: "Follow survey and DHL delivery progress", href: "/survey/tracker", icon: Map, tone: "bg-cyan-700 text-white" },
  { label: "Farm catalogue", description: "Shop livestock, grills, produce, and equipment", href: "/farms/shop", icon: ShoppingBasket, tone: "bg-emerald-600 text-white" },
  { label: "Chicken orders", description: "Choose live, processed, grilled, and cut options", href: "/farms/chicken", icon: ShoppingBasket, tone: "bg-emerald-700 text-white" },
  { label: "DAJEM Homes listings", description: "Browse verified homes and hospitality", href: "/properties/listings", icon: House, tone: "bg-blue-700 text-white" },
  { label: "Submit a property", description: "Send a property for verification and approval", href: "/properties/submit", icon: House, tone: "bg-blue-800 text-white" },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const { navigateToUrl } = useDajem();

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const matches = commands.filter((item) => {
    const searchable = `${item.label} ${item.description}`.toLowerCase();
    return searchable.includes(query.trim().toLowerCase());
  });

  const selectCommand = (href: string) => {
    onOpenChange(false);
    void navigateToUrl(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/48 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={() => onOpenChange(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="DAJEM command palette"
            className="w-full max-w-2xl overflow-hidden rounded-[1.6rem] border border-white/20 bg-background/96 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/96"
            initial={{ opacity: 0, y: -18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border/80 px-5 py-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") onOpenChange(false);
                  if (event.key === "Enter" && matches[0]) selectCommand(matches[0].href);
                }}
                placeholder="Search DAJEM services, products, or properties"
                className="min-w-0 flex-1 bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">ESC</kbd>
            </div>
            <div className="p-3">
              <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Quick navigation</p>
              <div className="grid gap-1">
                {matches.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => selectCommand(item.href)}
                    className="flex items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-accent"
                  >
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", item.tone)}>
                      <item.icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-foreground">{item.label}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.description}</span>
                    </span>
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
                {matches.length === 0 && (
                  <p className="px-3 py-8 text-center text-sm text-muted-foreground">No matching DAJEM destination yet.</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border/80 px-5 py-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Command className="h-3.5 w-3.5" /> DAJEM Command</span>
              <span>Enter to open the first result</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
