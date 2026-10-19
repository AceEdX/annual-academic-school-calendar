import { ACADEMIC_YEAR_START, CALENDAR_END, CALENDAR_START, CalendarEvent } from "@/data/calendarData";

export interface CalendarMonth {
  year: number;
  month: number; // 0-indexed
  isPreparation: boolean;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const parse = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { y, m: m - 1, d };
};

export const toDateStr = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

/** True for dates before the main academic year (the preparation months). */
export const isPreparationDate = (dateStr: string) => dateStr < ACADEMIC_YEAR_START;

export const isWithinCalendar = (dateStr: string) =>
  dateStr >= CALENDAR_START && dateStr <= CALENDAR_END;

/** Every month in the calendar span, in order. */
export function getCalendarMonths(): CalendarMonth[] {
  const start = parse(CALENDAR_START);
  const end = parse(CALENDAR_END);
  const months: CalendarMonth[] = [];
  let y = start.y;
  let m = start.m;
  while (y < end.y || (y === end.y && m <= end.m)) {
    months.push({ year: y, month: m, isPreparation: isPreparationDate(toDateStr(y, m, 1)) });
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }
  return months;
}

/** Every calendar date (YYYY-MM-DD) in the span, including Sundays and empty days. */
export function getAllCalendarDates(): string[] {
  const dates: string[] = [];
  for (const { year, month } of getCalendarMonths()) {
    const days = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= days; d++) dates.push(toDateStr(year, month, d));
  }
  return dates;
}

export const weekdayOf = (dateStr: string) => {
  const { y, m, d } = parse(dateStr);
  return new Date(y, m, d).getDay();
};

export const eventInMonth = (event: CalendarEvent, year: number, month: number) => {
  const { y, m } = parse(event.date);
  return y === year && m === month;
};
