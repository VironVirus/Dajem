import { BadgeCheck, Landmark, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

interface TrustRibbonProps {
  companyName: string;
  registrationNumber: string;
  className?: string;
}

export function TrustRibbon({ companyName, registrationNumber, className }: TrustRibbonProps) {
  return (
    <aside className={cn("border-y border-border/70 bg-card/68 backdrop-blur-xl", className)} aria-label="Trust and compliance information">
      <div className="container mx-auto flex max-w-6xl gap-3 overflow-x-auto px-5 py-3 text-xs sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-background/72 px-3 py-1.5 font-semibold text-foreground">
          <Landmark className="h-3.5 w-3.5 text-primary" /> CAC registered: {registrationNumber}
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
          <BadgeCheck className="h-3.5 w-3.5" /> Verified DAJEM business
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-background/72 px-3 py-1.5 font-semibold text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Unified account and secure records
        </span>
        <span className="sr-only">{companyName}</span>
      </div>
    </aside>
  );
}
