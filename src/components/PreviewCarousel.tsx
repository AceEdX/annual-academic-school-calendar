import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import previewMonth from "@/assets/preview-2027-month.jpg";
import previewPrep from "@/assets/preview-2027-prep.jpg";
import previewYear from "@/assets/preview-2027-year.jpg";
import previewEdit from "@/assets/preview-2027-edit.jpg";
import previewCategory from "@/assets/preview-2027-category.jpg";

const SCREENSHOTS = [
  {
    title: "Academic Year 2027–28",
    desc: "March 2027 to May 2028 with every date, Sunday, holiday and school event",
    img: previewMonth,
  },
  {
    title: "Preparation Months",
    desc: "October 2026 to February 2027 to plan and get ready for the new session",
    img: previewPrep,
  },
  {
    title: "Year View",
    desc: "All 20 months from October 2026 to May 2028 at a glance",
    img: previewYear,
  },
  {
    title: "Add & Edit Events",
    desc: "Edit any event with its details already filled in, or add your own school events",
    img: previewEdit,
  },
  {
    title: "Events by Category",
    desc: "Tap a category to see and edit every holiday, exam, sport and club activity",
    img: previewCategory,
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
