import { BadgeCheck, CheckCircle2, Landmark, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

interface TrustRibbonProps {
  companyName: string;
  registrationNumber: string;
  className?: string;
}

export function TrustRibbon({ companyName, registrationNumber, className }: TrustRibbonProps) {
  return (
    <aside
      className={cn("border-y border-border/50 bg-muted/20 backdrop-blur-md py-2.5", className)}
      aria-label="Trust and compliance information"
    >
      <div className="container mx-auto flex max-w-6xl items-center justify-start sm:justify-center gap-2.5 overflow-x-auto px-4 text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-card/90 px-3.5 py-1 text-xs font-semibold text-foreground shadow-sm">
          <Landmark className="h-3.5 w-3.5 text-amber-500" />
          <span>
            CAC Registered: <strong className="font-mono font-bold tracking-tight text-foreground">{registrationNumber}</strong>
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-sm">
          <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Verified Enterprise Operations</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-card/90 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
          <span>Enugu Headquarters</span>
        </span>
        <span className="hidden md:inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-card/90 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
          <span>Multi-Sector Group Synergy</span>
        </span>
        <span className="sr-only">{companyName}</span>
      </div>
    </aside>
  );
}

