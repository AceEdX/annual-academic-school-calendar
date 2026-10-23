import { CalendarEvent, categoryLabels, categoryIcons } from "@/data/calendarData";
import {
  CalendarMonth,
  getAllCalendarDates,
  getCalendarMonths,
  isPreparationDate,
  toDateStr,
  weekdayOf,
} from "./calendarRange";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-");
  return `${d} ${MONTHS_SHORT[Number(m) - 1]} ${y}`;
};

const phaseOf = (dateStr: string) =>
  isPreparationDate(dateStr) ? "Preparation Month" : "Academic Year 2027–28";

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function groupByDate(events: CalendarEvent[]) {
  const map = new Map<string, CalendarEvent[]>();
  events.forEach((e) => {
    if (!map.has(e.date)) map.set(e.date, []);
    map.get(e.date)!.push(e);
  });
  return map;
}

/** One row per event; dates without events still get a row so every day of the span is listed. */
export function generateCalendarCSV(events: CalendarEvent[]): string {
  const byDate = groupByDate(events);
  const header = "Date,Day,Phase,Event Title,Category,Description";
  const rows: string[] = [];
  for (const date of getAllCalendarDates()) {
    const base = [formatDate(date), WEEKDAYS[weekdayOf(date)], phaseOf(date)];
    const dayEvents = byDate.get(date) ?? [];
    if (dayEvents.length === 0) {
      rows.push([...base, "", "", ""].map(csvCell).join(","));
    } else {
      dayEvents.forEach((e) =>
        rows.push(
          [...base, e.title, categoryLabels[e.category], e.description ?? ""].map(csvCell).join(",")
        )
      );
    }
  }
  // Leading BOM so Excel shows Indian-language and symbol characters correctly
  return "\uFEFF" + [header, ...rows].join("\n");
}

