import { useEffect, useState } from "react";
import { CalendarEvent } from "@/data/calendarData";
import { getCalendarMonths, MONTH_NAMES } from "@/utils/calendarRange";
import { downloadMonthGrids, getMonthRange, printMonthGrids } from "@/utils/calendarExport";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Printer } from "lucide-react";

const MONTHS = getCalendarMonths().map((m, idx) => ({ ...m, idx }));
const label = (m: { year: number; month: number }) => `${MONTH_NAMES[m.month]} ${m.year}`;

interface MonthDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: CalendarEvent[];
  initialIdx: number;
}

function MonthSelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger aria-label={ariaLabel}>
        <SelectValue>{label(MONTHS[value])}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Preparation months</SelectLabel>
          {MONTHS.filter((m) => m.isPreparation).map((m) => (
            <SelectItem key={m.idx} value={String(m.idx)}>
              {label(m)}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Academic Year 2027–28</SelectLabel>
          {MONTHS.filter((m) => !m.isPreparation).map((m) => (
            <SelectItem key={m.idx} value={String(m.idx)}>
              {label(m)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default function MonthDownloadDialog({
  open,
  onOpenChange,
  events,
  initialIdx,
}: MonthDownloadDialogProps) {
  const [fromIdx, setFromIdx] = useState(initialIdx);
  const [toIdx, setToIdx] = useState(initialIdx);

  useEffect(() => {
    if (open) {
      setFromIdx(initialIdx);
      setToIdx(initialIdx);
    }
  }, [open, initialIdx]);

  const months = getMonthRange(fromIdx, toIdx);
  const count = months.length;

  const setFrom = (v: number) => {
    setFromIdx(v);
    if (v > toIdx) setToIdx(v);
  };
  const setTo = (v: number) => {
    setToIdx(v);
    if (v < fromIdx) setFromIdx(v);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">Download month-wise calendar</DialogTitle>
          <DialogDescription>
            Each month prints on its own page in the month design, with every event written in full.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>From</Label>
            <MonthSelect value={fromIdx} onChange={setFrom} ariaLabel="From month" />
          </div>
          <div className="space-y-1.5">
            <Label>To</Label>
            <MonthSelect value={toIdx} onChange={setTo} ariaLabel="To month" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFromIdx(initialIdx);
              setToIdx(initialIdx);
            }}
          >
            Only this month
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const academic = MONTHS.filter((m) => !m.isPreparation);
              setFromIdx(academic[0].idx);
              setToIdx(academic[academic.length - 1].idx);
            }}
          >
            Whole academic year
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFromIdx(0);
              setToIdx(MONTHS.length - 1);
            }}
          >
            All 20 months
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {count} month{count !== 1 ? "s" : ""} selected • {count} page{count !== 1 ? "s" : ""}
        </p>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => downloadMonthGrids(events, months)}>
            <Download className="w-4 h-4" />
            Download file
          </Button>
          <Button className="gap-1.5" onClick={() => printMonthGrids(events, months)}>
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
