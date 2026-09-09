import { BadgeCheck, Landmark, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

interface TrustRibbonProps {
  companyName: string;
  registrationNumber: string;
  className?: string;
}

export function TrustRibbon({ companyName, registrationNumber, className }: TrustRibbonProps) {
  return (
    <aside className={cn("border-y border-border/50 bg-background/50 backdrop-blur-md", className)} aria-label="Trust and compliance information">
      <div className="container mx-auto flex max-w-6xl items-center justify-center gap-3 overflow-x-auto px-4 py-2.5 text-xs sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3.5 py-1 text-xs font-semibold text-foreground shadow-sm">
          <Landmark className="h-3.5 w-3.5 text-primary dark:text-blue-400" />
          <span>CAC Registered: <strong className="font-mono font-bold">{registrationNumber}</strong></span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shadow-sm">
          <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Verified Enterprise Operations</span>
        </span>
        <span className="hidden sm:inline-flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3.5 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-primary dark:text-blue-400" />
          <span>Unified Enterprise Architecture</span>
        </span>
        <span className="sr-only">{companyName}</span>
      </div>
    </aside>
  );
}
