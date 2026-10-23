import { useState, useMemo, useCallback } from "react";
import { CalendarEvent, EventCategory, categoryLabels, categoryIcons } from "@/data/calendarData";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import MonthCalendar from "@/components/MonthCalendar";
import EventModal from "@/components/EventModal";
import EventLegend from "@/components/EventLegend";
import EventBadge from "@/components/EventBadge";
import CategoryEventsPanel from "@/components/CategoryEventsPanel";
import MonthDownloadDialog, { PrintMode } from "@/components/MonthDownloadDialog";
import { downloadCSV } from "@/utils/calendarExport";
import { getCalendarMonths, MONTH_NAMES } from "@/utils/calendarRange";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import aceEdxLogo from "@/assets/Ace_EduX_Logo_3.png";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  FileText,
  Printer,
  RotateCcw,
  Calendar,
  CalendarDays,
  CalendarRange,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface IndexProps {
  userName: string;
  userEmail: string;
  onSignOut: () => void;
}

const MONTHS = getCalendarMonths();
const PREP_MONTHS = MONTHS.map((m, idx) => ({ ...m, idx })).filter((m) => m.isPreparation);
const ACADEMIC_MONTHS = MONTHS.map((m, idx) => ({ ...m, idx })).filter((m) => !m.isPreparation);

function initialMonthIdx() {
  const now = new Date();
  const idx = MONTHS.findIndex((m) => m.year === now.getFullYear() && m.month === now.getMonth());
  return idx >= 0 ? idx : ACADEMIC_MONTHS[0].idx;
}

const monthLabel = (m: { year: number; month: number }) => `${MONTH_NAMES[m.month]} ${m.year}`;

const allCategories: EventCategory[] = [
  "holiday", "sports", "academic", "cultural", "club", "exam", "general",
];

