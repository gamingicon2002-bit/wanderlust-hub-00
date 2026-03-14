import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Eye, Phone, Mail, MapPin, Calendar, Users, Car, Clock, Filter, Plus, Pencil, Search, X, Download, Upload, IndianRupee, TrendingUp, XCircle, CheckCircle2, Hourglass, ArrowRight, Send, MessageSquare, CalendarIcon, Megaphone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { format, isAfter, isBefore, isToday, startOfDay } from "date-fns";
import Pagination from "@/components/Pagination";

const db = (table: string) => (supabase as any).from(table);
const PER_PAGE = 10;

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "Pending", class: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  confirmed: { label: "Confirmed", class: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  in_progress: { label: "In Progress", class: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  completed: { label: "Completed", class: "bg-green-500/10 text-green-600 border-green-500/20" },
  cancelled: { label: "Cancelled", class: "bg-destructive/10 text-destructive border-destructive/20" },
};

interface DriverAssignment {
  driver_id: string;
  vehicle_id: string | null;
}

const emptyForm = {
  booking_type: "package",
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  reference_name: "",
  reference_id: null as string | null,
  pickup_location: "",
  drop_location: "",
  travel_date: "",
  travel_time: "",
  num_travelers: 1,
  vehicle_type: "",
  rental_option: "",
  notes: "",
  status: "pending",
  driver_id: null as string | null,
  lead_source: "",
};

const AdminBookings = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [selected, setSelected] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [driverAssignments, setDriverAssignments] = useState<DriverAssignment[]>([]);
  const [sendOpen, setSendOpen] = useState<any>(null);
  const [sendChannel, setSendChannel] = useState("all");
  const [sendTargets, setSendTargets] = useState<string[]>(["customer", "admin", "driver"]);
  const [sendMessage, setSendMessage] = useState("");
  const [sendSubject, setSendSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [travelDateOpen, setTravelDateOpen] = useState(false);
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data } = await db("bookings").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: bookingDrivers = [] } = useQuery({
    queryKey: ["booking-drivers"],
    queryFn: async () => {
      const { data } = await db("booking_drivers").select("*");
      return data || [];
    },
  });

  const { data: packages = [] } = useQuery({
    queryKey: ["admin-packages-list"],
    queryFn: async () => { const { data } = await db("packages").select("id, name"); return data || []; },
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["admin-vehicles-list"],
    queryFn: async () => { const { data } = await db("vehicles").select("id, name, type"); return data || []; },
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["admin-drivers-list"],
    queryFn: async () => { const { data } = await db("drivers").select("id, name, phone").eq("is_active", true); return data || []; },
  });

  const { data: driverVehicles = [] } = useQuery({
    queryKey: ["driver-vehicles"],
    queryFn: async () => { const { data } = await db("driver_vehicles").select("*"); return data || []; },
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ["admin-hotels-list"],
    queryFn: async () => { const { data } = await db("hotels").select("id, name"); return data || []; },
  });

  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => { const { data } = await db("site_settings").select("lead_sources").limit(1).single(); return data; },
  });

  const leadSources: string[] = siteSettings?.lead_sources || ["Website", "WhatsApp", "Phone", "Walk-in", "Facebook", "Instagram", "Google", "Referral"];

  const getDriverVehicles = (driverId: string) => {
    const vIds = driverVehicles.filter((dv: any) => dv.driver_id === driverId).map((dv: any) => dv.vehicle_id);
    return vehicles.filter((v: any) => vIds.includes(v.id));
  };

  const getBookingDrivers = (bookingId: string) => {
    return bookingDrivers.filter((bd: any) => bd.booking_id === bookingId);
  };

  const saveBooking = useMutation({
    mutationFn: async () => {
      const payload = { ...form, reference_id: form.reference_id || null, driver_id: driverAssignments[0]?.driver_id || null, ...(!editing ? { created_by: user?.id } : {}) };
      let bookingId: string;
      if (editing) {
        const { error } = await db("bookings").update(payload).eq("id", editing.id);
        if (error) throw error;
        bookingId = editing.id;
        await db("booking_drivers").delete().eq("booking_id", editing.id);
      } else {
        const { data: newB, error } = await db("bookings").insert(payload).select().single();
        if (error) throw error;
        bookingId = newB.id;
      }
      if (driverAssignments.length > 0) {
        const rows = driverAssignments.filter(a => a.driver_id).map(a => ({
          booking_id: bookingId,
          driver_id: a.driver_id,
          vehicle_id: a.vehicle_id || null,
        }));
        if (rows.length > 0) {
          const { error: e2 } = await db("booking_drivers").insert(rows);
          if (e2) throw e2;
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      qc.invalidateQueries({ queryKey: ["booking-drivers"] });
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setDriverAssignments([]);
      toast({ title: editing ? "Booking updated" : "Booking created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await db("bookings").update({ status }).eq("id", id);
      if (error) throw error;
      if (status === "confirmed") {
        try { await supabase.functions.invoke("send-notification", { body: { action: "booking_confirmed", booking_id: id } }); } catch (e) { console.error(e); }
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-bookings"] }); toast({ title: "Status updated" }); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("bookings").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-bookings"] }); toast({ title: "Deleted" }); },
  });

  const exportCSV = () => {
    const headers = ["customer_name","customer_email","customer_phone","booking_type","reference_name","pickup_location","drop_location","travel_date","travel_time","num_travelers","vehicle_type","rental_option","status","notes"];
    const rows = filtered.map((b: any) => headers.map(h => `"${(b[h] || "").toString().replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `bookings-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
    toast({ title: `Exported ${filtered.length} bookings` });
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      if (lines.length < 2) { toast({ title: "Empty CSV", variant: "destructive" }); return; }
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
      const records = lines.slice(1).map(line => {
        const vals = line.match(/(".*?"|[^,]+)/g)?.map(v => v.replace(/^"|"$/g, "").replace(/""/g, '"')) || [];
        const obj: any = {};
        headers.forEach((h, i) => { if (vals[i] !== undefined) obj[h] = vals[i]; });
        obj.num_travelers = Number(obj.num_travelers) || 1;
        return obj;
      }).filter(r => r.customer_name && r.customer_email && r.customer_phone);
      if (records.length === 0) { toast({ title: "No valid rows found", variant: "destructive" }); return; }
      const { error } = await db("bookings").insert(records);
      if (error) { toast({ title: "Import error", description: error.message, variant: "destructive" }); return; }
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({ title: `Imported ${records.length} bookings` });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const openEdit = (b: any) => {
    setEditing(b);
    setForm({
      booking_type: b.booking_type || "package",
      customer_name: b.customer_name || "",
      customer_email: b.customer_email || "",
      customer_phone: b.customer_phone || "",
      reference_name: b.reference_name || "",
      reference_id: b.reference_id || null,
      pickup_location: b.pickup_location || "",
      drop_location: b.drop_location || "",
      travel_date: b.travel_date || "",
      travel_time: b.travel_time || "",
      num_travelers: b.num_travelers || 1,
      vehicle_type: b.vehicle_type || "",
      rental_option: b.rental_option || "",
      notes: b.notes || "",
      status: b.status || "pending",
      driver_id: b.driver_id || null,
      lead_source: b.lead_source || "",
    });
    const bds = getBookingDrivers(b.id);
    setDriverAssignments(bds.length > 0 ? bds.map((bd: any) => ({ driver_id: bd.driver_id, vehicle_id: bd.vehicle_id })) : []);
    setFormOpen(true);
  };

  const filtered = useMemo(() => {
    const today = startOfDay(new Date());
    return bookings.filter((b: any) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (typeFilter !== "all" && b.booking_type !== typeFilter) return false;
      if (timeFilter !== "all" && b.travel_date) {
        const d = startOfDay(new Date(b.travel_date));
        if (timeFilter === "past" && !isBefore(d, today)) return false;
        if (timeFilter === "today" && !isToday(d)) return false;
        if (timeFilter === "future" && !isAfter(d, today)) return false;
      } else if (timeFilter !== "all" && !b.travel_date) return false;
      if (search) {
        const q = search.toLowerCase();
        const match = [b.customer_name, b.customer_email, b.customer_phone, b.reference_name, b.pickup_location, b.drop_location]
          .filter(Boolean).some((v: string) => v.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, typeFilter, timeFilter, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Stats
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const pending = bookings.filter((b: any) => b.status === "pending").length;
    const confirmed = bookings.filter((b: any) => b.status === "confirmed").length;
    const inProgress = bookings.filter((b: any) => b.status === "in_progress").length;
    const completed = bookings.filter((b: any) => b.status === "completed").length;
    const cancelled = bookings.filter((b: any) => b.status === "cancelled").length;
    const upcoming = bookings.filter((b: any) => b.travel_date && isAfter(startOfDay(new Date(b.travel_date)), today)).length;
    return { total: bookings.length, pending, confirmed, inProgress, completed, cancelled, upcoming };
  }, [bookings]);

  const getDriverName = (id: string | null) => {
    if (!id) return "—";
    const d = drivers.find((d: any) => d.id === id);
    return d ? d.name : "Unknown";
  };

  const getVehicleName = (id: string | null) => {
    if (!id) return "—";
    const v = vehicles.find((v: any) => v.id === id);
    return v ? `${v.name} (${v.type})` : "Unknown";
  };

  const addDriverAssignment = () => setDriverAssignments([...driverAssignments, { driver_id: "", vehicle_id: null }]);
  const removeDriverAssignment = (idx: number) => setDriverAssignments(driverAssignments.filter((_, i) => i !== idx));
  const updateDriverAssignment = (idx: number, field: string, value: string | null) => {
    const updated = [...driverAssignments];
    (updated[idx] as any)[field] = value;
    if (field === "driver_id") updated[idx].vehicle_id = null;
    setDriverAssignments(updated);
  };

  const openSendDialog = (booking: any) => {
    setSendOpen(booking);
    setSendChannel("all");
    setSendTargets(["customer", "admin", "driver"]);
    setSendMessage("");
    setSendSubject("");
  };

  const handleSend = async () => {
    if (!sendOpen) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-notification", {
        body: {
          action: "manual_notify",
          booking_id: sendOpen.id,
          channel: sendChannel,
          targets: sendTargets,
          message: sendMessage || undefined,
          subject: sendSubject || undefined,
        },
      });
      if (error) throw error;
      const results = data?.results;
      const emailSent = results?.email?.filter((e: any) => e.sent).length || 0;
      const waSent = results?.whatsapp?.filter((w: any) => w.sent).length || 0;
      const notifs = results?.notifications?.length || 0;
      toast({ title: "Notifications sent", description: `Email: ${emailSent}, WhatsApp: ${waSent}, In-app: ${notifs}` });
      setSendOpen(null);
    } catch (e: any) {
      toast({ title: "Send failed", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const toggleTarget = (t: string) => {
    setSendTargets(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">Bookings ({bookings.length})</h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
          <Button variant="outline" size="sm" asChild><label className="cursor-pointer flex items-center gap-1"><Upload className="w-4 h-4" /> Import CSV<input type="file" accept=".csv" className="hidden" onChange={importCSV} /></label></Button>
          <Button onClick={() => { setEditing(null); setForm(emptyForm); setDriverAssignments([]); setFormOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Create Booking</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {[
          { label: "Total", value: stats.total, icon: TrendingUp, color: "text-primary" },
          { label: "Pending", value: stats.pending, icon: Hourglass, color: "text-yellow-600" },
          { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2, color: "text-blue-600" },
          { label: "In Progress", value: stats.inProgress, icon: ArrowRight, color: "text-purple-600" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-green-600" },
          { label: "Cancelled", value: stats.cancelled, icon: XCircle, color: "text-destructive" },
          { label: "Upcoming", value: stats.upcoming, icon: Calendar, color: "text-primary" },
        ].map((s, i) => (
          <Card key={i} className="bg-card/50"><CardContent className="p-3 flex items-center gap-2">
            <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
            <div><p className="text-[10px] text-muted-foreground uppercase">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name, email, phone, package..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-muted-foreground" /></button>}
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><Filter className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="package">Package</SelectItem>
            <SelectItem value="vehicle">Vehicle</SelectItem>
            <SelectItem value="taxi">Taxi</SelectItem>
            <SelectItem value="hotel">Hotel</SelectItem>
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

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No bookings found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((b: any) => {
              const bds = getBookingDrivers(b.id);
              return (
                <div key={b.id} className="border border-border rounded-xl p-4 bg-card/50 space-y-3">
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
                        <Car className="w-3.5 h-3.5 text-primary" />
                        <span className="text-foreground font-medium">{b.reference_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {b.travel_date ? format(new Date(b.travel_date), "dd MMM yyyy") : "No date set"}
                      {b.travel_time && <span>at {b.travel_time}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-3.5 h-3.5 text-primary" /> {b.num_travelers} travelers
                    </div>
                    {(b.pickup_location || b.drop_location) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {b.pickup_location}{b.pickup_location && b.drop_location && " → "}{b.drop_location}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Megaphone className="w-3.5 h-3.5 text-primary" />
                      <Badge variant="outline" className="text-[10px] bg-primary/5">{b.lead_source || "Unknown"}</Badge>
                    </div>
                    {bds.length > 0 && (
                      <div className="text-xs space-y-0.5 mt-1 border-t border-border pt-1.5">
                        {bds.map((bd: any, i: number) => (
                          <div key={i} className="flex items-center gap-1 text-muted-foreground">
                            <Users className="w-3 h-3 text-primary" />
                            <span className="font-medium text-foreground">{getDriverName(bd.driver_id)}</span>
                            {bd.vehicle_id && <span className="text-muted-foreground">• {getVehicleName(bd.vehicle_id)}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus.mutate({ id: b.id, status: e.target.value })}
                      className="text-xs px-2 py-1.5 rounded-lg border border-input bg-background text-foreground flex-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setSelected(b)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openSendDialog(b)} title="Send Email/WhatsApp"><Send className="w-3.5 h-3.5 text-primary" /></Button>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => { if (confirm("Delete this booking?")) remove.mutate(b.id); }}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>

                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {format(new Date(b.created_at), "dd MMM yyyy, hh:mm a")}
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}

      {/* View Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-foreground">Booking Details</DialogTitle></DialogHeader>
          {selected && (() => {
            const bds = getBookingDrivers(selected.id);
            return (
              <div className="space-y-3 text-sm">
                <DetailRow icon={<Users className="w-4 h-4 text-primary" />} label="Customer" value={selected.customer_name} />
                <DetailRow icon={<Mail className="w-4 h-4 text-primary" />} label="Email" value={selected.customer_email} />
                <DetailRow icon={<Phone className="w-4 h-4 text-primary" />} label="Phone" value={selected.customer_phone} />
                <DetailRow icon={<Car className="w-4 h-4 text-primary" />} label="Type" value={selected.booking_type} />
                <DetailRow label="Package/Vehicle" value={selected.reference_name || "—"} />
                <DetailRow icon={<Calendar className="w-4 h-4 text-primary" />} label="Travel Date" value={selected.travel_date ? format(new Date(selected.travel_date), "dd MMM yyyy") : "—"} />
                <DetailRow label="Time" value={selected.travel_time || "—"} />
                <DetailRow label="Travelers" value={selected.num_travelers} />
                <DetailRow icon={<MapPin className="w-4 h-4 text-primary" />} label="Pickup" value={selected.pickup_location || "—"} />
                <DetailRow label="Drop" value={selected.drop_location || "—"} />
                <DetailRow label="Vehicle Type" value={selected.vehicle_type || "—"} />
                <DetailRow label="Rental Option" value={selected.rental_option || "—"} />
                {bds.length > 0 && (
                  <div className="border-b border-border pb-2">
                    <span className="text-xs text-muted-foreground block mb-1">Assigned Drivers & Vehicles</span>
                    {bds.map((bd: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span>{getDriverName(bd.driver_id)}</span>
                        {bd.vehicle_id && <span className="text-muted-foreground">→ {getVehicleName(bd.vehicle_id)}</span>}
                      </div>
                    ))}
                  </div>
                )}
                <DetailRow label="Lead Source" value={selected.lead_source || "—"} />
                <DetailRow label="Notes" value={selected.notes || "—"} />
                <DetailRow icon={<Clock className="w-4 h-4 text-primary" />} label="Submitted" value={format(new Date(selected.created_at), "dd MMM yyyy, hh:mm a")} />
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1 gap-1" onClick={() => { setSelected(null); openSendDialog(selected); }}><Mail className="w-3.5 h-3.5" /> Send Email</Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => { setSelected(null); setSendChannel("whatsapp"); openSendDialog(selected); }}><MessageSquare className="w-3.5 h-3.5" /> WhatsApp</Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Booking Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Booking" : "Create New Booking"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveBooking.mutate(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Booking Type *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={form.booking_type} onChange={(e) => setForm({ ...form, booking_type: e.target.value })}>
                  <option value="package">Package</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="taxi">Taxi</option>
                  <option value="hotel">Hotel</option>
                  <option value="destination">Destination</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Customer Name *</Label><Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Customer Email *</Label><Input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Customer Phone *</Label><Input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Travelers</Label><Input type="number" min={1} value={form.num_travelers} onChange={(e) => setForm({ ...form, num_travelers: Number(e.target.value) })} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Package / Vehicle / Hotel</Label>
                {form.booking_type === "package" ? (
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={form.reference_name} onChange={(e) => {
                    const pkg = packages.find((p: any) => p.name === e.target.value);
                    setForm({ ...form, reference_name: e.target.value, reference_id: pkg?.id || null });
                  }}>
                    <option value="">Select package</option>
                    {packages.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                ) : form.booking_type === "hotel" ? (
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={form.reference_name} onChange={(e) => {
                    const h = hotels.find((h: any) => h.name === e.target.value);
                    setForm({ ...form, reference_name: e.target.value, reference_id: h?.id || null });
                  }}>
                    <option value="">Select hotel</option>
                    {hotels.map((h: any) => <option key={h.id} value={h.name}>{h.name}</option>)}
                  </select>
                ) : (
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={form.reference_name} onChange={(e) => {
                    const v = vehicles.find((v: any) => v.name === e.target.value);
                    setForm({ ...form, reference_name: e.target.value, reference_id: v?.id || null });
                  }}>
                    <option value="">Select vehicle</option>
                    {vehicles.map((v: any) => <option key={v.id} value={v.name}>{v.name} ({v.type})</option>)}
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Lead Source</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={form.lead_source} onChange={(e) => setForm({ ...form, lead_source: e.target.value })}>
                  <option value="">Select source</option>
                  {leadSources.map((src: string) => <option key={src} value={src}>{src}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vehicle Type</Label>
                <Input value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })} placeholder="Car / SUV / Tempo" />
              </div>
            </div>

            {/* Multi-Driver Assignment */}
            <div className="space-y-3 bg-muted/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assign Drivers & Vehicles</p>
                <Button type="button" variant="outline" size="sm" onClick={addDriverAssignment}><Plus className="w-3 h-3 mr-1" /> Add Driver</Button>
              </div>
              {driverAssignments.map((da, idx) => {
                const driverVehicleList = da.driver_id ? getDriverVehicles(da.driver_id) : [];
                return (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5 space-y-1">
                      <Label className="text-xs">Driver</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={da.driver_id} onChange={(e) => updateDriverAssignment(idx, "driver_id", e.target.value)}>
                        <option value="">Select driver</option>
                        {drivers.map((d: any) => <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>)}
                      </select>
                    </div>
                    <div className="col-span-5 space-y-1">
                      <Label className="text-xs">Vehicle</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={da.vehicle_id || ""} onChange={(e) => updateDriverAssignment(idx, "vehicle_id", e.target.value || null)}>
                        <option value="">Select vehicle</option>
                        {driverVehicleList.length > 0 ? (
                          driverVehicleList.map((v: any) => <option key={v.id} value={v.id}>{v.name} ({v.type})</option>)
                        ) : (
                          vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.name} ({v.type})</option>)
                        )}
                      </select>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeDriverAssignment(idx)}><X className="w-3 h-3 text-destructive" /></Button>
                    </div>
                  </div>
                );
              })}
              {driverAssignments.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No drivers assigned. Click "Add Driver" above.</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Travel Date</Label>
                <Popover open={travelDateOpen} onOpenChange={setTravelDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.travel_date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.travel_date ? format(new Date(form.travel_date), "dd MMM yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={form.travel_date ? new Date(form.travel_date) : undefined}
                      onSelect={(date) => { setForm({ ...form, travel_date: date ? format(date, "yyyy-MM-dd") : "" }); setTravelDateOpen(false); }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2"><Label>Travel Time</Label><Input type="time" value={form.travel_time} onChange={(e) => setForm({ ...form, travel_time: e.target.value })} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Pickup Location</Label><Input value={form.pickup_location} onChange={(e) => setForm({ ...form, pickup_location: e.target.value })} /></div>
              <div className="space-y-2"><Label>Drop Location</Label><Input value={form.drop_location} onChange={(e) => setForm({ ...form, drop_location: e.target.value })} /></div>
            </div>

            <div className="space-y-2">
              <Label>Rental Option</Label>
              <Input value={form.rental_option} onChange={(e) => setForm({ ...form, rental_option: e.target.value })} placeholder="Self Drive / With Driver" />
            </div>

            <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveBooking.isPending}>{saveBooking.isPending ? "Saving..." : editing ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={!!sendOpen} onOpenChange={() => setSendOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Send className="w-5 h-5 text-primary" /> Send Notification</DialogTitle></DialogHeader>
          {sendOpen && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-3 text-sm">
                <p className="font-semibold text-foreground">{sendOpen.customer_name}</p>
                <p className="text-muted-foreground text-xs">{sendOpen.reference_name || "N/A"} • {sendOpen.travel_date || "No date"}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Channel</Label>
                <div className="flex gap-2">
                  {[
                    { value: "all", label: "Both", icon: Send },
                    { value: "email", label: "Email", icon: Mail },
                    { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
                  ].map(ch => (
                    <Button key={ch.value} type="button" size="sm" variant={sendChannel === ch.value ? "default" : "outline"} className="flex-1 gap-1" onClick={() => setSendChannel(ch.value)}>
                      <ch.icon className="w-3.5 h-3.5" /> {ch.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Send To</Label>
                <div className="flex gap-4">
                  {[
                    { id: "customer", label: "Customer" },
                    { id: "admin", label: "Admin" },
                    { id: "driver", label: "Driver(s)" },
                  ].map(t => (
                    <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={sendTargets.includes(t.id)} onCheckedChange={() => toggleTarget(t.id)} />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Subject (optional, email only)</Label>
                <Input value={sendSubject} onChange={(e) => setSendSubject(e.target.value)} placeholder="Leave blank for default" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Custom Message (optional)</Label>
                <Textarea value={sendMessage} onChange={(e) => setSendMessage(e.target.value)} placeholder="Leave blank for default booking template message..." rows={3} />
                <p className="text-[10px] text-muted-foreground">Supports: {"{{customer_name}}, {{reference_name}}, {{travel_date}}, {{pickup_location}}, {{status}}"}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSendOpen(null)}>Cancel</Button>
                <Button className="flex-1 gap-1" onClick={handleSend} disabled={sending || sendTargets.length === 0}>
                  <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send Now"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DetailRow = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value: any }) => (
  <div className="flex items-start gap-3 border-b border-border pb-2">
    {icon && <div className="mt-0.5">{icon}</div>}
    <div className="flex-1 min-w-0">
      <span className="text-xs text-muted-foreground block">{label}</span>
      <span className="font-medium text-foreground capitalize break-words">{value}</span>
    </div>
  </div>
);

export default AdminBookings;
