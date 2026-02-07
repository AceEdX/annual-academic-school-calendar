import { CalendarEvent, categoryLabels, categoryIcons, EventCategory } from "@/data/calendarData";

interface EventBadgeProps {
  event: CalendarEvent;
  compact?: boolean;
  onClick?: (event: CalendarEvent) => void;
}

const categoryClassMap: Record<EventCategory, string> = {
  holiday: "cal-event-holiday",
  sports: "cal-event-sports",
  academic: "cal-event-academic",
  cultural: "cal-event-cultural",
  club: "cal-event-club",
  exam: "cal-event-exam",
  general: "cal-event-general",
};

export default function EventBadge({ event, compact = false, onClick }: EventBadgeProps) {
  const className = categoryClassMap[event.category];
  const icon = categoryIcons[event.category];

  if (compact) {
    return (
      <button
        onClick={() => onClick?.(event)}
        className={`${className} w-full text-left px-1.5 py-0.5 rounded text-[10px] leading-tight font-medium truncate cursor-pointer hover:opacity-80 transition-opacity`}
        title={`${icon} ${event.title} (${categoryLabels[event.category]})`}
      >
        <span className="mr-0.5">{icon}</span>
        {event.title}
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick?.(event)}
      className={`${className} w-full text-left px-3 py-2 rounded-lg text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity animate-fade-in`}
    >
      <div className="flex items-center gap-1.5">
        <span>{icon}</span>
        <span className="truncate">{event.title}</span>
      </div>
      {event.description && (
        <p className="text-xs opacity-75 mt-0.5 truncate">{event.description}</p>
      )}
    </button>
  );
}
