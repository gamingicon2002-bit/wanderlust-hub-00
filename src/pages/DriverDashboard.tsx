import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Truck, Calendar, MapPin, Users, Phone, Package, Search, X, Filter, Clock } from "lucide-react";
import { format, startOfDay, isBefore, isAfter, isToday } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Pagination from "@/components/Pagination";
import NotificationBell from "@/components/NotificationBell";

const db = (table: string) => (supabase as any).from(table);
const PER_PAGE = 10;

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "Pending", class: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  confirmed: { label: "Confirmed", class: "bg-green-500/10 text-green-600 border-green-500/20" },
  cancelled: { label: "Cancelled", class: "bg-destructive/10 text-destructive border-destructive/20" },
  completed: { label: "Completed", class: "bg-primary/10 text-primary border-primary/20" },
};

const DriverDashboard = () => {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);

  const { data: driverProfile } = useQuery({
    queryKey: ["driver-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { nav("/driver/login"); return null; }
      const { data } = await db("drivers").select("*").eq("user_id", user.id).maybeSingle();
      if (!data) { await supabase.auth.signOut(); nav("/driver/login"); return null; }
      return data;
    },
  });

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["driver-bookings", driverProfile?.id],
    enabled: !!driverProfile?.id,
    queryFn: async () => {
      const { data } = await db("bookings").select("*").eq("driver_id", driverProfile.id).order("travel_date", { ascending: false });
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    const today = startOfDay(new Date());
    return bookings.filter((b: any) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (timeFilter !== "all" && b.travel_date) {
        const d = startOfDay(new Date(b.travel_date));
        if (timeFilter === "past" && !isBefore(d, today)) return false;
        if (timeFilter === "today" && !isToday(d)) return false;
        if (timeFilter === "future" && !isAfter(d, today)) return false;
      } else if (timeFilter !== "all" && !b.travel_date) return false;
      if (search) {
        const q = search.toLowerCase();
        return [b.customer_name, b.reference_name, b.pickup_location, b.drop_location]
          .filter(Boolean).some((v: string) => v.toLowerCase().includes(q));
      }
      return true;
    });
  }, [bookings, statusFilter, timeFilter, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    nav("/driver/login");
  };

  if (!driverProfile) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-foreground">{driverProfile.name}</span>
              <span className="text-xs text-muted-foreground block">Driver Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-destructive">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Trips", value: bookings.length, icon: Package },
            { label: "Upcoming", value: bookings.filter((b: any) => b.travel_date && isAfter(startOfDay(new Date(b.travel_date)), startOfDay(new Date()))).length, icon: Calendar },
            { label: "Today", value: bookings.filter((b: any) => b.travel_date && isToday(new Date(b.travel_date))).length, icon: Clock },
            { label: "Completed", value: bookings.filter((b: any) => b.status === "completed").length, icon: Users },
          ].map((s) => (
            <div key={s.label} className="border border-border rounded-xl p-4 bg-card/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <s.icon className="w-4 h-4 text-primary" />
                <span className="text-xs">{s.label}</span>
              </div>
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search customer, package, location..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-muted-foreground" /></button>}
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[130px]"><Filter className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={(v) => { setTimeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="past">Past</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="future">Upcoming</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings List */}
        {isLoading ? <p className="text-muted-foreground">Loading trips...</p> : filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No trips found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginated.map((b: any) => (
                <div key={b.id} className="border border-border rounded-xl p-4 bg-card/50 space-y-3 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelected(b)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{b.customer_name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Phone className="w-3 h-3" /> {b.customer_phone}
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${statusConfig[b.status]?.class || ""}`}>
                      {statusConfig[b.status]?.label || b.status}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {b.reference_name && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="w-3.5 h-3.5 text-primary" />
                        <span className="text-foreground font-medium">{b.reference_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {b.travel_date ? format(new Date(b.travel_date), "dd MMM yyyy") : "No date"}
                      {b.travel_time && <span>at {b.travel_time}</span>}
                    </div>
                    {(b.pickup_location || b.drop_location) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {b.pickup_location}{b.pickup_location && b.drop_location && " → "}{b.drop_location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
          </>
        )}
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-foreground">Trip Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              {[
                { label: "Customer", value: selected.customer_name },
                { label: "Phone", value: selected.customer_phone },
                { label: "Email", value: selected.customer_email },
                { label: "Package/Vehicle", value: selected.reference_name || "—" },
                { label: "Type", value: selected.booking_type },
                { label: "Travel Date", value: selected.travel_date ? format(new Date(selected.travel_date), "dd MMM yyyy") : "—" },
                { label: "Time", value: selected.travel_time || "—" },
                { label: "Travelers", value: selected.num_travelers },
                { label: "Pickup", value: selected.pickup_location || "—" },
                { label: "Drop", value: selected.drop_location || "—" },
                { label: "Vehicle Type", value: selected.vehicle_type || "—" },
                { label: "Notes", value: selected.notes || "—" },
                { label: "Status", value: selected.status },
              ].map((r) => (
                <div key={r.label} className="flex items-start gap-3 border-b border-border pb-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground block">{r.label}</span>
                    <span className="font-medium text-foreground capitalize break-words">{r.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverDashboard;
