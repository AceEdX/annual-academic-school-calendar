import { useState, useMemo, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { CalendarEvent, EventCategory, categoryLabels, categoryIcons } from "@/data/calendarData";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import MonthCalendar from "@/components/MonthCalendar";
import EventModal from "@/components/EventModal";
import EventLegend from "@/components/EventLegend";
import EventBadge from "@/components/EventBadge";
import { downloadCSV, downloadPrintableHTML } from "@/utils/calendarExport";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  FileText,
  Printer,
  RotateCcw,
  Calendar,
  GraduationCap,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface IndexProps {
  user: User;
  onSignOut: () => void;
}

const MONTHS = [
  { year: 2026, month: 2 }, // Mar 2026
  { year: 2026, month: 3 }, // Apr
  { year: 2026, month: 4 }, // May
  { year: 2026, month: 5 }, // Jun
  { year: 2026, month: 6 }, // Jul
  { year: 2026, month: 7 }, // Aug
  { year: 2026, month: 8 }, // Sep
  { year: 2026, month: 9 }, // Oct
  { year: 2026, month: 10 }, // Nov
  { year: 2026, month: 11 }, // Dec
  { year: 2027, month: 0 }, // Jan 2027
  { year: 2027, month: 1 }, // Feb
  { year: 2027, month: 2 }, // Mar 2027
];

const allCategories: EventCategory[] = [
  "holiday", "sports", "academic", "cultural", "club", "exam", "general",
];

export default function Index({ user, onSignOut }: IndexProps) {
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    resetToDefaults,
    getEventsForMonth,
  } = useCalendarEvents();

  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
  const [activeFilters, setActiveFilters] = useState<Set<EventCategory>>(
    new Set(allCategories)
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>("");
  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  const currentMonth = MONTHS[currentMonthIdx];

  const filteredEventsForMonth = useMemo(() => {
    const all = getEventsForMonth(currentMonth.year, currentMonth.month);
    return all.filter((e) => activeFilters.has(e.category));
  }, [currentMonth, getEventsForMonth, activeFilters]);

  const filteredEventsAll = useMemo(
    () => events.filter((e) => activeFilters.has(e.category)),
    [events, activeFilters]
  );

  const toggleFilter = useCallback((cat: EventCategory) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const handleDayClick = (dateStr: string) => {
    setDefaultDate(dateStr);
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setDefaultDate(event.date);
    setModalOpen(true);
  };

  const handleSave = (data: {
    title: string;
    date: string;
    category: EventCategory;
    description?: string;
  }) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
    } else {
      addEvent(data);
    }
  };

  const handlePrev = () => setCurrentMonthIdx((i) => Math.max(0, i - 1));
  const handleNext = () => setCurrentMonthIdx((i) => Math.min(MONTHS.length - 1, i + 1));

  // Stats
  const stats = useMemo(() => {
    const counts: Record<EventCategory, number> = {
      holiday: 0, sports: 0, academic: 0, cultural: 0, club: 0, exam: 0, general: 0,
    };
    events.forEach((e) => counts[e.category]++);
    return counts;
  }, [events]);

  // Upcoming events
  const upcomingEvents = useMemo(() => {
    const monthEvents = getEventsForMonth(currentMonth.year, currentMonth.month);
    return monthEvents
      .filter((e) => activeFilters.has(e.category))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8);
  }, [currentMonth, getEventsForMonth, activeFilters]);

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-accent-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                  School Annual Calendar
                </h1>
                <p className="text-primary-foreground/80 text-sm mt-0.5">
                  Academic Year 2026–27 • March 2026 to March 2027
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-primary-foreground/70 hidden sm:inline">
                {user.email}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditingEvent(null);
                  setDefaultDate("");
                  setModalOpen(true);
                }}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="gap-1.5">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => downloadCSV(events)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Download CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadPrintableHTML(events)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print Calendar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="secondary"
                size="sm"
                onClick={resetToDefaults}
                className="gap-1.5"
                title="Reset to default events"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onSignOut}
                className="gap-1.5"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats bar */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3 mb-6">
          {allCategories.map((cat) => (
            <div
              key={cat}
              className="bg-card rounded-lg border border-border p-2 sm:p-3 text-center"
            >
              <div className="text-lg sm:text-xl font-bold text-foreground">
                {stats[cat]}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                {categoryIcons[cat]} {categoryLabels[cat]}
              </div>
            </div>
          ))}
        </div>

        {/* Legend / Filters */}
        <div className="mb-4">
          <EventLegend activeFilters={activeFilters} onToggle={toggleFilter} />
        </div>

        {/* View toggle + Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("month")}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Month
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "year"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("year")}
            >
              <FileText className="w-4 h-4 inline mr-1" />
              Year View
            </button>
          </div>

          {viewMode === "month" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                disabled={currentMonthIdx === 0}
                className="h-8 w-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
                {new Date(currentMonth.year, currentMonth.month).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentMonthIdx === MONTHS.length - 1}
                className="h-8 w-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {viewMode === "month" ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main calendar */}
            <div className="lg:col-span-3">
              <MonthCalendar
                year={currentMonth.year}
                month={currentMonth.month}
                events={filteredEventsForMonth}
                onDayClick={handleDayClick}
                onEventClick={handleEventClick}
              />
            </div>

            {/* Sidebar - Events this month */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-4 sticky top-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-3">
                  Events This Month
                </h3>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No events this month with selected filters.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {upcomingEvents.map((evt) => (
                      <div key={evt.id} className="animate-slide-in">
                        <div className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wide">
                          {new Date(evt.date + "T00:00:00").toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                        <EventBadge event={evt} onClick={handleEventClick} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Year view - all months in a grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {MONTHS.map((m, idx) => {
              const monthEvents = getEventsForMonth(m.year, m.month).filter((e) =>
                activeFilters.has(e.category)
              );
              return (
                <div key={idx}>
                  <MonthCalendar
                    year={m.year}
                    month={m.month}
                    events={monthEvents}
                    onDayClick={handleDayClick}
                    onEventClick={handleEventClick}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground pb-8">
          <p>
            Click any date to add your school's custom events • Click any event to edit or delete •{" "}
            <button onClick={resetToDefaults} className="underline hover:text-foreground">
              Reset to defaults
            </button>
          </p>
          <p className="mt-1">
            📚 School Annual Calendar — Academic Year 2026–27
          </p>
        </footer>
      </main>

      {/* Event Modal */}
      <EventModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEvent(null);
        }}
        event={editingEvent}
        defaultDate={defaultDate}
        onSave={handleSave}
        onDelete={deleteEvent}
      />
    </div>
  );
}
