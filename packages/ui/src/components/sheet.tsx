"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  side?: "right" | "left";
  widthClassName?: string;
  children: React.ReactNode;
}

export function Sheet({
  isOpen,
  onClose,
  title,
  side = "right",
  widthClassName = "max-w-xl",
  children,
}: SheetProps) {
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
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
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute top-0 h-full w-full bg-background shadow-2xl border-border border-l p-6 sm:w-[32rem] overflow-y-auto animate-in duration-300",
          widthClassName,
          side === "right" ? "right-0 slide-in-from-right" : "left-0 border-r slide-in-from-left border-l-0",
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {title && (
          <div className="mb-5 pr-8">
            <h2 className="text-xl font-semibold tracking-tight text-primary dark:text-foreground">
              {title}
            </h2>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
