import { CalendarEvent, categoryLabels, categoryIcons } from "@/data/calendarData";
import { getAllCalendarDates, getCalendarMonths, isPreparationDate, toDateStr, weekdayOf } from "./calendarRange";

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
<h1>Annual School Academic Calendar 2027–28</h1>
${schoolName ? `<p class="subtitle"><strong>${escapeHtml(schoolName)}</strong></p>` : ""}
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

export function downloadPrintableHTML(events: CalendarEvent[], schoolName?: string) {
  const html = generatePrintableHTML(events, schoolName);
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (w) {
    w.onload = () => {
      setTimeout(() => w.print(), 500);
    };
  } else {
    // Pop-up blocked: download the printable file instead
    const link = document.createElement("a");
    link.href = url;
    link.download = "aceedx-school-calendar-2027-28.html";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
