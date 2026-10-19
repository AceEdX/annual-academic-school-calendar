import { useMemo } from "react";
import { CalendarEvent } from "@/data/calendarData";
import EventBadge from "./EventBadge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MonthCalendarProps {
  year: number;
  month: number; // 0-indexed
  events: CalendarEvent[];
  onDayClick: (dateStr: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  isPreparation?: boolean;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function MonthCalendar({
  year,
  month,
  events,
  onDayClick,
  onEventClick,
  isPreparation = false,
}: MonthCalendarProps) {
  const { weeks, monthName } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDow = firstDay.getDay(); // 0=Sun

    const monthName = firstDay.toLocaleString("en-IN", { month: "long", year: "numeric" });

    const eventMap = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const key = e.date;
      if (!eventMap.has(key)) eventMap.set(key, []);
      eventMap.get(key)!.push(e);
    });

    const weeks: {
      day: number | null;
      dateStr: string;
      isSunday: boolean;
      isToday: boolean;
      events: CalendarEvent[];
    }[][] = [];

    let currentWeek: typeof weeks[0] = [];
    // Pad the first week
    for (let i = 0; i < startDow; i++) {
      currentWeek.push({ day: null, dateStr: "", isSunday: false, isToday: false, events: [] });
    }

    const today = new Date();
    const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDateStr(year, month, d);
      const dow = (startDow + d - 1) % 7;
      currentWeek.push({
        day: d,
        dateStr,
        isSunday: dow === 0,
        isToday: dateStr === todayStr,
        events: eventMap.get(dateStr) ?? [],
      });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    // Pad the last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ day: null, dateStr: "", isSunday: false, isToday: false, events: [] });
      }
      weeks.push(currentWeek);
    }

    return { weeks, monthName, eventMap };
  }, [year, month, events]);

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden animate-fade-in">
      <div className="bg-primary border-b-4 border-accent px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-2">
        <h2 className="text-primary-foreground font-display text-lg sm:text-xl font-bold tracking-wide">
          {monthName}
        </h2>
        {isPreparation && (
          <span className="bg-accent text-accent-foreground text-[10px] sm:text-xs font-semibold uppercase tracking-wide rounded-full px-2.5 py-0.5 whitespace-nowrap">
            Preparation month
          </span>
        )}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border bg-primary/5">
        {DAY_NAMES.map((d, i) => (
          <div
            key={d}
            className={`text-center py-2 text-xs font-semibold uppercase tracking-wider ${
              i === 0 ? "text-cal-sunday bg-cal-sunday-bg" : "text-primary"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="divide-y divide-border">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 divide-x divide-border">
            {week.map((cell, ci) => (
              <div
                key={ci}
                className={`min-h-[80px] sm:min-h-[100px] p-1 relative transition-colors ${
                  cell.day === null
                    ? "bg-muted/30"
                    : cell.isToday
                    ? "bg-cal-today-bg cursor-pointer"
                    : cell.isSunday
                    ? "bg-cal-sunday-bg hover:bg-accent/20 cursor-pointer"
                    : "hover:bg-primary/5 cursor-pointer"
                }`}
                onClick={() => cell.day && onDayClick(cell.dateStr)}
              >
                {cell.day !== null && (
                  <>
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                        cell.isToday
                          ? "bg-primary text-primary-foreground"
                          : cell.isSunday
                          ? "text-cal-sunday"
                          : "text-foreground"
                      }`}
                    >
                      {cell.day}
                    </span>
                    <div className="mt-0.5 space-y-0.5">
                      {cell.events.slice(0, 3).map((evt) => (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(evt);
                          }}
                        >
                          <EventBadge event={evt} compact />
                        </div>
                      ))}
                      {cell.events.length > 3 && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="text-[10px] text-primary font-medium pl-1 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              +{cell.events.length - 3} more
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-2 space-y-1" align="start">
                            <div className="text-xs font-semibold text-foreground mb-2">
                              All events on {new Date(cell.dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                            {cell.events.map((evt) => (
                              <div key={evt.id} onClick={(e) => { e.stopPropagation(); onEventClick(evt); }}>
                                <EventBadge event={evt} compact />
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2 gap-1 text-xs"
                              onClick={(e) => { e.stopPropagation(); onDayClick(cell.dateStr); }}
                            >
                              <Plus className="w-3 h-3" />
                              Add Event
                            </Button>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
