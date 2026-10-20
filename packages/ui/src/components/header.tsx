"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Boxes,
  Building,
  Calculator,
  ChevronDown,
  Command,
  Compass,
  Egg,
  Grid2X2,
  Headphones,
  House,
  Landmark,
  LayoutDashboard,
  LogOut,
  Map,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  UserCircle2,
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
  landing: {
    icon: Landmark,
    label: "Group Hub",
    tag: "GROUP",
    color: "text-amber-500 dark:text-amber-400",
    surface: "from-slate-950 via-slate-900 to-slate-800 text-white border-amber-500/25",
    accentColor: "text-amber-500",
    badgeStyle: "bg-slate-900/10 text-slate-900 border-slate-900/20 dark:bg-white/10 dark:text-white dark:border-white/20",
    description: "Corporate strategy, directory and group governance",
  },
  survey: {
    icon: Map,
    label: "Orbital",
    tag: "ORBITAL",
    color: "text-cyan-500 dark:text-cyan-300",
    surface: "from-cyan-950 via-sky-900 to-blue-950 text-white border-cyan-500/25",
    accentColor: "text-cyan-400",
    badgeStyle: "bg-cyan-500/15 text-cyan-700 border-cyan-500/30 dark:bg-cyan-500/20 dark:text-cyan-300",
    description: "Surveying, cadastral mapping, and engineering surveys",
  },
  poultry: {
    icon: Egg,
    label: "Farms",
    tag: "FARMS",
    color: "text-emerald-500 dark:text-emerald-300",
    surface: "from-emerald-950 via-teal-900 to-slate-950 text-white border-emerald-500/25",
    accentColor: "text-emerald-400",
    badgeStyle: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300",
    description: "Livestock, poultry, farm produce, and cut-order studio",
  },
  "real-estate": {
    icon: House,
    label: "Homes",
    tag: "HOMES",
    color: "text-blue-500 dark:text-blue-300",
    surface: "from-blue-950 via-indigo-950 to-slate-950 text-white border-blue-500/25",
    accentColor: "text-blue-400",
    badgeStyle: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300",
    description: "Homes, luxury short-lets, and property management",
  },
} as const;

