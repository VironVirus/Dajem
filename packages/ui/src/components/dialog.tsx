"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />
      {/* Modal Dialog Content */}
      <div
        className={cn(
          "relative z-50 w-full max-w-lg rounded-xl border bg-card text-card-foreground shadow-2xl p-6 transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300",
          "border-border bg-background"
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {title && (
          <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
            <h2 className="text-lg font-semibold leading-none tracking-tight text-primary dark:text-foreground">
              {title}
            </h2>
          </div>
        )}

        <div className="grid gap-4 py-4">{children}</div>
      </div>
    </div>
  );
}
