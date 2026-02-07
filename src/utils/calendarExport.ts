import { CalendarEvent, categoryLabels, categoryIcons } from "@/data/calendarData";

export function generateCalendarCSV(events: CalendarEvent[]): string {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const header = "Date,Day,Event Title,Category,Description";
  const rows = sorted.map((e) => {
    const d = new Date(e.date + "T00:00:00");
    const day = d.toLocaleDateString("en-IN", { weekday: "long" });
    const dateFormatted = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const desc = (e.description ?? "").replace(/"/g, '""');
    const title = e.title.replace(/"/g, '""');
    return `"${dateFormatted}","${day}","${title}","${categoryLabels[e.category]}","${desc}"`;
  });
  return [header, ...rows].join("\n");
}

export function downloadCSV(events: CalendarEvent[], filename = "school-calendar-2026-27.csv") {
  const csv = generateCalendarCSV(events);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function generatePrintableHTML(events: CalendarEvent[]): string {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  
  // Group by month
  const months = new Map<string, CalendarEvent[]>();
  sorted.forEach((e) => {
    const d = new Date(e.date + "T00:00:00");
    const key = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(e);
  });

  const categoryColors: Record<string, string> = {
    holiday: "#e53e3e",
    sports: "#38a169",
    academic: "#3182ce",
    cultural: "#805ad5",
    club: "#d69e2e",
    exam: "#d53f8c",
    general: "#2b7a78",
  };

  let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>School Annual Calendar 2026–27</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; padding: 24px; color: #1a1a2e; background: #fff; }
  h1 { font-family: 'Playfair Display', serif; text-align: center; font-size: 28px; margin-bottom: 8px; color: #2b7a78; }
  .subtitle { text-align: center; color: #666; font-size: 14px; margin-bottom: 24px; }
  .month-title { font-family: 'Playfair Display', serif; font-size: 20px; color: #2b7a78; border-bottom: 2px solid #2b7a78; padding-bottom: 4px; margin: 20px 0 10px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
  th { background: #f0f7f7; text-align: left; padding: 8px 10px; border: 1px solid #dde; font-weight: 600; }
  td { padding: 6px 10px; border: 1px solid #dde; vertical-align: top; }
  .cat-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
  .sunday { color: #e53e3e; }
  @media print { body { padding: 12px; } .month-title { break-before: auto; } }
  @page { margin: 1cm; }
</style>
</head>
<body>
<h1>📚 School Annual Calendar</h1>
<p class="subtitle">Academic Year: March 2026 – March 2027</p>
`;

  months.forEach((evts, monthName) => {
    html += `<h2 class="month-title">${monthName}</h2>`;
    html += `<table><tr><th>Date</th><th>Day</th><th>Event</th><th>Category</th><th>Details</th></tr>`;
    evts.forEach((e) => {
      const d = new Date(e.date + "T00:00:00");
      const day = d.toLocaleDateString("en-IN", { weekday: "short" });
      const dateStr = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const isSunday = d.getDay() === 0;
      const color = categoryColors[e.category] ?? "#2b7a78";
      html += `<tr${isSunday ? ' class="sunday"' : ""}>
        <td>${dateStr}</td>
        <td>${day}</td>
        <td><span class="cat-dot" style="background:${color}"></span>${e.title}${e.isCustom ? " ✏️" : ""}</td>
        <td>${categoryIcons[e.category]} ${categoryLabels[e.category]}</td>
        <td>${e.description ?? ""}</td>
      </tr>`;
    });
    html += `</table>`;
  });

  html += `<p style="text-align:center;color:#999;font-size:11px;margin-top:20px;">Generated from School Annual Calendar App</p>`;
  html += `</body></html>`;
  return html;
}

export function downloadPrintableHTML(events: CalendarEvent[]) {
  const html = generatePrintableHTML(events);
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (w) {
    w.onload = () => {
      setTimeout(() => w.print(), 500);
    };
  }
}
