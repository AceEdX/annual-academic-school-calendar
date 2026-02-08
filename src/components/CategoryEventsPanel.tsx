import { CalendarEvent, EventCategory, categoryLabels, categoryIcons } from "@/data/calendarData";
import EventBadge from "./EventBadge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryEventsPanelProps {
  category: EventCategory;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onAddEvent: (category: EventCategory) => void;
  onClose: () => void;
}

export default function CategoryEventsPanel({
  category,
  events,
  onEventClick,
  onAddEvent,
  onClose,
}: CategoryEventsPanelProps) {
  const categoryEvents = events
    .filter((e) => e.category === category)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-card rounded-xl border border-border shadow-lg animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-xl">{categoryIcons[category]}</span>
          <h3 className="font-display text-lg font-bold text-foreground">
            {categoryLabels[category]}
          </h3>
          <span className="text-sm text-muted-foreground">
            ({categoryEvents.length} event{categoryEvents.length !== 1 ? "s" : ""})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => onAddEvent(category)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Events list */}
      <ScrollArea className="max-h-[400px]">
        {categoryEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4">
            No events in this category.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {categoryEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => onEventClick(evt)}
              >
                <div className="text-xs text-muted-foreground min-w-[80px] pt-0.5 font-medium">
                  {new Date(evt.date + "T00:00:00").toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <EventBadge event={evt} />
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