export default function Index({ userName, userEmail, onSignOut }: IndexProps) {
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    resetToDefaults,
    getEventsForMonth,
  } = useCalendarEvents();

  const [currentMonthIdx, setCurrentMonthIdx] = useState(initialMonthIdx);
  const [activeFilters, setActiveFilters] = useState<Set<EventCategory>>(
    new Set(allCategories)
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>("");
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [monthDialogOpen, setMonthDialogOpen] = useState(false);
  const [printMode, setPrintMode] = useState<PrintMode>("months");
  const openPrintDialog = (mode: PrintMode) => {
    setPrintMode(mode);
    setMonthDialogOpen(true);
  };

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

  const stats = useMemo(() => {
    const counts: Record<EventCategory, number> = {
      holiday: 0, sports: 0, academic: 0, cultural: 0, club: 0, exam: 0, general: 0,
    };
    events.forEach((e) => counts[e.category]++);
    return counts;
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const monthEvents = getEventsForMonth(currentMonth.year, currentMonth.month);
    return monthEvents
      .filter((e) => activeFilters.has(e.category))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [currentMonth, getEventsForMonth, activeFilters]);

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <header className="bg-primary text-primary-foreground border-b-4 border-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-card rounded-lg p-1.5 shrink-0">
                <img src={aceEdxLogo} alt="AceEdX" className="h-10 w-auto" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                  Annual School Academic Calendar <span className="text-accent">2027–28</span>
                </h1>
                <p className="text-primary-foreground/85 text-sm mt-0.5">
                  by <span className="text-accent font-semibold">AceEdX</span> • March 2027 to May 2028 • with preparation months October 2026 – February 2027
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-primary-foreground/70 hidden lg:inline">
                {userEmail}
              </span>
              <Button
                variant="brand"
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
                  <Button variant="onPrimary" size="sm" className="gap-1.5">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openPrintDialog("months")}>
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Print this month ({monthLabel(currentMonth)})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openPrintDialog("months")}>
                    <CalendarRange className="w-4 h-4 mr-2" />
                    Choose months (from – to)…
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => downloadCSV(events)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Download CSV (all dates)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openPrintDialog("list")}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print full list / Save as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="onPrimary"
                size="sm"
                onClick={() => {
                  if (window.confirm("Reset to the default 2027–28 calendar? Your own added events and edits will be removed.")) {
                    resetToDefaults();
                  }
                }}
                className="gap-1.5"
                title="Reset to default events"
                aria-label="Reset to default events"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="onPrimary"
                size="sm"
                onClick={onSignOut}
                className="gap-1.5"
                title="Sign out"
                aria-label="Sign out"
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
            <button
              key={cat}
              className={`bg-card rounded-lg border border-t-4 p-2 sm:p-3 text-center transition-all cursor-pointer hover:shadow-md ${
                selectedCategory === cat
                  ? "border-primary border-t-accent ring-2 ring-accent/40"
                  : "border-border border-t-primary hover:border-t-accent"
              }`}
              onClick={() =>
                setSelectedCategory((prev) => (prev === cat ? null : cat))
              }
            >
              <div className="text-lg sm:text-xl font-bold text-primary">
                {stats[cat]}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                {categoryIcons[cat]} {categoryLabels[cat]}
              </div>
            </button>
          ))}
        </div>

        {/* Category events panel */}
        {selectedCategory && (
          <div className="mb-6">
            <CategoryEventsPanel
              category={selectedCategory}
              events={events}
              onEventClick={handleEventClick}
              onAddEvent={(cat) => {
                setEditingEvent(null);
                setDefaultDate("");
                setModalOpen(true);
              }}
              onClose={() => setSelectedCategory(null)}
            />
          </div>
        )}

        {/* Legend / Filters */}
        <div className="mb-4">
          <EventLegend activeFilters={activeFilters} onToggle={toggleFilter} />
        </div>

        {/* View toggle + Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1 bg-primary/10 rounded-lg p-1">
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-primary hover:bg-primary/10"
              }`}
              onClick={() => setViewMode("month")}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Month
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "year"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-primary hover:bg-primary/10"
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
                className="h-9 w-9"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Select
                value={String(currentMonthIdx)}
                onValueChange={(v) => setCurrentMonthIdx(Number(v))}
              >
                <SelectTrigger className="w-[190px] h-9 font-medium" aria-label="Jump to month">
                  <SelectValue>{monthLabel(currentMonth)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Preparation months</SelectLabel>
                    {PREP_MONTHS.map((m) => (
                      <SelectItem key={m.idx} value={String(m.idx)}>
                        {monthLabel(m)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Academic Year 2027–28</SelectLabel>
                    {ACADEMIC_MONTHS.map((m) => (
                      <SelectItem key={m.idx} value={String(m.idx)}>
                        {monthLabel(m)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentMonthIdx === MONTHS.length - 1}
                className="h-9 w-9"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {viewMode === "month" ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <MonthCalendar
                year={currentMonth.year}
                month={currentMonth.month}
                events={filteredEventsForMonth}
                onDayClick={handleDayClick}
                onEventClick={handleEventClick}
                isPreparation={currentMonth.isPreparation}
              />
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border border-t-4 border-t-accent p-4 sticky top-6">
                <h3 className="font-display text-lg font-bold text-primary mb-1">
                  Events This Month
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {upcomingEvents.length} event{upcomingEvents.length !== 1 ? "s" : ""} in {monthLabel(currentMonth)}
                </p>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No events this month with selected filters.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
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
          <div className="space-y-10">
            {[
              {
                title: "Preparation Months",
                subtitle: "October 2026 – February 2027 • plan, consult and get ready for the new session",
                months: PREP_MONTHS,
              },
              {
                title: "Academic Year 2027–28",
                subtitle: "March 2027 – May 2028",
                months: ACADEMIC_MONTHS,
              },
            ].map((section) => (
              <section key={section.title}>
                <div className="mb-4 border-l-4 border-accent pl-3">
                  <h2 className="font-display text-2xl font-bold text-primary">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">{section.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {section.months.map((m) => {
                    const monthEvents = getEventsForMonth(m.year, m.month).filter((e) =>
                      activeFilters.has(e.category)
                    );
                    return (
                      <MonthCalendar
                        key={m.idx}
                        year={m.year}
                        month={m.month}
                        events={monthEvents}
                        onDayClick={handleDayClick}
                        onEventClick={handleEventClick}
                        isPreparation={m.isPreparation}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        <footer className="mt-12 text-center text-sm text-muted-foreground pb-8">
          <p>
            Click any date to add your school's custom events • Click any event to edit or delete •{" "}
            <button
              onClick={() => {
                if (window.confirm("Reset to the default 2027–28 calendar? Your own added events and edits will be removed.")) {
                  resetToDefaults();
                }
              }}
              className="underline hover:text-foreground"
            >
              Reset to defaults
            </button>
          </p>
          <p className="mt-1">
            Festival dates marked tentative or regional should be confirmed with your state's official holiday list.
          </p>
          <p className="mt-1">
            📚 Annual School Academic Calendar by AceEdX — Academic Year 2027–28
          </p>
        </footer>
      </main>

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

      <MonthDownloadDialog
        open={monthDialogOpen}
        onOpenChange={setMonthDialogOpen}
        events={events}
        initialIdx={currentMonthIdx}
        mode={printMode}
      />
    </div>
  );
}
