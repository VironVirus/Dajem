"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, Boxes, CalendarDays, ChevronDown, Command, Egg, Grid2X2, House, Landmark,
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

type OpenMenu = "account" | "ecosystem" | "notifications" | null;

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
  const [notificationsReadAt, setNotificationsReadAt] = React.useState("");
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const { currentUser, cartCount, navigateToUrl, openAuthModal, logout, snapshot } = useDajem();

  React.useEffect(() => setCurrentOrigin(window.location.origin), []);

  React.useEffect(() => {
    if (!currentUser) {
      setNotificationsReadAt("");
      return;
    }
    setNotificationsReadAt(window.localStorage.getItem(`dajem-notifications-read-${currentUser.email}`) ?? "");
  }, [currentUser]);

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
  const notifications = currentUser ? snapshot.communicationLogs.slice(0, 8) : [];
  const readTimestamp = Date.parse(notificationsReadAt) || 0;
  const unreadNotifications = notifications.filter((notification) => Date.parse(notification.createdAt) > readTimestamp).length;

  const markNotificationsRead = () => {
    if (!currentUser) return;
    const readAt = new Date().toISOString();
    window.localStorage.setItem(`dajem-notifications-read-${currentUser.email}`, readAt);
    setNotificationsReadAt(readAt);
  };

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
      <header className="fixed inset-x-0 top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-2xl transition-colors dark:border-white/10 dark:bg-slate-950/80 lg:sticky">
        <div className="container mx-auto flex h-[4.5rem] items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href={currentApp?.url} onClick={(event) => currentApp?.url ? handleNavigate(event, currentApp.url) : undefined} className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md transition-transform duration-300 group-hover:scale-105 ring-1 ring-white/20", currentApp.surface)}><currentApp.icon className="h-5 w-5" /></span>
            <span className="min-w-0 max-w-[8.5rem] sm:max-w-none">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">DAJEM ecosystem</span>
              <span className="block truncate text-sm font-bold tracking-tight text-foreground sm:text-base group-hover:text-primary transition-colors">{currentApp.name}</span>
            </span>
          </a>

          <div ref={menuRef} className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="hidden items-center gap-2 lg:flex">
            <Button variant="outline" size="sm" onClick={() => setPaletteOpen(true)} className="h-9 gap-2 rounded-full border-border/60 bg-muted/40 px-3.5 text-xs font-semibold text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground">
              <Search className="h-3.5 w-3.5" /><span>Search DAJEM</span><kbd className="rounded border border-border/60 bg-background/60 px-1.5 py-0.5 text-[9px] font-bold">Ctrl K</kbd>
            </Button>
            <div className="relative">
              <Button size="sm" onClick={() => setOpenMenu((current) => current === "ecosystem" ? null : "ecosystem")} className="h-9 gap-2 rounded-full border border-border/60 bg-card px-4 text-xs font-semibold text-foreground shadow-sm hover:bg-accent/80 hover:text-accent-foreground dark:border-white/10 dark:bg-card/80" aria-expanded={openMenu === "ecosystem"} aria-haspopup="menu">
                <Boxes className="h-3.5 w-3.5 text-primary dark:text-blue-400" /> Ecosystem <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", openMenu === "ecosystem" && "rotate-180")} />
              </Button>
              <AnimatePresence>
                {openMenu === "ecosystem" && (
                  <motion.div role="menu" className="absolute right-0 top-full z-50 mt-3 w-[34rem] rounded-[1.5rem] border border-border/60 bg-background/95 p-3.5 shadow-2xl shadow-slate-950/15 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ type: "spring", stiffness: 420, damping: 30 }}>
                    <div className="mb-3 flex items-center justify-between px-2 pt-1"><div><p className="text-sm font-bold text-foreground">Choose a DAJEM company</p><p className="text-xs text-muted-foreground">One account. Shared records. Connected services.</p></div><Command className="h-4 w-4 text-muted-foreground" /></div>
                    <div className="grid grid-cols-2 gap-3">{apps.map((app) => <AppCard key={app.id} app={app} />)}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {showCartButton && <Button variant="outline" size="sm" onClick={onCartClick} className="h-9 gap-2 rounded-full border-border/60 bg-card px-3.5 text-xs font-semibold shadow-sm hover:bg-accent"><ShoppingCart className="h-3.5 w-3.5" /> Cart ({cartCount})</Button>}
            </div>
            {currentUser && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ""}`}
                  aria-expanded={openMenu === "notifications"}
                  onClick={() => setOpenMenu((current) => current === "notifications" ? null : "notifications")}
                  className="relative h-9 w-9 rounded-full border-border/60 bg-card shadow-sm hover:bg-accent"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-black leading-none text-white ring-2 ring-background">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </Button>
                <AnimatePresence>
                  {openMenu === "notifications" && (
                    <motion.div
                      role="menu"
                      className="fixed inset-x-4 top-[4.9rem] z-50 max-h-[70vh] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl dark:border-white/10 dark:bg-slate-950 sm:left-auto sm:right-4 sm:w-96 lg:absolute lg:inset-x-auto lg:right-0 lg:top-full lg:mt-3"
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between border-b px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-foreground">Notifications</p>
                          <p className="text-xs text-muted-foreground">Updates about your DAJEM activity</p>
                        </div>
                        {unreadNotifications > 0 && <button type="button" onClick={markNotificationsRead} className="text-xs font-bold text-primary hover:underline">Mark all read</button>}
                      </div>
                      <div className="max-h-[52vh] overflow-y-auto p-2">
                        {notifications.length === 0 ? (
                          <p className="px-3 py-8 text-center text-sm text-muted-foreground">Your activity updates will appear here.</p>
                        ) : notifications.map((notification) => {
                          const unread = Date.parse(notification.createdAt) > readTimestamp;
                          return (
                            <button
                              key={notification.id}
                              type="button"
                              onClick={() => { markNotificationsRead(); setOpenMenu(null); void navigateToUrl(`${dashboardHref}#notifications`); }}
                              className={cn("flex w-full gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-accent", unread && "bg-primary/5")}
                            >
                              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", unread ? "bg-primary" : "bg-muted-foreground/25")} />
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-bold text-foreground">{notification.subject}</span>
                                <span className="mt-0.5 block line-clamp-2 text-xs leading-relaxed text-muted-foreground">{notification.message}</span>
                                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{new Date(notification.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <button type="button" onClick={() => { markNotificationsRead(); setOpenMenu(null); void navigateToUrl(`${dashboardHref}#notifications`); }} className="w-full border-t px-4 py-3 text-sm font-bold text-primary hover:bg-accent">View notification centre</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              aria-label={currentUser ? "Open dashboard" : "Log in to open dashboard"}
              title={currentUser ? "Dashboard" : "Log in to open dashboard"}
              onClick={() => currentUser ? void navigateToUrl(dashboardHref) : openAuthModal("login")}
              className="h-9 w-9 rounded-full border-border/60 bg-card shadow-sm hover:bg-accent"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Button>
            <ThemeToggle className="hidden h-9 w-9 rounded-full border-border/60 bg-card shadow-sm sm:inline-flex" />
            {!currentUser ? (
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" onClick={() => openAuthModal("signup")} className="hidden h-9 rounded-full px-3 text-xs font-bold sm:inline-flex">Sign up</Button>
                <Button size="sm" onClick={() => openAuthModal("login")} className="sheen-glow h-9 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 sm:px-4">Log in</Button>
              </div>
            ) : (
              <div className="relative">
                <Button variant="outline" size="sm" onClick={() => setOpenMenu((current) => current === "account" ? null : "account")} className="h-9 gap-2 rounded-full border-border/60 bg-card px-2.5 text-xs font-semibold shadow-sm hover:bg-accent sm:px-3.5" aria-label="Open account menu" aria-expanded={openMenu === "account"} aria-haspopup="menu"><UserCircle2 className="h-4 w-4" /><span className="hidden lg:inline">{currentUser.name.split(" ")[0]}</span><ChevronDown className={cn("hidden h-3.5 w-3.5 transition-transform lg:block", openMenu === "account" && "rotate-180")} /></Button>
                <AnimatePresence>
                  {openMenu === "account" && (
                    <motion.div role="menu" className="absolute right-0 top-full z-50 mt-3 w-60 rounded-2xl border border-border/60 bg-background/95 p-2 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}>
                      <a href={dashboardHref} onClick={(event) => handleNavigate(event, dashboardHref, () => setOpenMenu(null))} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"><LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard</a>
                      {currentUser.role === "admin" && <a href={adminHref} onClick={(event) => handleNavigate(event, adminHref, () => setOpenMenu(null))} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Admin centre</a>}
                      <button type="button" onClick={() => { setOpenMenu(null); void logout(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-destructive hover:bg-destructive/8"><LogOut className="h-4 w-4" /> Sign out</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="h-[4.5rem] lg:hidden" aria-hidden="true" />

      <AnimatePresence>
        {mobileCompaniesOpen && (
          <motion.div className="fixed inset-x-4 bottom-[calc(5.9rem+env(safe-area-inset-bottom))] z-50 rounded-[1.5rem] border border-white/20 bg-background/96 p-3 shadow-2xl shadow-slate-950/25 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/96 lg:hidden" initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ type: "spring", stiffness: 420, damping: 30 }}>
            <div className="mb-3 flex items-center justify-between px-1"><div><p className="text-sm font-bold text-foreground">DAJEM ecosystem</p><p className="text-xs text-muted-foreground">Switch company without leaving your account.</p></div><button type="button" onClick={() => setMobileCompaniesOpen(false)} className="rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-accent">Close</button></div>
            <div className="grid grid-cols-2 gap-2">{apps.map((app) => <AppCard key={app.id} app={app} compact />)}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav aria-label="Primary DAJEM navigation" className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 rounded-[1.45rem] border border-white/40 bg-background/94 p-1.5 shadow-2xl shadow-slate-950/18 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/94 lg:hidden">
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
