import { describe, it, expect } from "vitest";
import { defaultEvents, CalendarEvent } from "@/data/calendarData";
import { getAllCalendarDates, getCalendarMonths, isPreparationDate } from "@/utils/calendarRange";
import { generateCalendarCSV, generatePrintableHTML, generateMonthGridHTML, getMonthRange, monthGridFilename } from "@/utils/calendarExport";
import { migrateStoredEvents } from "@/hooks/useCalendarEvents";

describe("calendar span", () => {
  it("runs from October 2026 to May 2028 (20 months)", () => {
    const months = getCalendarMonths();
    expect(months).toHaveLength(20);
    expect(months[0]).toMatchObject({ year: 2026, month: 9 });
    expect(months[months.length - 1]).toMatchObject({ year: 2028, month: 4 });
  });

  it("marks October 2026 – February 2027 as preparation months only", () => {
    const prep = getCalendarMonths().filter((m) => m.isPreparation);
    expect(prep).toHaveLength(5);
    expect(isPreparationDate("2027-02-28")).toBe(true);
    expect(isPreparationDate("2027-03-01")).toBe(false);
  });

  it("includes every date, including Sundays and leap day 2028", () => {
    const dates = getAllCalendarDates();
    expect(dates).toHaveLength(609);
    expect(dates).toContain("2028-02-29");
    expect(dates).toContain("2027-03-07"); // a Sunday
  });

  it("keeps all default events inside the span", () => {
    expect(defaultEvents.every((e) => e.date >= "2026-10-01" && e.date <= "2028-05-31")).toBe(true);
  });
});

describe("CSV download", () => {
  it("has a row for every date even when there are no events", () => {
    const lines = generateCalendarCSV([]).split("\n");
    expect(lines).toHaveLength(1 + 609);
    expect(lines[1]).toContain("Thursday"); // 1 Oct 2026
  });
});

describe("returning-user migration", () => {
  const custom: CalendarEvent = { id: "c1", date: "2027-06-10", title: "Our Founders' Day", category: "cultural", isCustom: true };
  const oldCustom: CalendarEvent = { id: "c2", date: "2026-04-10", title: "Old event", category: "general", isCustom: true };
  const oldBase: CalendarEvent = { id: "b1", date: "2026-08-15", title: "Old default", category: "holiday" };

  it("loads the new calendar and keeps custom events within the new span", () => {
    const result = migrateStoredEvents([custom, oldCustom, oldBase], null);
    expect(result).toContain(custom);
    expect(result).not.toContain(oldCustom);
    expect(result).not.toContain(oldBase);
    expect(result.length).toBe(defaultEvents.length + 1);
  });

  it("leaves saved events untouched when already on the current version", () => {
    const saved = [custom];
    expect(migrateStoredEvents(saved, "2027-28-v1")).toBe(saved);
  });
});

describe("month-wise downloads", () => {
  it("picks every month from the chosen start to the chosen end", () => {
    const months = getMonthRange(5, 7); // Mar 2027 – May 2027
    expect(months.map((m) => `${m.month}-${m.year}`)).toEqual(["2-2027", "3-2027", "4-2027"]);
    expect(getMonthRange(7, 5)).toHaveLength(3);
  });

  it("prints one page per month with every event title in full", () => {
    const long = "Inter-House Science Exhibition and Innovation Fair Grand Finale";
    const evs: CalendarEvent[] = [
      { id: "a", date: "2027-03-10", title: long, category: "academic" },
      ...[1, 2, 3, 4, 5].map((n) => ({ id: `x${n}`, date: "2027-03-15", title: `Event ${n}`, category: "club" as const })),
    ];
    const html = generateMonthGridHTML(evs, getMonthRange(5, 6));
    expect(html.match(/<section class="page">/g)).toHaveLength(2);
    expect(html).toContain(long);
    [1, 2, 3, 4, 5].forEach((n) => expect(html).toContain(`Event ${n}`));
    expect(html).not.toContain("more");
  });

  it("names the file after the chosen months", () => {
    expect(monthGridFilename(getMonthRange(5, 5))).toBe("aceedx-calendar-mar-2027.html");
    expect(monthGridFilename(getMonthRange(5, 7))).toBe("aceedx-calendar-mar-2027-to-may-2027.html");
  });
});

describe("name printed at the top", () => {
  it("prints the chosen name at the top of every month page and the full list", () => {
    const html = generateMonthGridHTML([], getMonthRange(5, 6), "Sunrise <Public> School");
    expect(html.match(/<div class="school">Sunrise &lt;Public&gt; School<\/div>/g)).toHaveLength(2);
    expect(generatePrintableHTML([], "Sunrise School")).toContain('<p class="school">Sunrise School</p>');
  });

  it("prints no name line when left blank", () => {
    expect(generateMonthGridHTML([], getMonthRange(5, 5), "  ")).not.toContain('class="school"');
  });
});
