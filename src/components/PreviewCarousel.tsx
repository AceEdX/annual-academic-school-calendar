import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import previewCalendarMonth from "@/assets/preview-calendar-month.png";
import previewCalendarSeptember from "@/assets/preview-calendar-september.png";
import previewAddEvent from "@/assets/preview-add-event.png";
import previewYearOverview from "@/assets/preview-year-overview.png";
import previewTableList from "@/assets/preview-table-list.png";

const SCREENSHOTS = [
  {
    title: "Month Calendar View",
    desc: "Color-coded events on a clean calendar grid with category stats at a glance",
    img: previewCalendarMonth,
  },
  {
    title: "Events & Sidebar",
    desc: "Browse events month by month with a detailed sidebar listing all activities",
    img: previewCalendarSeptember,
  },
  {
    title: "Add & Edit Events",
    desc: "Easily add new events with title, date, category, and description",
    img: previewAddEvent,
  },
  {
    title: "Year Overview",
    desc: "All 13 months displayed in a compact grid — see the full academic year at once",
    img: previewYearOverview,
  },
  {
    title: "Table / List View",
    desc: "View all events in a sortable table with date, category, and description",
    img: previewTableList,
  },
];

const INTERVAL_MS = 4000;

export default function PreviewCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  }, []);

  const goNext = useCallback(() => {
    goToSlide((currentSlide + 1) % SCREENSHOTS.length);
  }, [currentSlide, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide(currentSlide === 0 ? SCREENSHOTS.length - 1 : currentSlide - 1);
  }, [currentSlide, goToSlide]);

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return;

    const tick = 50; // update progress every 50ms
    const steps = INTERVAL_MS / tick;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setProgress((step / steps) * 100);
      if (step >= steps) {
        setCurrentSlide((prev) => (prev + 1) % SCREENSHOTS.length);
        step = 0;
        setProgress(0);
      }
    }, tick);

    return () => clearInterval(interval);
  }, [isPaused, currentSlide]);

  // Reset progress when slide changes manually
  useEffect(() => {
    setProgress(0);
  }, [currentSlide]);

  return (
    <section className="py-12 sm:py-16 bg-muted/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-center text-foreground mb-8">
          Preview the Calendar
        </h2>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
            {/* Image container with crossfade */}
            <div className="aspect-video relative">
              {SCREENSHOTS.map((shot, i) => (
                <img
                  key={i}
                  src={shot.img}
                  alt={shot.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                    i === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                />
              ))}
              {/* Caption overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-6 z-20">
                <h3 className="font-display text-xl font-bold text-primary-foreground">
                  {SCREENSHOTS[currentSlide].title}
                </h3>
                <p className="text-primary-foreground/80 text-sm mt-1">
                  {SCREENSHOTS[currentSlide].desc}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-border">
              <div
                className="h-full bg-primary transition-[width] duration-[50ms] ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="outline" size="icon" onClick={goPrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-2">
              {SCREENSHOTS.map((_, i) => (
                <button
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === currentSlide ? "bg-primary" : "bg-border"
                  }`}
                  onClick={() => goToSlide(i)}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={goNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