export function Header({ activeApp, onCartClick }: HeaderProps) {
  const [currentOrigin, setCurrentOrigin] = React.useState<string | undefined>(undefined);
  const [openMenu, setOpenMenu] = React.useState<OpenMenu>(null);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [mobileCompaniesOpen, setMobileCompaniesOpen] = React.useState(false);
  const [notificationsReadAt, setNotificationsReadAt] = React.useState("");
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const { currentUser, cartCount, navigateToUrl, openAuthModal, logout, snapshot } = useDajem();
  const logoUrl = snapshot.brandLogoUrl || "/images/dajem-logo.jpg";

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
  const adminHref = currentOrigin ? new URL("/admin", currentOrigin).toString() : "/admin";
  const farmsHref = currentOrigin ? new URL("/farms", currentOrigin).toString() : "/farms";
  const homesHref = currentOrigin ? new URL("/properties", currentOrigin).toString() : "/properties";
  const surveyHref = currentOrigin ? new URL("/survey", currentOrigin).toString() : "/survey";
  const supportHref = currentOrigin ? new URL("/support", currentOrigin).toString() : "/support";
  const groupHref = apps.find((app) => app.id === "landing")?.url ?? "/";
  const showCartButton = Boolean(activeApp === "poultry" && currentUser && onCartClick);
  const notifications = currentUser
    ? snapshot.communicationLogs.filter((log) => log.userEmail?.trim().toLowerCase() === currentUser.email.trim().toLowerCase()).slice(0, 8)
    : [];
  const readTimestamp = Date.parse(notificationsReadAt) || 0;
  const unreadNotifications = notifications.filter((notification) => Date.parse(notification.createdAt) > readTimestamp).length;

  const markNotificationsRead = () => {
    if (!currentUser) return;
    const readAt = new Date().toISOString();
    window.localStorage.setItem(`dajem-notifications-read-${currentUser.email}`, readAt);
    setNotificationsReadAt(readAt);
  };

  const handleNavigate = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string, afterNavigate?: () => void) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      afterNavigate?.();
      void navigateToUrl(href);
    },
    [navigateToUrl],
  );

  const AppCard = ({ app, compact = false }: { app: (typeof apps)[number]; compact?: boolean }) => (
    <a
      href={app.url}
      onClick={(event) =>
        handleNavigate(event, app.url, () => {
          setOpenMenu(null);
          setMobileCompaniesOpen(false);
        })
      }
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br p-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
        app.surface,
        compact && "p-3.5",
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_40%)]" />
      <div className="relative flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm shadow-sm transition-transform group-hover:scale-105">
          <app.icon className="h-5 w-5 drop-shadow-sm" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="block text-sm font-extrabold tracking-tight">{app.label}</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider text-white">
              {app.tag}
            </span>
          </span>
          {!compact && <span className="mt-1 block text-xs leading-relaxed text-white/80">{app.description}</span>}
        </span>
      </div>
    </a>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 w-full border-b border-border/50 bg-background/85 backdrop-blur-2xl transition-colors dark:border-white/10 dark:bg-slate-950/85 lg:sticky">
        <div className="container mx-auto flex h-[4.5rem] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Mark with Monogram Crest */}
          <a
            href={currentApp?.url}
            onClick={(event) => (currentApp?.url ? handleNavigate(event, currentApp.url) : undefined)}
            className="group flex items-center gap-3"
            aria-label={`${currentApp.name} home`}
          >
            <span className="flex h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-slate-950 shadow-md shadow-slate-950/15 ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-105">
              <img src={logoUrl} alt="DAJEM Group" className="h-full w-full object-cover" />
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">
                  DAJEM
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                    currentApp.badgeStyle,
                  )}
                >
                  {currentApp.tag}
                </span>
              </div>
              <span className="hidden text-[10px] font-semibold tracking-tight text-muted-foreground sm:block">
                {currentApp.name}
              </span>
            </div>
          </a>

          {/* Desktop Direct Links & Controls */}
          <div ref={menuRef} className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <div className="hidden items-center gap-2 lg:flex">
              {/* Quick Search */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaletteOpen(true)}
                className="h-9 gap-2 rounded-full border-border/60 bg-muted/40 px-3.5 text-xs font-semibold text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search DAJEM</span>
                <kbd className="rounded border border-border/60 bg-background/70 px-1.5 py-0.5 text-[9px] font-bold">
                  Ctrl K
                </kbd>
              </Button>

              {/* Direct Subsidiary Quick Switcher Links on Desktop */}
              <nav aria-label="Ecosystem quick switcher" className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/30 p-1">
                <a
                  href={groupHref}
                  onClick={(event) => handleNavigate(event, groupHref)}
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold transition-all",
                    activeApp === "landing"
                      ? "bg-background text-foreground shadow-sm dark:bg-card"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Landmark className="h-3 w-3 text-amber-500" />
                  <span>Group</span>
                </a>
                <a
                  href={surveyHref}
                  onClick={(event) => handleNavigate(event, surveyHref)}
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold transition-all",
                    activeApp === "survey"
                      ? "bg-background text-cyan-700 shadow-sm dark:bg-card dark:text-cyan-400"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Map className="h-3 w-3 text-cyan-500" />
                  <span>Orbital</span>
                </a>
                <a
                  href={farmsHref}
                  onClick={(event) => handleNavigate(event, farmsHref)}
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold transition-all",
                    activeApp === "poultry"
                      ? "bg-background text-emerald-700 shadow-sm dark:bg-card dark:text-emerald-400"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Egg className="h-3 w-3 text-emerald-500" />
                  <span>Farms</span>
                </a>
                <a
                  href={homesHref}
                  onClick={(event) => handleNavigate(event, homesHref)}
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold transition-all",
                    activeApp === "real-estate"
                      ? "bg-background text-blue-700 shadow-sm dark:bg-card dark:text-blue-400"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <House className="h-3 w-3 text-blue-500" />
                  <span>Homes</span>
                </a>
              </nav>

              {/* Ecosystem Mega Popover */}
              <div className="relative">
                <Button
                  size="sm"
                  onClick={() => setOpenMenu((current) => (current === "ecosystem" ? null : "ecosystem"))}
                  className="h-9 gap-1.5 rounded-full border border-border/60 bg-card px-3.5 text-xs font-semibold text-foreground shadow-sm hover:bg-accent/80 hover:text-accent-foreground dark:border-white/10 dark:bg-card/80"
                  aria-expanded={openMenu === "ecosystem"}
                  aria-haspopup="menu"
                >
                  <Boxes className="h-3.5 w-3.5 text-primary" />
                  <span>Ecosystem</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                      openMenu === "ecosystem" && "rotate-180",
                    )}
                  />
                </Button>
                <AnimatePresence>
                  {openMenu === "ecosystem" && (
                    <motion.div
                      role="menu"
                      className="absolute right-0 top-full z-50 mt-3 w-[34rem] rounded-[1.6rem] border border-border/60 bg-background/95 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95"
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    >
                      <div className="mb-3.5 flex items-center justify-between px-2 pt-1">
                        <div>
                          <p className="text-sm font-bold text-foreground">DAJEM Corporate Ecosystem</p>
                          <p className="text-xs text-muted-foreground">Unified account, shared records, and connected services.</p>
                        </div>
                        <Command className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {apps.map((app) => (
                          <AppCard key={app.id} app={app} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart Button */}
              {showCartButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCartClick}
                  className="sheen-glow h-9 gap-2 rounded-full border-emerald-500/40 bg-emerald-500/10 px-4 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-500/20 dark:text-emerald-300"
                >
                  <ShoppingCart className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Cart</span>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-black text-white">
                    {cartCount}
                  </span>
                </Button>
              )}
            </div>

            {/* Notifications Pill */}
            {currentUser && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ""}`}
                  aria-expanded={openMenu === "notifications"}
                  onClick={() => setOpenMenu((current) => (current === "notifications" ? null : "notifications"))}
                  className="relative h-9 w-9 rounded-full border-border/60 bg-card shadow-sm hover:bg-accent"
                >
                  <Bell className="h-4 w-4 text-foreground" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-black leading-none text-white ring-2 ring-background animate-pulse">
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
                        {unreadNotifications > 0 && (
                          <button
                            type="button"
                            onClick={markNotificationsRead}
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[52vh] overflow-y-auto p-2">
                        {notifications.length === 0 ? (
                          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                            Your activity updates will appear here.
                          </p>
                        ) : (
                          notifications.map((notification) => {
                            const unread = Date.parse(notification.createdAt) > readTimestamp;
                            return (
                              <button
                                key={notification.id}
                                type="button"
                                onClick={() => {
                                  markNotificationsRead();
                                  setOpenMenu(null);
                                  void navigateToUrl(`${dashboardHref}#notifications`);
                                }}
                                className={cn(
                                  "flex w-full gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-accent",
                                  unread && "bg-primary/5",
                                )}
                              >
                                <span
                                  className={cn(
                                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                                    unread ? "bg-primary" : "bg-muted-foreground/25",
                                  )}
                                />
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-bold text-foreground">
                                    {notification.subject}
                                  </span>
                                  <span className="mt-0.5 block line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                    {notification.message}
                                  </span>
                                  <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    {new Date(notification.createdAt).toLocaleDateString("en-NG", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </span>
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          markNotificationsRead();
                          setOpenMenu(null);
                          void navigateToUrl(`${dashboardHref}#notifications`);
                        }}
                        className="w-full border-t px-4 py-3 text-sm font-bold text-primary hover:bg-accent"
                      >
                        View notification centre
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Support */}
            <a
              href={supportHref}
              onClick={(event) => handleNavigate(event, supportHref)}
              aria-label="Customer support"
              title="Customer support"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card text-foreground shadow-sm transition hover:bg-accent hover:text-primary"
            >
              <Headphones className="h-4 w-4" />
            </a>

            {/* Theme Toggle */}
            <ThemeToggle className="h-9 w-9 rounded-full border-border/60 bg-card shadow-sm" />

            {/* Auth / Account Profile */}
            {!currentUser ? (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAuthModal("signup")}
                  className="hidden h-9 rounded-full px-3.5 text-xs font-bold sm:inline-flex"
                >
                  Sign up
                </Button>
                <Button
                  size="sm"
                  onClick={() => openAuthModal("login")}
                  className="sheen-glow h-9 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
                >
                  Log in
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenMenu((current) => (current === "account" ? null : "account"))}
                  className="h-9 gap-2 rounded-full border-border/60 bg-card px-2.5 text-xs font-semibold shadow-sm hover:bg-accent sm:px-3.5"
                  aria-label="Open account menu"
                  aria-expanded={openMenu === "account"}
                  aria-haspopup="menu"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-black text-primary">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden font-bold lg:inline">{currentUser.name.split(" ")[0]}</span>
                  <ChevronDown
                    className={cn(
                      "hidden h-3.5 w-3.5 transition-transform lg:block",
                      openMenu === "account" && "rotate-180",
                    )}
                  />
                </Button>
                <AnimatePresence>
                  {openMenu === "account" && (
                    <motion.div
                      role="menu"
                      className="absolute right-0 top-full z-50 mt-3 w-64 rounded-2xl border border-border/60 bg-background/95 p-2 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95"
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    >
                      <div className="border-b border-border/50 px-3 py-2.5 mb-1">
                        <p className="text-xs font-bold text-foreground truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
                        <span className="mt-1.5 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase text-primary">
                          {currentUser.role === "admin" ? "Enterprise Admin" : "Verified Client"}
                        </span>
                      </div>
                      <a
                        href={dashboardHref}
                        onClick={(event) => handleNavigate(event, dashboardHref, () => setOpenMenu(null))}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                      >
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                        <span>Client Dashboard</span>
                      </a>
                      {currentUser.role === "admin" && (
                        <a
                          href={adminHref}
                          onClick={(event) => handleNavigate(event, adminHref, () => setOpenMenu(null))}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                        >
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          <span>Admin Centre</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          void logout();
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Spacer for fixed header on mobile */}
      <div className="h-[4.5rem] lg:hidden" aria-hidden="true" />

      {/* Mobile Companies Bottom Sheet */}
      <AnimatePresence>
        {mobileCompaniesOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileCompaniesOpen(false)}
            />
            <motion.div
              className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom,12px))] z-50 mx-auto max-w-lg rounded-[2rem] border border-white/20 bg-background/96 p-4 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/96 lg:hidden"
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              {/* iOS drag pill */}
              <div className="mx-auto -mt-1 mb-3 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
              <div className="mb-3.5 flex items-center justify-between px-1">
                <div>
                  <p className="text-base font-extrabold text-foreground">DAJEM Ecosystem</p>
                  <p className="text-xs text-muted-foreground">Switch companies seamlessly across one account.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileCompaniesOpen(false)}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {apps.map((app) => (
                  <AppCard key={app.id} app={app} compact />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modern Mobile Bottom Navigation Dock - Native App Floating Island */}
      <nav
        aria-label="Primary DAJEM mobile navigation"
        className="dajem-dock-bar fixed inset-x-3 bottom-[max(0.65rem,env(safe-area-inset-bottom))] z-50 mx-auto max-w-md rounded-[2.2rem] p-1.5 lg:hidden"
      >
        <div className="grid grid-cols-5 gap-1">
          {/* Tab 1: Home */}
          <a
            href={groupHref}
            onClick={(event) => handleNavigate(event, groupHref)}
            className={cn("dajem-dock-item", activeApp === "landing" && "is-active")}
            aria-label="Home"
          >
            <span className="dock-icon-wrapper">
              <Landmark className="h-5 w-5" />
            </span>
            <span>Home</span>
          </a>

          {/* Tab 2: Companies / Ecosystem Switcher */}
          <button
            type="button"
            onClick={() => setMobileCompaniesOpen((current) => !current)}
            className={cn("dajem-dock-item", mobileCompaniesOpen && "is-active")}
            aria-label="Ecosystem companies"
          >
            <span className="dock-icon-wrapper">
              <Grid2X2 className="h-5 w-5" />
            </span>
            <span>Ecosystem</span>
          </button>

          {/* Tab 3: Contextual Subsidiary Action / Catalog */}
          {activeApp === "poultry" ? (
            showCartButton && cartCount > 0 ? (
              <button
                type="button"
                onClick={onCartClick}
                className="dajem-dock-item text-emerald-600 dark:text-emerald-400"
                aria-label={`Cart with ${cartCount} items`}
              >
                <span className="dock-icon-wrapper relative bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-black text-white">
                    {cartCount}
                  </span>
                </span>
                <span>Cart</span>
              </button>
            ) : (
              <a
                href={farmsHref}
                onClick={(event) => handleNavigate(event, `${farmsHref}/shop`)}
                className="dajem-dock-item"
                aria-label="Farm Shop"
              >
                <span className="dock-icon-wrapper">
                  <Store className="h-5 w-5" />
                </span>
                <span>Shop</span>
              </a>
            )
          ) : activeApp === "real-estate" ? (
            <a
              href={`${homesHref}/listings`}
              onClick={(event) => handleNavigate(event, `${homesHref}/listings`)}
              className="dajem-dock-item"
              aria-label="Property Listings"
            >
              <span className="dock-icon-wrapper">
                <Building className="h-5 w-5" />
              </span>
              <span>Listings</span>
            </a>
          ) : activeApp === "survey" ? (
            <a
              href={`${surveyHref}/estimate`}
              onClick={(event) => handleNavigate(event, `${surveyHref}/estimate`)}
              className="dajem-dock-item"
              aria-label="Survey Estimator"
            >
              <span className="dock-icon-wrapper">
                <Calculator className="h-5 w-5" />
              </span>
              <span>Estimate</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="dajem-dock-item"
              aria-label="Search"
            >
              <span className="dock-icon-wrapper">
                <Search className="h-5 w-5" />
              </span>
              <span>Search</span>
            </button>
          )}

          {/* Tab 4: Dashboard */}
          {currentUser ? (
            <a
              href={dashboardHref}
              onClick={(event) => handleNavigate(event, dashboardHref)}
              className="dajem-dock-item"
              aria-label="Dashboard"
            >
              <span className="dock-icon-wrapper">
                <LayoutDashboard className="h-5 w-5" />
              </span>
              <span>Dashboard</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="dajem-dock-item"
              aria-label="Log in to dashboard"
            >
              <span className="dock-icon-wrapper">
                <LayoutDashboard className="h-5 w-5" />
              </span>
              <span>Dashboard</span>
            </button>
          )}

          {/* Tab 5: Account / Support */}
          {currentUser ? (
            <button
              type="button"
              onClick={() => setOpenMenu("account")}
              className="dajem-dock-item"
              aria-label="Account profile"
            >
              <span className="dock-icon-wrapper">
                <UserCircle2 className="h-5 w-5" />
              </span>
              <span>Account</span>
            </button>
          ) : (
            <a
              href={supportHref}
              onClick={(event) => handleNavigate(event, supportHref)}
              className="dajem-dock-item"
              aria-label="Support"
            >
              <span className="dock-icon-wrapper">
                <Headphones className="h-5 w-5" />
              </span>
              <span>Support</span>
            </a>
          )}
        </div>
      </nav>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}

