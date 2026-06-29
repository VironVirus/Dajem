"use client";

import * as React from "react";
import {
  ChevronDown,
  LayoutDashboard,
  Landmark,
  Egg,
  Home as HomeIcon,
  LogOut,
  Map,
  Menu,
  ShieldCheck,
  ShoppingCart,
  UserCircle2,
  X,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./button";
import { cn } from "../lib/utils";
import { useDajem } from "./dajem-provider";
import { getCompanyLinks } from "../lib/store";

interface HeaderProps {
  activeApp: "landing" | "poultry" | "real-estate" | "survey";
  onCartClick?: () => void;
}

type DesktopMenu = null | "account" | "company";
type MobileSection = "nav" | "account" | "companies";

export function Header({ activeApp, onCartClick }: HeaderProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentOrigin, setCurrentOrigin] = React.useState<string | undefined>(undefined);
  const [desktopMenu, setDesktopMenu] = React.useState<DesktopMenu>(null);
  const [mobileSection, setMobileSection] = React.useState<MobileSection>("nav");
  const desktopMenuRef = React.useRef<HTMLDivElement | null>(null);
  const { currentUser, cartCount, navigateToUrl, openAuthModal, logout } = useDajem();

  React.useEffect(() => {
    setCurrentOrigin(window.location.origin);
  }, []);

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!desktopMenuRef.current?.contains(event.target as Node)) {
        setDesktopMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDesktopMenu(null);
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const appVisuals = [
    {
      id: "landing",
      icon: Landmark,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "poultry",
      icon: Egg,
      color: "text-amber-500",
    },
    {
      id: "real-estate",
      icon: HomeIcon,
      color: "text-emerald-500",
    },
    {
      id: "survey",
      icon: Map,
      color: "text-cyan-500",
    },
  ] as const;

  const apps = getCompanyLinks(activeApp, currentOrigin).map((company) => {
    const visual = appVisuals.find((entry) => entry.id === company.id);

    return {
      ...company,
      icon: visual?.icon ?? Landmark,
      color: visual?.color ?? "text-primary",
    };
  });

  const currentApp = apps.find((app) => app.id === activeApp);
  const dashboardHref = `${currentApp?.url}/dashboard`;
  const adminHref = `${currentApp?.url}/admin`;
  const showCartButton = Boolean(activeApp === "poultry" && currentUser && onCartClick);

  const navLinks = (() => {
    switch (activeApp) {
      case "landing":
        return [
          { name: "About Us", href: "#about" },
          { name: "Companies", href: "#companies" },
          { name: "Global Contact", href: "#contact" },
        ];
      case "poultry":
        return [
          { name: "Products Catalog", href: "#catalog" },
          { name: "Why Us", href: "#why-us" },
          { name: "Bulk Orders", href: "#bulk-order" },
          { name: "Shared Cart", href: "#catalog" },
        ];
      case "real-estate":
        return [
          { name: "Property Listings", href: "#listings" },
          { name: "Property Form", href: "#submit-property" },
          { name: "Bidding Sheet", href: "#listings" },
        ];
      case "survey":
        return [
          { name: "Precision Services", href: "#services" },
          { name: "Plans Calculator", href: "#calculator" },
          { name: "Tracker Cards", href: "#quote" },
          { name: "Request Quote", href: "#quote" },
        ];
    }
  })();

  const closeMobileMenu = () => {
    setIsOpen(false);
    setMobileSection("nav");
  };

  const handleNavigate = React.useCallback((
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    afterNavigate?: () => void,
  ) => {
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) {
      return;
    }

    event.preventDefault();
    afterNavigate?.();
    void navigateToUrl(href);
  }, [navigateToUrl]);

  const DesktopDropdown = ({
    menu,
    label,
    children,
    tone = "primary",
  }: {
    menu: Exclude<DesktopMenu, null>;
    label: React.ReactNode;
    children: React.ReactNode;
    tone?: "primary" | "secondary";
  }) => (
    <div className="relative">
      <Button
        size="sm"
        variant={tone === "secondary" ? "outline" : "default"}
        className={cn(
          "flex items-center gap-1.5",
          tone === "primary" && "bg-primary/95 text-white hover:bg-primary",
          tone === "secondary" && "border-border/70 bg-white/65 backdrop-blur-md hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/15",
        )}
        aria-expanded={desktopMenu === menu}
        aria-haspopup="menu"
        onClick={() => setDesktopMenu((current) => (current === menu ? null : menu))}
      >
        {label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", desktopMenu === menu && "rotate-180")} />
      </Button>
      {desktopMenu === menu && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-white/45 bg-background/92 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/92">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/30 bg-background/72 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          {currentApp && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/35 bg-white/60 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
              <currentApp.icon className={cn("h-5 w-5 transition-transform hover:scale-110", currentApp.color)} />
            </div>
          )}
          <a
            href={currentApp?.url}
            onClick={(event) => currentApp?.url ? handleNavigate(event, currentApp.url) : undefined}
            className="flex min-w-0 items-center gap-1.5 text-base font-semibold tracking-tight text-primary hover:opacity-90 dark:text-foreground sm:text-lg"
          >
            <span className="truncate">{currentApp?.name}</span>
          </a>
        </div>

        <nav className="hidden items-center gap-2 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/70 hover:text-primary dark:hover:bg-white/10 dark:hover:text-foreground"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div ref={desktopMenuRef} className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          {showCartButton && (
            <Button variant="outline" size="sm" className="gap-2 border-border/70 bg-white/65 backdrop-blur-md hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/15" onClick={onCartClick}>
              <ShoppingCart className="h-4 w-4" />
              Cart ({cartCount})
            </Button>
          )}

          {!currentUser ? (
            <>
              <Button variant="outline" size="sm" className="border-border/70 bg-white/65 backdrop-blur-md hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/15" onClick={() => openAuthModal("login")}>
                Login
              </Button>
              <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => openAuthModal("signup")}>
                Sign Up
              </Button>
            </>
          ) : (
            <DesktopDropdown
              menu="account"
              tone="secondary"
              label={(
                <>
                  <UserCircle2 className="h-4 w-4" />
                  <span>{currentUser.name.split(" ")[0]}</span>
                </>
              )}
            >
              <a
                href={dashboardHref}
                onClick={(event) => handleNavigate(event, dashboardHref)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-accent transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-primary" />
                Dashboard
              </a>
              {currentUser.role === "admin" && (
                <a
                  href={adminHref}
                  onClick={(event) => handleNavigate(event, adminHref)}
                  className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-accent transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Admin Portal
                </a>
              )}
              <button
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
                onClick={() => void logout()}
              >
                <LogOut className="h-4 w-4 text-destructive" />
                Sign Out
              </button>
            </DesktopDropdown>
          )}

          <DesktopDropdown menu="company" label={<span>Go to Company</span>}>
            {apps.map((app) => (
              <a
                key={app.id}
                href={app.url}
                onClick={(event) => handleNavigate(event, app.url)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  app.id === activeApp && "bg-accent/60 font-semibold",
                )}
              >
                <app.icon className={cn("h-4 w-4", app.color)} />
                <span>{app.name}</span>
              </a>
            ))}
          </DesktopDropdown>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex items-center justify-center rounded-2xl border border-white/35 bg-white/60 p-2.5 text-muted-foreground shadow-sm backdrop-blur-lg transition-colors hover:bg-white/85 hover:text-primary dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:text-foreground"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 top-16 z-30 bg-slate-950/35 backdrop-blur-sm" onClick={closeMobileMenu} />
          <div className="absolute inset-x-0 top-16 z-40 mx-3 overflow-hidden rounded-[1.75rem] border border-white/35 bg-background/90 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/92">
            <div className="max-h-[calc(100vh-5.5rem)] overflow-y-auto px-4 pb-5 pt-4">
              <div className="mb-4 rounded-2xl border border-white/35 bg-white/60 p-4 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Now Viewing</p>
                <div className="mt-2 flex items-center gap-2">
                  {currentApp && <currentApp.icon className={cn("h-5 w-5", currentApp.color)} />}
                  <p className="font-semibold text-foreground">{currentApp?.name}</p>
                </div>
              </div>

              <MobileSectionButton
                label="Quick Links"
                isOpen={mobileSection === "nav"}
                onClick={() => setMobileSection((current) => (current === "nav" ? "companies" : "nav"))}
              />
              {mobileSection === "nav" && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className="rounded-2xl border border-white/30 bg-white/60 px-3 py-3 text-sm font-medium text-foreground shadow-sm backdrop-blur-lg transition-colors hover:bg-white/85 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              )}

              <MobileSectionButton
                label={currentUser ? "Account" : "Join or Login"}
                isOpen={mobileSection === "account"}
                onClick={() => setMobileSection((current) => (current === "account" ? "companies" : "account"))}
              />
              {mobileSection === "account" && (
                <div className="mb-4 grid gap-2">
                  {!currentUser ? (
                    <>
                      <Button variant="outline" className="justify-start border-border/70 bg-white/65 backdrop-blur-md hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/15" onClick={() => { closeMobileMenu(); openAuthModal("login"); }}>
                        Login
                      </Button>
                      <Button className="justify-start bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => { closeMobileMenu(); openAuthModal("signup"); }}>
                        Sign Up
                      </Button>
                    </>
                  ) : (
                    <>
                      {showCartButton && (
                        <Button variant="outline" className="justify-start border-border/70 bg-white/65 backdrop-blur-md hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/15" onClick={() => { closeMobileMenu(); onCartClick?.(); }}>
                          Cart ({cartCount})
                        </Button>
                      )}
                      <a href={dashboardHref} onClick={(event) => handleNavigate(event, dashboardHref, closeMobileMenu)}>
                        <Button className="w-full justify-start" variant="outline">
                          Dashboard
                        </Button>
                      </a>
                      {currentUser.role === "admin" && (
                        <a href={adminHref} onClick={(event) => handleNavigate(event, adminHref, closeMobileMenu)}>
                          <Button className="w-full justify-start" variant="outline">
                            Admin Portal
                          </Button>
                        </a>
                      )}
                      <Button variant="destructive" className="justify-start" onClick={() => { closeMobileMenu(); void logout(); }}>
                        Sign Out
                      </Button>
                    </>
                  )}
                </div>
              )}

              <MobileSectionButton
                label="Browse Companies"
                isOpen={mobileSection === "companies"}
                onClick={() => setMobileSection((current) => (current === "companies" ? "nav" : "companies"))}
              />
              {mobileSection === "companies" && (
                <div className="grid grid-cols-1 gap-2">
                  {apps.map((app) => (
                    <a
                      key={app.id}
                      href={app.url}
                      onClick={(event) => handleNavigate(event, app.url, closeMobileMenu)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border border-white/30 bg-white/60 px-3 py-3 text-sm shadow-sm backdrop-blur-lg transition-colors hover:bg-white/85 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
                        app.id === activeApp && "border-primary/30 bg-primary/10 font-semibold",
                      )}
                    >
                      <app.icon className={cn("h-4 w-4", app.color)} />
                      <span>{app.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileSectionButton({
  label,
  isOpen,
  onClick,
}: {
  label: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={onClick}
      className="mb-2 flex w-full items-center justify-between rounded-2xl border border-white/30 bg-white/60 px-4 py-3 text-left text-sm font-semibold shadow-sm backdrop-blur-lg transition-colors hover:bg-white/85 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
    >
      <span>{label}</span>
      <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
    </button>
  );
}
