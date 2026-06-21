"use client";

import * as React from "react";
import {
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

export function Header({ activeApp, onCartClick }: HeaderProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentOrigin, setCurrentOrigin] = React.useState<string | undefined>(undefined);
  const { currentUser, cartCount, openAuthModal, logout } = useDajem();

  React.useEffect(() => {
    setCurrentOrigin(window.location.origin);
  }, []);

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

  // App-specific internal navigation links
  const getNavLinks = () => {
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
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2">
          {currentApp && (
            <currentApp.icon className={cn("h-6 w-6 transition-transform hover:scale-110", currentApp.color)} />
          )}
          <a
            href={currentApp?.url}
            className="text-lg font-bold tracking-tight text-primary dark:text-foreground hover:opacity-90 flex items-center gap-1.5"
          >
            <span>{currentApp?.name}</span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary dark:hover:text-foreground transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Right Side CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {showCartButton && (
            <Button variant="outline" size="sm" className="gap-2" onClick={onCartClick}>
              <ShoppingCart className="h-4 w-4" />
              Cart ({cartCount})
            </Button>
          )}
          {!currentUser ? (
            <>
              <Button variant="outline" size="sm" onClick={() => openAuthModal("login")}>
                Login
              </Button>
              <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => openAuthModal("signup")}>
                Sign Up
              </Button>
            </>
          ) : (
            <div className="relative group">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1">
                <UserCircle2 className="h-4 w-4" />
                <span>{currentUser.name.split(" ")[0]}</span>
                <ChevronDownIcon />
              </Button>
              <div className="absolute right-0 top-full mt-2 w-56 rounded-md border border-border bg-popover text-popover-foreground shadow-lg hidden group-hover:block transition-all animate-in fade-in slide-in-from-top-1">
                <div className="p-1">
                  <a href={dashboardHref} className="flex items-center gap-2 rounded-sm px-2.5 py-2 text-sm hover:bg-accent transition-colors">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    Dashboard
                  </a>
                  {currentUser.role === "admin" && (
                    <a href={adminHref} className="flex items-center gap-2 rounded-sm px-2.5 py-2 text-sm hover:bg-accent transition-colors">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Admin Portal
                    </a>
                  )}
                  <button
                    className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm hover:bg-accent transition-colors"
                    onClick={() => void logout()}
                  >
                    <LogOut className="h-4 w-4 text-destructive" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="relative group">
            <Button size="sm" className="bg-primary hover:bg-primary/95 text-white flex items-center gap-1">
              <span>Go to Company...</span>
              <ChevronDownIcon />
            </Button>
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-56 rounded-md border border-border bg-popover text-popover-foreground shadow-lg hidden group-hover:block transition-all animate-in fade-in slide-in-from-top-1">
              <div className="p-1">
                {apps.map((app) => (
                  <a
                    key={app.id}
                    href={app.url}
                    className={cn(
                      "flex items-center gap-2 rounded-sm px-2.5 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                      app.id === activeApp && "bg-accent/50 font-semibold"
                    )}
                  >
                    <app.icon className={cn("h-4 w-4", app.color)} />
                    <span>{app.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Hamburger Menu & Theme Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="grid gap-2 border-t border-border/60 pt-4">
            {!currentUser ? (
              <>
                <Button variant="outline" onClick={() => openAuthModal("login")}>
                  Login
                </Button>
                <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => openAuthModal("signup")}>
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                {showCartButton && (
                  <Button variant="outline" onClick={onCartClick}>
                    Cart ({cartCount})
                  </Button>
                )}
                <a href={dashboardHref}>
                  <Button className="w-full justify-start" variant="outline">
                    Dashboard
                  </Button>
                </a>
                {currentUser.role === "admin" && (
                  <a href={adminHref}>
                    <Button className="w-full justify-start" variant="outline">
                      Admin Portal
                    </Button>
                  </a>
                )}
                <Button variant="destructive" onClick={() => void logout()}>
                  Sign Out
                </Button>
              </>
            )}
          </div>

          <div className="border-t border-border/60 pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Dajem Companies
            </p>
            <div className="grid grid-cols-1 gap-2">
              {apps.map((app) => (
                <a
                  key={app.id}
                  href={app.url}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                    app.id === activeApp && "bg-accent/50 font-semibold"
                  )}
                >
                  <app.icon className={cn("h-4 w-4", app.color)} />
                  <span>{app.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 opacity-80"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
