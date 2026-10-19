import { useState, useCallback } from "react";
import { CalendarEvent, CALENDAR_VERSION, defaultEvents, generateId } from "@/data/calendarData";
import { eventInMonth, isWithinCalendar } from "@/utils/calendarRange";

const STORAGE_KEY = "school-calendar-events";
const VERSION_KEY = "school-calendar-version";

/**
 * Brings saved events up to the current default calendar.
 * Same version: keep everything as saved.
 * Older version: load the new defaults and keep the school's own custom events that fall in the new span.
 */
export function migrateStoredEvents(
  saved: CalendarEvent[] | null,
  savedVersion: string | null,
  defaults: CalendarEvent[] = defaultEvents,
  currentVersion: string = CALENDAR_VERSION
): CalendarEvent[] {
  if (!saved) return defaults;
  if (savedVersion === currentVersion) return saved;
  const custom = saved.filter((e) => e.isCustom && isWithinCalendar(e.date));
  return [...defaults, ...custom];
}

function loadEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as CalendarEvent[]) : null;
    const version = localStorage.getItem(VERSION_KEY);
    const events = migrateStoredEvents(Array.isArray(saved) ? saved : null, version);
    if (saved && version !== CALENDAR_VERSION) saveEvents(events);
    return events;
  } catch {
    return defaultEvents;
  }
}

function saveEvents(events: CalendarEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    localStorage.setItem(VERSION_KEY, CALENDAR_VERSION);
  } catch {
    // storage full or unavailable
  }
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents);

  const addEvent = useCallback((event: Omit<CalendarEvent, "id" | "isCustom">) => {
    setEvents((prev) => {
      const updated = [...prev, { ...event, id: generateId(), isCustom: true }];
      saveEvents(updated);
      return updated;
    });
  }, []);

  const updateEvent = useCallback((id: string, event: Partial<CalendarEvent>) => {
    setEvents((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...event } : e));
      saveEvents(updated);
      return updated;
    });
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveEvents(updated);
      return updated;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
    setEvents(defaultEvents);
  }, []);

  const getEventsForDate = useCallback(
    (dateStr: string) => events.filter((e) => e.date === dateStr),
    [events]
  );

  const getEventsForMonth = useCallback(
    (year: number, month: number) => events.filter((e) => eventInMonth(e, year, month)),
    [events]
  );

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    resetToDefaults,
    getEventsForDate,
    getEventsForMonth,
  };
}
