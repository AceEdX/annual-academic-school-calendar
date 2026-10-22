import { categoryLabels, categoryIcons, EventCategory } from "@/data/calendarData";

const categories: EventCategory[] = [
  "holiday",
  "sports",
  "academic",
  "cultural",
  "club",
  "exam",
  "general",
];

const categoryDotColors: Record<EventCategory, string> = {
  holiday: "bg-cal-holiday",
  sports: "bg-cal-sports",
  academic: "bg-cal-academic",
  cultural: "bg-cal-cultural",
  club: "bg-cal-club",
  exam: "bg-cal-exam-bg",
  general: "bg-cal-general",
};

interface EventLegendProps {
  activeFilters: Set<EventCategory>;
  onToggle: (cat: EventCategory) => void;
}

export default function EventLegend({ activeFilters, onToggle }: EventLegendProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const active = activeFilters.has(cat);
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              active
                ? "border-border bg-card shadow-sm"
                : "border-transparent bg-muted/50 opacity-50"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${categoryDotColors[cat]}`} />
            <span>{categoryIcons[cat]}</span>
            <span>{categoryLabels[cat]}</span>
          </button>
        );
      })}
    </div>
  );
}
