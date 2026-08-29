"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

interface HeroSlideshowProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
  slides: Array<{
    src: string;
    position?: string;
    label?: string;
  }>;
}

export function HeroSlideshow({
  children,
  className,
  contentClassName,
  overlayClassName,
  slides,
}: HeroSlideshowProps) {
  const [activeSlide, setActiveSlide] = React.useState(0);
  const hasMultipleSlides = slides.length > 1;

  React.useEffect(() => {
    if (!hasMultipleSlides) return;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, [hasMultipleSlides, slides.length]);

  React.useEffect(() => {
    if (activeSlide >= slides.length) {
      setActiveSlide(0);
    }
  }, [activeSlide, slides.length]);

  const selectPreviousSlide = () => {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  };

  const selectNextSlide = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
  };

  return (
    <section
      className={cn("relative isolate overflow-hidden", className)}
      aria-roledescription="carousel"
      aria-label="Featured DAJEM service imagery"
    >
      <div className="absolute inset-0 -z-30 bg-slate-950/12" />
      {slides.map((slide, index) => (
        <div
          key={`${slide.src}-${index}`}
          className={cn(
            "dajem-hero-slide-frame absolute inset-0 -z-20 overflow-hidden",
            index === activeSlide ? "is-active" : "pointer-events-none",
          )}
          aria-hidden={index !== activeSlide}
        >
          <img
            alt=""
            aria-hidden="true"
            src={slide.src}
            className={cn("dajem-hero-slide-image h-full w-full object-cover", index === activeSlide && "is-active")}
            style={{ objectPosition: slide.position ?? "center" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.34),rgba(2,6,23,0.08)_62%,rgba(2,6,23,0.2)),linear-gradient(180deg,rgba(15,23,42,0.05),rgba(15,23,42,0.36))]" />
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
      {hasMultipleSlides && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full border border-white/25 bg-slate-950/42 p-1.5 text-white shadow-lg backdrop-blur-md sm:bottom-6 sm:right-6">
          <button
            type="button"
            aria-label="Show previous image"
            onClick={selectPreviousSlide}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5 px-1" aria-label={`Image ${activeSlide + 1} of ${slides.length}`}>
            {slides.map((slide, index) => (
              <button
                key={`slide-indicator-${slide.src}-${index}`}
                type="button"
                aria-label={slide.label ? `Show ${slide.label}` : `Show image ${index + 1}`}
                aria-current={index === activeSlide ? "true" : undefined}
                onClick={() => setActiveSlide(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
                  index === activeSlide ? "w-6 bg-white" : "w-1.5 bg-white/55 hover:bg-white/85",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Show next image"
            onClick={selectNextSlide}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
