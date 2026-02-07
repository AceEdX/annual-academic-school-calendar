import { useState } from "react";
import { CalendarEvent, EventCategory, categoryLabels, categoryIcons } from "@/data/calendarData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  defaultDate?: string;
  onSave: (data: { title: string; date: string; category: EventCategory; description?: string }) => void;
  onDelete?: (id: string) => void;
}

const categories: EventCategory[] = [
  "holiday",
  "sports",
  "academic",
  "cultural",
  "club",
  "exam",
  "general",
];

export default function EventModal({
  open,
  onClose,
  event,
  defaultDate,
  onSave,
  onDelete,
}: EventModalProps) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [date, setDate] = useState(event?.date ?? defaultDate ?? "");
  const [category, setCategory] = useState<EventCategory>(event?.category ?? "general");
  const [description, setDescription] = useState(event?.description ?? "");

  const isEditing = !!event;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSave({ title: title.trim(), date, category, description: description.trim() || undefined });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md font-body">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Edit Event" : "Add New Event"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Event Title *</Label>
            <Input
              id="event-title"
              placeholder="e.g. Annual Sports Day"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-date">Date *</Label>
            <Input
              id="event-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min="2026-03-01"
              max="2027-03-31"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as EventCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <span className="flex items-center gap-2">
                      <span>{categoryIcons[cat]}</span>
                      <span>{categoryLabels[cat]}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-description">Description (optional)</Label>
            <Textarea
              id="event-description"
              placeholder="Brief description of the event..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              rows={3}
            />
          </div>
          <DialogFooter className="flex-row gap-2">
            {isEditing && event && onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete(event.id);
                  onClose();
                }}
                className="mr-auto"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save Changes" : "Add Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
