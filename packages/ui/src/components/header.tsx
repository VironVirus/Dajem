"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Boxes, CalendarDays, ChevronDown, Command, Egg, Grid2X2, House, Landmark,
  LayoutDashboard, LogOut, Mail, Map, Search, ShieldCheck, ShoppingCart, UserCircle2,
} from "lucide-react";
import { Button } from "./button";
import { CommandPalette } from "./command-palette";
import { useDajem } from "./dajem-provider";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "../lib/utils";
import { getCompanyLinks } from "../lib/store";

interface HeaderProps {
  activeApp: "landing" | "poultry" | "real-estate" | "survey";
  onCartClick?: () => void;
}

type OpenMenu = "account" | "ecosystem" | null;

const appVisuals = {
  landing: { icon: Landmark, label: "Group Hub", color: "text-slate-950 dark:text-white", surface: "from-slate-950 via-slate-800 to-slate-700 text-white", description: "Corporate strategy and group oversight" },
  survey: { icon: Map, label: "Orbital", color: "text-cyan-600 dark:text-cyan-300", surface: "from-cyan-600 via-sky-600 to-blue-800 text-white", description: "Surveying, mapping, and project delivery" },
  poultry: { icon: Egg, label: "Farms", color: "text-emerald-600 dark:text-emerald-300", surface: "from-emerald-600 via-emerald-700 to-teal-800 text-white", description: "Livestock, food, produce, and agro-commerce" },
  "real-estate": { icon: House, label: "Homes", color: "text-blue-700 dark:text-blue-300", surface: "from-blue-700 via-blue-800 to-slate-900 text-white", description: "Homes, hospitality, and property management" },
} as const;

