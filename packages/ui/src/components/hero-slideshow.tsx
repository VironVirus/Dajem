"use client";

import * as React from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
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
    actionLabel?: string;
    href?: string;
  }>;
}

const SLIDE_DURATION = 7000;

export function HeroSlideshow({
  children,
  className,
  contentClassName,
  overlayClassName,
  slides,
}: HeroSlideshowProps) {
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isManualPaused, setIsManualPaused] = React.useState(false);
  const touchStartXRef = React.useRef<number | null>(null);

  const hasMultipleSlides = slides.length > 1;
  const activeSlideContent = slides[activeSlide];
  const isPlaying = !isHovered && !isManualPaused && hasMultipleSlides;

  React.useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, SLIDE_DURATION);

    return () => window.clearInterval(timer);
  }, [isPlaying, slides.length, activeSlide]);

  React.useEffect(() => {
    if (activeSlide >= slides.length) {
      setActiveSlide(0);
    }
  }, [activeSlide, slides.length]);

  const selectPreviousSlide = React.useCallback(() => {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const selectNextSlide = React.useCallback(() => {
    setActiveSlide((current) => (current + 1) % slides.length);
  }, [slides.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - (e.changedTouches[0]?.clientX ?? 0);
    if (diff > 45) {
      selectNextSlide();
    } else if (diff < -45) {
      selectPreviousSlide();
    }
    touchStartXRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      selectPreviousSlide();
    } else if (e.key === "ArrowRight") {
      selectNextSlide();
    }
  };

  return (
    <section
      className={cn("relative isolate overflow-hidden select-none", className)}
      aria-roledescription="carousel"
      aria-label="Featured DAJEM service imagery"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Dim / Underlay */}
      <div className="absolute inset-0 -z-30 bg-slate-950/15" />

      {/* Cross-fading Slide Images with Ken Burns variations */}
      {slides.map((slide, index) => {
        const isActive = index === activeSlide;
        const kenBurnsClass =
          index % 3 === 0
            ? "dajem-kenburns-zoom"
            : index % 3 === 1
              ? "dajem-kenburns-pan-right"
              : "dajem-kenburns-pan-left";

        return (
          <div
            key={`${slide.src}-${index}`}
            className={cn(
              "dajem-hero-slide-frame absolute inset-0 -z-20 overflow-hidden",
              isActive ? "is-active opacity-100" : "opacity-0 pointer-events-none",
            )}
            aria-hidden={!isActive}
          >
            <img
              alt=""
              aria-hidden="true"
              src={slide.src}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              className={cn(
                "dajem-hero-slide-image h-full w-full object-cover",
                kenBurnsClass,
              )}
              style={{ objectPosition: slide.position ?? "center" }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.45),rgba(2,6,23,0.12)_55%,rgba(2,6,23,0.32)),linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.46))]" />
          </div>
        );
      })}

      {/* Adaptive Theme Background Layer */}
      <div
        className={cn(
          "absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(248,250,252,0.18),rgba(248,250,252,0.34),rgba(248,250,252,0.72))] dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.2),rgba(2,6,23,0.4),rgba(2,6,23,0.8))]",
          overlayClassName,
        )}
      />

      {/* Hero Children Content */}
      <div
        className={cn(
          "relative z-0",
          (activeSlideContent?.href || hasMultipleSlides) && "pb-14 sm:pb-16",
          contentClassName,
        )}
      >
        {children}
      </div>

      {/* Bottom Floating Navigation Controls */}
      {(activeSlideContent?.href || hasMultipleSlides) && (
        <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between gap-3 sm:inset-x-6 sm:bottom-6 pointer-events-none">
          {/* Active Slide Action Callout Pill */}
          {activeSlideContent?.href ? (
            <a
              href={activeSlideContent.href}
              className="group pointer-events-auto inline-flex min-h-10 max-w-[calc(100%-9rem)] items-center gap-2 rounded-full border border-white/35 bg-slate-950/90 px-4 py-2 text-xs font-bold text-white shadow-lg transition-transform duration-200 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:max-w-sm sm:text-sm mobile-tap-target"
            >
              <span className="truncate">
                {activeSlideContent.actionLabel ?? activeSlideContent.label ?? "Explore"}
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          ) : (
            <div />
          )}

          {/* Slideshow Progress & Controls Pill */}
          {hasMultipleSlides && (
            <div className="pointer-events-auto ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-background/95 p-1.5 text-foreground shadow-lg transition-all dark:border-white/15 dark:bg-slate-950/95 dark:text-white">
              {/* Prev Button */}
              <button
                type="button"
                aria-label="Show previous image"
                onClick={selectPreviousSlide}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:bg-foreground/10 hover:scale-105 active:scale-95 dark:hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Progress Indicators */}
              <div
                className="flex items-center gap-1.5 px-1.5"
                aria-label={`Image ${activeSlide + 1} of ${slides.length}`}
              >
                {slides.map((slide, index) => {
                  const isActive = index === activeSlide;

                  return (
                    <button
                      key={`slide-indicator-${slide.src}-${index}`}
                      type="button"
                      aria-label={slide.label ? `Show ${slide.label}` : `Show image ${index + 1}`}
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => setActiveSlide(index)}
                      className={cn(
                        "relative h-1.5 overflow-hidden rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isActive
                          ? "w-8 sm:w-11 bg-foreground/20 dark:bg-white/25"
                          : "w-2 bg-foreground/30 hover:bg-foreground/60 dark:bg-white/35 dark:hover:bg-white/70",
                      )}
                    >
                      {isActive && (
                        <span
                          key={`progress-fill-${activeSlide}-${isHovered}-${isManualPaused}`}
                          className="absolute inset-0 rounded-full bg-primary dark:bg-white origin-left"
                          style={{
                            animation: `slide-progress-fill ${SLIDE_DURATION}ms linear forwards`,
                            animationPlayState: isPlaying ? "running" : "paused",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                type="button"
                aria-label="Show next image"
                onClick={selectNextSlide}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:bg-foreground/10 hover:scale-105 active:scale-95 dark:hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Play/Pause Toggle */}
              <button
                type="button"
                aria-label={isManualPaused ? "Resume slideshow" : "Pause slideshow"}
                onClick={() => setIsManualPaused((v) => !v)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-foreground/10 dark:hover:text-white dark:hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {isManualPaused ? (
                  <Play className="h-3 w-3 fill-current ml-0.5" />
                ) : (
                  <Pause className="h-3 w-3 fill-current" />
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