export function downloadCSV(events: CalendarEvent[], filename = "aceedx-school-calendar-2027-28.csv") {
  const csv = generateCalendarCSV(events);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const categoryColors: Record<string, string> = {
  holiday: "#e0a800",
  sports: "#0ea5e9",
  academic: "#1d4ed8",
  cultural: "#f59e0b",
  club: "#ca8a04",
  exam: "#1e3a8a",
  general: "#3b82f6",
};

export function generatePrintableHTML(events: CalendarEvent[], schoolName?: string): string {
  const byDate = groupByDate(events);

  let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Annual School Academic Calendar 2027–28 by AceEdX</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; padding: 24px; color: #0f1f3d; background: #fff; }
  h1 { font-family: 'Playfair Display', serif; text-align: center; font-size: 28px; margin-bottom: 6px; color: #1e4fa8; }
  .subtitle { text-align: center; color: #555; font-size: 14px; margin-bottom: 4px; }
  .school { text-align: center; font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; color: #0f1f4d; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 3px solid #facc15; }
  .brand-bar { height: 6px; background: linear-gradient(90deg, #1e4fa8 0 70%, #facc15 70% 100%); border-radius: 3px; margin: 14px 0 20px; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 22px; color: #1e4fa8; margin: 28px 0 6px; }
  .month-title { font-size: 16px; font-weight: 700; color: #fff; background: #1e4fa8; border-left: 6px solid #facc15; padding: 6px 10px; margin: 18px 0 0; }
  .month-title .tag { background: #facc15; color: #1e3a8a; font-size: 11px; padding: 2px 8px; border-radius: 10px; margin-left: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 12px; }
  th { background: #eef4ff; color: #1e3a8a; text-align: left; padding: 6px 8px; border: 1px solid #d6e2f5; font-weight: 600; }
  td { padding: 4px 8px; border: 1px solid #d6e2f5; vertical-align: top; }
  td.date { white-space: nowrap; width: 70px; }
  td.day { width: 50px; }
  tr.sunday td { background: #fffbea; }
  tr.sunday td.day, tr.sunday td.date { color: #b45309; font-weight: 700; }
  .cat-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
  .ev + .ev { margin-top: 3px; }
  .muted { color: #aaa; }
  @media print { body { padding: 8px; } .month-title { break-after: avoid; } table { break-inside: auto; } tr { break-inside: avoid; } th, .month-title, tr.sunday td, .month-title .tag, .brand-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  @page { margin: 1cm; }
</style>
</head>
<body>
${schoolName?.trim() ? `<p class="school">${escapeHtml(schoolName.trim())}</p>` : ""}
<h1>Annual School Academic Calendar 2027–28</h1>
<p class="subtitle">Academic Year: March 2027 – May 2028 • Preparation months: October 2026 – February 2027</p>
<p class="subtitle">by AceEdX</p>
<div class="brand-bar"></div>
`;

  let currentSection = "";
  for (const { year, month, isPreparation } of getCalendarMonths()) {
    const section = isPreparation
      ? "Preparation Months (October 2026 – February 2027)"
      : "Academic Year 2027–28 (March 2027 – May 2028)";
    if (section !== currentSection) {
      html += `<h2 class="section-title">${section}</h2>`;
      currentSection = section;
    }
    html += `<div class="month-title">${MONTHS_LONG[month]} ${year}${
      isPreparation ? '<span class="tag">Preparation</span>' : ""
    }</div>`;
    html += `<table><tr><th>Date</th><th>Day</th><th>Events</th></tr>`;
    const days = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const date = toDateStr(year, month, d);
      const dow = weekdayOf(date);
      const dayEvents = byDate.get(date) ?? [];
      const cell =
        dayEvents.length === 0
          ? dow === 0
            ? '<span class="muted">Sunday</span>'
            : ""
          : dayEvents
              .map(
                (e) =>
                  `<div class="ev"><span class="cat-dot" style="background:${
                    categoryColors[e.category] ?? "#1e4fa8"
                  }"></span><strong>${escapeHtml(e.title)}</strong> <span class="muted">(${categoryIcons[e.category]} ${
                    categoryLabels[e.category]
                  })</span>${e.description ? ` — ${escapeHtml(e.description)}` : ""}</div>`
              )
              .join("");
      html += `<tr${dow === 0 ? ' class="sunday"' : ""}><td class="date">${String(d).padStart(2, "0")} ${
        MONTHS_SHORT[month]
      }</td><td class="day">${WEEKDAYS[dow].slice(0, 3)}</td><td>${cell}</td></tr>`;
    }
    html += `</table>`;
  }

  html += `<p style="text-align:center;color:#999;font-size:11px;margin-top:20px;">Annual School Academic Calendar by AceEdX • Tentative and regional dates should be confirmed with official circulars.</p>`;
  html += `</body></html>`;
  return html;
}

/** Opens printable HTML in a new tab and starts printing; downloads the file if pop-ups are blocked. */
function openPrintable(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (w) {
    w.onload = () => {
      setTimeout(() => w.print(), 500);
    };
  } else {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Saves printable HTML as a file without opening the print dialog. */
function saveHTMLFile(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function downloadPrintableHTML(events: CalendarEvent[], schoolName?: string) {
  openPrintable(generatePrintableHTML(events, schoolName), "aceedx-school-calendar-2027-28.html");
}

// ---------- Month-wise grid calendars (same design as the on-screen month view) ----------

const gridColors: Record<string, { fg: string; bg: string }> = {
  holiday: { fg: "hsl(222 70% 18%)", bg: "hsl(47 100% 70%)" },
  sports: { fg: "hsl(199 85% 34%)", bg: "hsl(199 90% 92%)" },
  academic: { fg: "hsl(217 75% 42%)", bg: "hsl(217 85% 94%)" },
  cultural: { fg: "hsl(32 90% 36%)", bg: "hsl(42 100% 91%)" },
  club: { fg: "hsl(42 85% 30%)", bg: "hsl(52 100% 90%)" },
  exam: { fg: "hsl(0 0% 100%)", bg: "hsl(222 65% 30%)" },
  general: { fg: "hsl(215 35% 35%)", bg: "hsl(214 40% 93%)" },
};

const GRID_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const monthSlug = (m: CalendarMonth) => `${MONTHS_SHORT[m.month].toLowerCase()}-${m.year}`;

/** File name for a month-wise download, e.g. aceedx-calendar-mar-2027.html or ...-mar-2027-to-may-2027.html */
export function monthGridFilename(months: CalendarMonth[]) {
  if (months.length === 0) return "aceedx-calendar.html";
  const first = monthSlug(months[0]);
  const last = monthSlug(months[months.length - 1]);
  return first === last ? `aceedx-calendar-${first}.html` : `aceedx-calendar-${first}-to-${last}.html`;
}

/** Months from one calendar month index to another (inclusive, any order). */
export function getMonthRange(fromIdx: number, toIdx: number): CalendarMonth[] {
  const all = getCalendarMonths();
  const start = Math.max(0, Math.min(fromIdx, toIdx));
  const end = Math.min(all.length - 1, Math.max(fromIdx, toIdx));
  return all.slice(start, end + 1);
}

/** One page per month, laid out as a 7-day grid with every event written out in full. */
export function generateMonthGridHTML(
  events: CalendarEvent[],
  months: CalendarMonth[],
  schoolName?: string
): string {
  const byDate = groupByDate(events);
  const rangeLabel =
    months.length === 0
      ? ""
      : months.length === 1
      ? `${MONTHS_LONG[months[0].month]} ${months[0].year}`
      : `${MONTHS_LONG[months[0].month]} ${months[0].year} – ${MONTHS_LONG[months[months.length - 1].month]} ${
          months[months.length - 1].year
        }`;

  const legend = Object.keys(gridColors)
    .map(
      (cat) =>
        `<span class="lg"><span class="sw" style="background:${gridColors[cat].bg};border-color:${gridColors[cat].fg}"></span>${
          categoryIcons[cat as keyof typeof categoryIcons]
        } ${categoryLabels[cat as keyof typeof categoryLabels]}</span>`
    )
    .join("");

  let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>AceEdX School Calendar – ${escapeHtml(rangeLabel)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; color: hsl(222 47% 11%); background: #fff; padding: 16px; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { border: 1px solid hsl(214 32% 85%); border-radius: 12px; overflow: hidden; margin: 0 auto 24px; max-width: 1100px; }
  .page + .page { break-before: page; }
  .brand { display: flex; justify-content: space-between; align-items: baseline; padding: 6px 14px; font-size: 11px; color: hsl(215 65% 42%); background: hsl(215 65% 97%); }
  .school { text-align: center; font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: hsl(222 70% 18%); padding: 10px 14px 8px; border-bottom: 3px solid hsl(47 100% 52%); }
  .brand strong { font-family: 'Playfair Display', serif; font-size: 13px; }
  .head { background: hsl(215 65% 42%); border-bottom: 4px solid hsl(47 100% 52%); color: #fff; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; }
  .head h2 { font-family: 'Playfair Display', serif; font-size: 22px; letter-spacing: .3px; }
  .tag { background: hsl(47 100% 52%); color: hsl(222 70% 18%); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; border-radius: 999px; padding: 3px 10px; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th { background: hsl(215 65% 96%); color: hsl(215 65% 42%); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; padding: 6px 0; border: 1px solid hsl(214 32% 88%); }
  th.sun { color: hsl(38 95% 36%); background: hsl(50 100% 96%); }
  td { border: 1px solid hsl(214 32% 88%); vertical-align: top; padding: 4px; height: 96px; }
  td.empty { background: hsl(214 30% 97%); }
  td.sun { background: hsl(50 100% 96%); }
  .num { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; font-size: 11px; font-weight: 700; }
  td.sun .num { color: hsl(38 95% 36%); }
  .ev { font-size: 9.5px; line-height: 1.25; font-weight: 600; padding: 2px 4px; border-radius: 3px; border-left: 2px solid; margin-top: 2px; word-wrap: break-word; overflow-wrap: anywhere; }
  .legend { display: flex; flex-wrap: wrap; gap: 10px; padding: 8px 14px; font-size: 10px; color: hsl(215 25% 35%); border-top: 1px solid hsl(214 32% 88%); }
  .lg { display: inline-flex; align-items: center; gap: 4px; }
  .sw { width: 10px; height: 10px; border-radius: 2px; border-left: 2px solid; display: inline-block; }
  .foot { text-align: center; font-size: 9px; color: hsl(215 16% 55%); padding: 0 14px 8px; }
  @page { size: A4 landscape; margin: 8mm; }
  @media print { body { padding: 0; } .page { margin: 0; max-width: none; border-radius: 0; } tr { break-inside: avoid; } }
</style>
</head>
<body>
`;

  for (const m of months) {
    const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
    const startDow = new Date(m.year, m.month, 1).getDay();
    const cells: string[] = [];
    for (let i = 0; i < startDow; i++) cells.push('<td class="empty"></td>');
    for (let d = 1; d <= daysInMonth; d++) {
      const date = toDateStr(m.year, m.month, d);
      const isSun = (startDow + d - 1) % 7 === 0;
      const evs = (byDate.get(date) ?? [])
        .map((e) => {
          const c = gridColors[e.category] ?? gridColors.general;
          return `<div class="ev" style="background:${c.bg};color:${c.fg};border-color:${c.fg}">${
            categoryIcons[e.category]
          } ${escapeHtml(e.title)}</div>`;
        })
        .join("");
      cells.push(`<td${isSun ? ' class="sun"' : ""}><span class="num">${d}</span>${evs}</td>`);
    }
    while (cells.length % 7 !== 0) cells.push('<td class="empty"></td>');

    let rows = "";
    for (let i = 0; i < cells.length; i += 7) rows += `<tr>${cells.slice(i, i + 7).join("")}</tr>`;

    html += `<section class="page">
  ${schoolName?.trim() ? `<div class="school">${escapeHtml(schoolName.trim())}</div>` : ""}
  <div class="brand"><strong>Annual School Academic Calendar 2027–28</strong><span>by AceEdX</span></div>
  <div class="head"><h2>${MONTHS_LONG[m.month]} ${m.year}</h2>${
      m.isPreparation ? '<span class="tag">Preparation month</span>' : '<span class="tag">Academic Year 2027–28</span>'
    }</div>
  <table><thead><tr>${GRID_DAYS.map((d, i) => `<th${i === 0 ? ' class="sun"' : ""}>${d}</th>`).join(
    ""
  )}</tr></thead><tbody>${rows}</tbody></table>
  <div class="legend">${legend}</div>
  <p class="foot">Tentative and regional dates should be confirmed with official circulars.</p>
</section>
`;
  }

  html += `</body></html>`;
  return html;
}

/** Opens the chosen months as grid pages and starts the print / Save as PDF dialog. */
export function printMonthGrids(events: CalendarEvent[], months: CalendarMonth[], schoolName?: string) {
  openPrintable(generateMonthGridHTML(events, months, schoolName), monthGridFilename(months));
}

/** Saves the chosen months as a printable file to keep and print later. */
export function downloadMonthGrids(events: CalendarEvent[], months: CalendarMonth[], schoolName?: string) {
  saveHTMLFile(generateMonthGridHTML(events, months, schoolName), monthGridFilename(months));
}
