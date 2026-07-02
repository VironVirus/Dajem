"use client";

import * as React from "react";
import { cn } from "../lib/utils";

interface HeroSlideshowProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
  slides: Array<{
    src: string;
    position?: string;
  }>;
}

export function HeroSlideshow({
  children,
  className,
  contentClassName,
  overlayClassName,
  slides,
}: HeroSlideshowProps) {
  const slideIntervalSeconds = 7;
  const cycleDurationSeconds = Math.max(slides.length * slideIntervalSeconds, slideIntervalSeconds);

  return (
    <section className={cn("relative isolate overflow-hidden", className)}>
      <div className="absolute inset-0 -z-30 bg-slate-950/12" />
      {slides.map((slide, index) => (
        <div
          key={`${slide.src}-${index}`}
          className="dajem-hero-slide-frame absolute inset-0 -z-20 overflow-hidden"
          style={{
            animationDelay: `${index * slideIntervalSeconds}s`,
            animationDuration: `${cycleDurationSeconds}s`,
          }}
        >
          <img
            alt=""
            aria-hidden="true"
            src={slide.src}
            className="dajem-hero-slide-image h-full w-full object-cover"
            style={{
              objectPosition: slide.position ?? "center",
              animationDelay: `${index * slideIntervalSeconds}s`,
              animationDuration: `${cycleDurationSeconds}s`,
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_36%),linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.2))]" />
        </div>
      ))}
      <div
        className={cn(
          "absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(248,250,252,0.18),rgba(248,250,252,0.34),rgba(248,250,252,0.7))] dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.38),rgba(2,6,23,0.76))]",
          overlayClassName,
        )}
      />
      <div className="dajem-ambient-orb absolute -left-16 top-14 -z-10 h-48 w-48 rounded-full bg-white/30 blur-3xl dark:bg-cyan-400/10" />
      <div className="dajem-ambient-orb absolute -right-10 bottom-10 -z-10 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-400/12" style={{ animationDelay: "-4s" }} />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.32),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_32%)]" />
      <div className={cn("relative", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
