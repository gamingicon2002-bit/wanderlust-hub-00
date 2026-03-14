import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface Booking {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  reference_name?: string;
  travel_date?: string;
  status?: string;
}

interface SearchableBookingPickerProps {
  bookings: Booking[];
  value: string;
  onSelect: (bookingId: string) => void;
  placeholder?: string;
  filterStatuses?: string[];
}

const SearchableBookingPicker = ({
  bookings,
  value,
  onSelect,
  placeholder = "Search booking by name, package, date...",
  filterStatuses,
}: SearchableBookingPickerProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let list = bookings;
    if (filterStatuses?.length) {
      list = list.filter((b) => filterStatuses.includes(b.status || ""));
    }
    if (!query.trim()) return list.slice(0, 20);
    const q = query.toLowerCase();
    return list.filter((b) =>
      [b.customer_name, b.customer_email, b.customer_phone, b.reference_name, b.travel_date]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    ).slice(0, 20);
  }, [bookings, query, filterStatuses]);

  const selectedBooking = bookings.find((b) => b.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={open ? query : selectedBooking ? `${selectedBooking.customer_name} — ${selectedBooking.reference_name || "N/A"}` : ""}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="pl-9 pr-8"
        />
        {(value || query) && (
          <button
            onClick={() => { setQuery(""); onSelect(""); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">No bookings found</div>
          ) : (
            filtered.map((b) => (
              <button
                key={b.id}
                type="button"
                className="w-full text-left px-4 py-2.5 hover:bg-muted/50 flex items-center justify-between gap-2 text-sm transition-colors border-b border-border/30 last:border-0"
                onClick={() => { onSelect(b.id); setQuery(""); setOpen(false); }}
              >
                <div className="min-w-0">
                  <span className="font-medium text-foreground">{b.customer_name}</span>
                  <span className="text-muted-foreground"> — {b.reference_name || "N/A"}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {b.travel_date || "No date"}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableBookingPicker;