export function Header({ activeApp, onCartClick }: HeaderProps) {
  const [currentOrigin, setCurrentOrigin] = React.useState<string | undefined>(undefined);
  const [openMenu, setOpenMenu] = React.useState<OpenMenu>(null);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [mobileCompaniesOpen, setMobileCompaniesOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const { currentUser, cartCount, navigateToUrl, openAuthModal, logout } = useDajem();

  React.useEffect(() => setCurrentOrigin(window.location.origin), []);

  React.useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileCompaniesOpen(false);
        setPaletteOpen(false);
      }
    };
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    window.addEventListener("keydown", handleKeyboard);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyboard);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const apps = getCompanyLinks(activeApp, currentOrigin).map((company) => ({ ...company, ...appVisuals[company.id] }));
  const currentApp = apps.find((app) => app.id === activeApp) ?? apps[0];
  const dashboardHref = currentOrigin ? new URL("/dashboard", currentOrigin).toString() : "/dashboard";
  const contactHref = currentOrigin ? new URL("/#contact", currentOrigin).toString() : "/#contact";
  const adminHref = currentOrigin ? new URL("/admin", currentOrigin).toString() : "/admin";
  const groupHref = apps.find((app) => app.id === "landing")?.url ?? "/";
  const showCartButton = Boolean(activeApp === "poultry" && currentUser && onCartClick);

  const handleNavigate = React.useCallback((event: React.MouseEvent<HTMLAnchorElement>, href: string, afterNavigate?: () => void) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    afterNavigate?.();
    void navigateToUrl(href);
  }, [navigateToUrl]);

  const AppCard = ({ app, compact = false }: { app: (typeof apps)[number]; compact?: boolean }) => (
    <a
      href={app.url}
      onClick={(event) => handleNavigate(event, app.url, () => { setOpenMenu(null); setMobileCompaniesOpen(false); })}
      className={cn("group relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br p-4 shadow-lg transition-transform duration-300 hover:-translate-y-0.5", app.surface, compact && "p-3")}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_38%)]" />
      <div className="relative flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/16 ring-1 ring-white/20 backdrop-blur-sm"><app.icon className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold">{app.label}</span>
          {!compact && <span className="mt-1 block text-xs leading-relaxed text-white/76">{app.description}</span>}
        </span>
      </div>
    </a>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-950/5 bg-background/82 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/82">
        <div className="container mx-auto flex h-[4.5rem] items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href={currentApp?.url} onClick={(event) => currentApp?.url ? handleNavigate(event, currentApp.url) : undefined} className="flex min-w-0 items-center gap-3">
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-gradient-to-br shadow-lg", currentApp.surface)}><currentApp.icon className="h-5 w-5" /></span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">DAJEM ecosystem</span>
              <span className="block truncate text-sm font-bold tracking-tight text-foreground sm:text-base">{currentApp.name}</span>
            </span>
          </a>

          <div ref={menuRef} className="hidden items-center gap-2 lg:flex">
            <Button variant="outline" size="sm" onClick={() => setPaletteOpen(true)} className="h-10 gap-2 rounded-xl border-border/75 bg-card/72 px-3.5 text-muted-foreground shadow-sm hover:bg-accent">
              <Search className="h-4 w-4" /><span>Search DAJEM</span><kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold">Ctrl K</kbd>
            </Button>
            <div className="relative">
              <Button size="sm" onClick={() => setOpenMenu((current) => current === "ecosystem" ? null : "ecosystem")} className="h-10 gap-2 rounded-xl bg-slate-950 px-3.5 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100" aria-expanded={openMenu === "ecosystem"} aria-haspopup="menu">
                <Boxes className="h-4 w-4" /> Ecosystem <ChevronDown className={cn("h-4 w-4 transition-transform", openMenu === "ecosystem" && "rotate-180")} />
              </Button>
              <AnimatePresence>
                {openMenu === "ecosystem" && (
                  <motion.div role="menu" className="absolute right-0 top-full z-50 mt-3 w-[34rem] rounded-[1.5rem] border border-white/30 bg-background/96 p-3 shadow-2xl shadow-slate-950/18 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/96" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ type: "spring", stiffness: 420, damping: 30 }}>
                    <div className="mb-3 flex items-center justify-between px-2 pt-1"><div><p className="text-sm font-bold text-foreground">Choose a DAJEM company</p><p className="text-xs text-muted-foreground">One account. Shared records. Connected services.</p></div><Command className="h-4 w-4 text-muted-foreground" /></div>
                    <div className="grid grid-cols-2 gap-3">{apps.map((app) => <AppCard key={app.id} app={app} />)}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {showCartButton && <Button variant="outline" size="sm" onClick={onCartClick} className="h-10 gap-2 rounded-xl border-border/75 bg-card/72 px-3.5 shadow-sm hover:bg-accent"><ShoppingCart className="h-4 w-4" /> Cart ({cartCount})</Button>}
            <ThemeToggle className="rounded-xl border-border/75 bg-card/72 shadow-sm" />
            {!currentUser ? (
              <Button size="sm" onClick={() => openAuthModal("login")} className="h-10 rounded-xl bg-primary px-4 text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90">Sign in</Button>
            ) : (
              <div className="relative">
                <Button variant="outline" size="sm" onClick={() => setOpenMenu((current) => current === "account" ? null : "account")} className="h-10 gap-2 rounded-xl border-border/75 bg-card/72 px-3.5 shadow-sm hover:bg-accent" aria-expanded={openMenu === "account"} aria-haspopup="menu"><UserCircle2 className="h-4 w-4" />{currentUser.name.split(" ")[0]}<ChevronDown className={cn("h-4 w-4 transition-transform", openMenu === "account" && "rotate-180")} /></Button>
                <AnimatePresence>
                  {openMenu === "account" && (
                    <motion.div role="menu" className="absolute right-0 top-full z-50 mt-3 w-60 rounded-2xl border border-white/30 bg-background/96 p-2 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/96" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}>
                      <a href={dashboardHref} onClick={(event) => handleNavigate(event, dashboardHref, () => setOpenMenu(null))} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"><LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard</a>
                      {currentUser.role === "admin" && <a href={adminHref} onClick={(event) => handleNavigate(event, adminHref, () => setOpenMenu(null))} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Admin centre</a>}
                      <button type="button" onClick={() => { setOpenMenu(null); void logout(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-destructive hover:bg-destructive/8"><LogOut className="h-4 w-4" /> Sign out</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          <div className="lg:hidden"><ThemeToggle className="rounded-xl border-border/75 bg-card/72 shadow-sm" /></div>
        </div>
      </header>

      <AnimatePresence>
        {mobileCompaniesOpen && (
          <motion.div className="fixed inset-x-4 bottom-[calc(5.9rem+env(safe-area-inset-bottom))] z-50 rounded-[1.5rem] border border-white/20 bg-background/96 p-3 shadow-2xl shadow-slate-950/25 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/96 lg:hidden" initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ type: "spring", stiffness: 420, damping: 30 }}>
            <div className="mb-3 flex items-center justify-between px-1"><div><p className="text-sm font-bold text-foreground">DAJEM ecosystem</p><p className="text-xs text-muted-foreground">Switch company without leaving your account.</p></div><button type="button" onClick={() => setMobileCompaniesOpen(false)} className="rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-accent">Close</button></div>
            <div className="grid grid-cols-2 gap-2">{apps.map((app) => <AppCard key={app.id} app={app} compact />)}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav aria-label="Primary DAJEM navigation" className="fixed inset-x-3 bottom-3 z-50 rounded-[1.45rem] border border-white/40 bg-background/88 p-1.5 shadow-2xl shadow-slate-950/18 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/88 lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          <a href={groupHref} onClick={(event) => handleNavigate(event, groupHref)} className={cn("dajem-dock-item", activeApp === "landing" && "is-active")}><Landmark className="h-5 w-5" /><span>Home</span></a>
          <button type="button" onClick={() => setMobileCompaniesOpen((current) => !current)} className={cn("dajem-dock-item", mobileCompaniesOpen && "is-active")}><Grid2X2 className="h-5 w-5" /><span>Companies</span></button>
          {showCartButton ? <button type="button" onClick={onCartClick} className="dajem-dock-item"><ShoppingCart className="h-5 w-5" /><span>Cart {cartCount ? `(${cartCount})` : ""}</span></button> : <button type="button" onClick={() => void navigateToUrl(dashboardHref)} className="dajem-dock-item"><CalendarDays className="h-5 w-5" /><span>Bookings</span></button>}
          {currentUser ? <a href={dashboardHref} onClick={(event) => handleNavigate(event, dashboardHref)} className="dajem-dock-item"><LayoutDashboard className="h-5 w-5" /><span>Dashboard</span></a> : <button type="button" onClick={() => openAuthModal("login")} className="dajem-dock-item"><LayoutDashboard className="h-5 w-5" /><span>Dashboard</span></button>}
          <a href={contactHref} onClick={(event) => handleNavigate(event, contactHref)} className="dajem-dock-item"><Mail className="h-5 w-5" /><span>Contact</span></a>
        </div>
      </nav>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
