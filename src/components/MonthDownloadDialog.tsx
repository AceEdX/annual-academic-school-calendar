import { useEffect, useState } from "react";
import { CalendarEvent } from "@/data/calendarData";
import { getCalendarMonths, MONTH_NAMES } from "@/utils/calendarRange";
import {
  downloadMonthGrids,
  downloadPrintableHTML,
  getMonthRange,
  printMonthGrids,
} from "@/utils/calendarExport";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
const PRINT_NAME_KEY = "school-calendar-print-name";

const loadPrintName = () => {
  try {
    return localStorage.getItem(PRINT_NAME_KEY) ?? "";
  } catch {
    return "";
  }
};
const savePrintName = (name: string) => {
  try {
    localStorage.setItem(PRINT_NAME_KEY, name.trim());
  } catch {
    // storage unavailable
  }
};

export type PrintMode = "months" | "list";

interface MonthDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: CalendarEvent[];
  initialIdx: number;
  mode?: PrintMode;
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
  mode = "months",
}: MonthDownloadDialogProps) {
  const [fromIdx, setFromIdx] = useState(initialIdx);
  const [toIdx, setToIdx] = useState(initialIdx);
  const [printName, setPrintName] = useState(loadPrintName);

  useEffect(() => {
    if (open) {
      setFromIdx(initialIdx);
      setToIdx(initialIdx);
      setPrintName(loadPrintName());
    }
  }, [open, initialIdx]);

  const months = getMonthRange(fromIdx, toIdx);
  const count = months.length;
  const name = printName.trim().slice(0, 120) || undefined;

  const setFrom = (v: number) => {
    setFromIdx(v);
    if (v > toIdx) setToIdx(v);
  };
  const setTo = (v: number) => {
    setToIdx(v);
    if (v < fromIdx) setFromIdx(v);
  };

  const handlePrint = () => {
    savePrintName(printName);
    if (mode === "list") downloadPrintableHTML(events, name);
    else printMonthGrids(events, months, name);
  };

  const handleDownload = () => {
    savePrintName(printName);
    downloadMonthGrids(events, months, name);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">
            {mode === "list" ? "Print full calendar list" : "Download month-wise calendar"}
          </DialogTitle>
          <DialogDescription>
            {mode === "list"
              ? "Every date from October 2026 to May 2028, with all events."
              : "Each month prints on its own page in the month design, with every event written in full."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="print-name">Name to print at the top (optional)</Label>
          <Input
            id="print-name"
            value={printName}
            maxLength={120}
            placeholder="e.g. Sunrise Public School, Pune"
            onChange={(e) => setPrintName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Your school or your own name. We'll remember it for your next print.
          </p>
        </div>

        {mode === "months" && (
          <>
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
          </>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {mode === "months" && (
            <Button variant="outline" className="gap-1.5" onClick={handleDownload}>
              <Download className="w-4 h-4" />
              Download file
            </Button>
          )}
          <Button className="gap-1.5" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
