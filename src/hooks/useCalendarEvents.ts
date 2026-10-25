import { useState, useCallback, useEffect, useRef } from "react";
import { CalendarEvent, CALENDAR_VERSION, defaultEvents, generateId } from "@/data/calendarData";
import { eventInMonth, isWithinCalendar } from "@/utils/calendarRange";
import { supabase } from "@/integrations/supabase/client";

const LEGACY_STORAGE_KEY = "school-calendar-events";
const LEGACY_VERSION_KEY = "school-calendar-version";
const SAVE_DELAY_MS = 800;

export type SaveStatus = "loading" | "saving" | "saved" | "error";

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

/**
 * Decides which calendar to show once the account's saved copy has been fetched.
 * The account's saved calendar always wins, so changes follow the user to any device.
 * With nothing saved to the account yet, the copy on this device is kept (and then uploaded).
 */
export function chooseStartingEvents(
  remote: { events: CalendarEvent[]; version: string | null } | null,
  local: CalendarEvent[]
): { events: CalendarEvent[]; needsUpload: boolean } {
  if (remote && Array.isArray(remote.events)) {
    const events = migrateStoredEvents(remote.events, remote.version);
    return { events, needsUpload: remote.version !== CALENDAR_VERSION };
  }
  return { events: local, needsUpload: true };
}

const cacheKey = (userId: string) => `school-calendar-events:${userId}`;
const cacheVersionKey = (userId: string) => `school-calendar-version:${userId}`;

function readStored(key: string, versionKey: string): CalendarEvent[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return migrateStoredEvents(parsed as CalendarEvent[], localStorage.getItem(versionKey));
  } catch {
    return null;
  }
}

function loadLocal(userId: string): CalendarEvent[] {
  return (
    readStored(cacheKey(userId), cacheVersionKey(userId)) ??
    readStored(LEGACY_STORAGE_KEY, LEGACY_VERSION_KEY) ??
    defaultEvents
  );
}

function cacheLocal(userId: string, events: CalendarEvent[]) {
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(events));
    localStorage.setItem(cacheVersionKey(userId), CALENDAR_VERSION);
  } catch {
    // storage full or unavailable
  }
}

async function saveRemote(userId: string, events: CalendarEvent[]) {
  const { error } = await supabase.from("user_calendars").upsert(
    {
      user_id: userId,
      events: events as unknown as never,
      calendar_version: CALENDAR_VERSION,
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
}

export function useCalendarEvents(userId: string) {
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadLocal(userId));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);

  const loadedRef = useRef(false);
  const editedBeforeLoadRef = useRef(false);
  const pendingRef = useRef<CalendarEvent[] | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventsRef = useRef(events);
  eventsRef.current = events;

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const toSave = pendingRef.current;
    if (!toSave || !loadedRef.current) return;
    pendingRef.current = null;
    setSaveStatus("saving");
    try {
      await saveRemote(userId, toSave);
      setSaveStatus(pendingRef.current ? "saving" : "saved");
    } catch (err) {
      console.error("Calendar save failed", err);
      if (!pendingRef.current) pendingRef.current = toSave;
      setSaveStatus("error");
    }
  }, [userId]);

  const scheduleSave = useCallback(
    (next: CalendarEvent[]) => {
      cacheLocal(userId, next);
      pendingRef.current = next;
      if (!loadedRef.current) {
        editedBeforeLoadRef.current = true;
        return;
      }
      setSaveStatus("saving");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
    },
    [userId, flush]
  );

  // Load the account's saved calendar
  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    loadedRef.current = false;
    (async () => {
      const { data, error } = await supabase
        .from("user_calendars")
        .select("events, calendar_version")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error("Calendar load failed", error);
        setSaveStatus("error");
        // keep the device copy and try again shortly; never overwrite the account's saved calendar blind
        retryTimer = setTimeout(() => setLoadAttempt((n) => n + 1), 5000);
        return;
      }

      let finalEvents: CalendarEvent[];
      let needsUpload: boolean;
      if (editedBeforeLoadRef.current) {
        finalEvents = eventsRef.current;
        needsUpload = true;
      } else {
        const chosen = chooseStartingEvents(
          data ? { events: data.events as unknown as CalendarEvent[], version: data.calendar_version } : null,
          eventsRef.current
        );
        finalEvents = chosen.events;
        needsUpload = chosen.needsUpload;
        setEvents(finalEvents);
      }
      cacheLocal(userId, finalEvents);
      loadedRef.current = true;

      if (needsUpload) {
        pendingRef.current = finalEvents;
        await flush();
        if (!data) {
          try {
            localStorage.removeItem(LEGACY_STORAGE_KEY);
            localStorage.removeItem(LEGACY_VERSION_KEY);
          } catch {
            // ignore
          }
        }
      } else {
        setSaveStatus("saved");
      }
    })();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [userId, flush, loadAttempt]);

  // Save straight away when the tab is hidden or closed, and retry failed saves when back online
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    const onOnline = () => {
      if (loadedRef.current) void flush();
      else setLoadAttempt((n) => n + 1);
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("online", onOnline);
      void flush();
    };
  }, [flush]);

  const update = useCallback(
    (fn: (prev: CalendarEvent[]) => CalendarEvent[]) => {
      setEvents((prev) => {
        const next = fn(prev);
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const addEvent = useCallback(
    (event: Omit<CalendarEvent, "id" | "isCustom">) =>
      update((prev) => [...prev, { ...event, id: generateId(), isCustom: true }]),
    [update]
  );

  const updateEvent = useCallback(
    (id: string, event: Partial<CalendarEvent>) =>
      update((prev) => prev.map((e) => (e.id === id ? { ...e, ...event } : e))),
    [update]
  );

  const deleteEvent = useCallback(
    (id: string) => update((prev) => prev.filter((e) => e.id !== id)),
    [update]
  );

  const resetToDefaults = useCallback(() => update(() => defaultEvents), [update]);

  const retrySave = useCallback(() => {
    if (!loadedRef.current) {
      setLoadAttempt((n) => n + 1);
      return;
    }
    if (!pendingRef.current) pendingRef.current = eventsRef.current;
    void flush();
  }, [flush]);

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
    saveStatus,
    retrySave,
    addEvent,
    updateEvent,
    deleteEvent,
    resetToDefaults,
    getEventsForDate,
    getEventsForMonth,
  };
}
