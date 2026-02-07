import { useState, useCallback } from "react";
import { CalendarEvent, defaultEvents, generateId } from "@/data/calendarData";

const STORAGE_KEY = "school-calendar-events";

function loadEvents(): CalendarEvent[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return defaultEvents;
}

function saveEvents(events: CalendarEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
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
    setEvents(defaultEvents);
  }, []);

  const getEventsForDate = useCallback(
    (dateStr: string) => events.filter((e) => e.date === dateStr),
    [events]
  );

  const getEventsForMonth = useCallback(
    (year: number, month: number) =>
      events.filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      }),
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
