import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Eye, Search, X, Filter, CalendarIcon, Phone, Mail, MapPin, Users, Clock, Hotel, TrendingUp, Hourglass, CheckCircle2, XCircle, BedDouble, Image as ImageIcon, IdCard, Heart, Megaphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format, isSameDay, parseISO, isToday, eachDayOfInterval, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import Pagination from "@/components/Pagination";

const db = (table: string) => (supabase as any).from(table);
const PER_PAGE = 10;

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "Pending", class: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  confirmed: { label: "Confirmed", class: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  completed: { label: "Completed", class: "bg-green-500/10 text-green-600 border-green-500/20" },
  cancelled: { label: "Cancelled", class: "bg-destructive/10 text-destructive border-destructive/20" },
};

const emptyForm = {
  booking_type: "hotel" as string,
  customer_name: "", customer_email: "", customer_phone: "",
  reference_name: "", reference_id: null as string | null,
  pickup_location: "", drop_location: "",
  travel_date: "", travel_time: "",
  num_travelers: 1, vehicle_type: "", rental_option: "",
  notes: "", status: "pending", driver_id: null as string | null,
  lead_source: "",
};

const emptyDetails = {
  room_id: null as string | null,
  check_in: "", check_out: "",
  guest_id_type: "aadhar", guest_id_number: "", guest_id_image: "",
  marital_status: "single", family_members: 1,
  num_beds: 1, num_pillows: 2, num_sheets: 2,
  special_requests: "",
};

const AdminHotelBookings = () => {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [details, setDetails] = useState(emptyDetails);
  const [travelDate, setTravelDate] = useState<Date>();
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [calendarView, setCalendarView] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [roomImagesOpen, setRoomImagesOpen] = useState<any>(null);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["admin-hotel-bookings"],
    queryFn: async () => {
      const { data } = await db("bookings").select("*").eq("booking_type", "hotel").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ["admin-hotels-list"],
    queryFn: async () => { const { data } = await db("hotels").select("id, name, price_per_night"); return data || []; },
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["admin-hotel-rooms"],
    queryFn: async () => { const { data } = await db("hotel_rooms").select("*").order("room_number"); return data || []; },
  });

  const { data: bookingDetails = [] } = useQuery({
    queryKey: ["admin-hotel-booking-details"],
    queryFn: async () => { const { data } = await db("hotel_booking_details").select("*"); return data || []; },
  });

  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => { const { data } = await db("site_settings").select("*").limit(1).single(); return data; },
  });
  const leadSources: string[] = (siteSettings?.lead_sources as any) || ["Website", "WhatsApp", "Phone", "Walk-in", "Facebook", "Instagram", "Google", "Referral"];

  const getDetailsForBooking = (bookingId: string) => bookingDetails.find((d: any) => d.booking_id === bookingId);
  const getRoomForBooking = (bookingId: string) => {
    const det = getDetailsForBooking(bookingId);
    if (!det?.room_id) return null;
    return rooms.find((r: any) => r.id === det.room_id);
  };

  const saveBooking = useMutation({
    mutationFn: async () => {
      const payload = { ...form, travel_date: travelDate ? format(travelDate, "yyyy-MM-dd") : null, reference_id: form.reference_id || null };
      let bookingId = editing?.id;
      if (editing) {
        const { error } = await db("bookings").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await db("bookings").insert(payload).select("id").single();
        if (error) throw error;
        bookingId = data.id;
      }
      // Save hotel booking details
      const detPayload = {
        ...details,
        booking_id: bookingId,
        check_in: checkInDate ? format(checkInDate, "yyyy-MM-dd") : null,
        check_out: checkOutDate ? format(checkOutDate, "yyyy-MM-dd") : null,
        room_id: details.room_id || null,
      };
      const existing = getDetailsForBooking(bookingId);
      if (existing) {
        await db("hotel_booking_details").update(detPayload).eq("id", existing.id);
      } else {
        await db("hotel_booking_details").insert(detPayload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hotel-bookings"] });
      qc.invalidateQueries({ queryKey: ["admin-hotel-booking-details"] });
      setFormOpen(false); setEditing(null); setForm(emptyForm); setDetails(emptyDetails);
      setTravelDate(undefined); setCheckInDate(undefined); setCheckOutDate(undefined);
      toast({ title: editing ? "Booking updated" : "Booking created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await db("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-hotel-bookings"] }); toast({ title: "Status updated" }); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("bookings").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-hotel-bookings"] }); toast({ title: "Deleted" }); },
  });

  const openEdit = (b: any) => {
    setEditing(b);
    setForm({ ...emptyForm, ...b, reference_id: b.reference_id || null });
    setTravelDate(b.travel_date ? parseISO(b.travel_date) : undefined);
    const det = getDetailsForBooking(b.id);
    if (det) {
      setDetails({ ...emptyDetails, ...det });
      setCheckInDate(det.check_in ? parseISO(det.check_in) : undefined);
      setCheckOutDate(det.check_out ? parseISO(det.check_out) : undefined);
    } else {
      setDetails(emptyDetails);
      setCheckInDate(undefined); setCheckOutDate(undefined);
    }
    setFormOpen(true);
  };

  const filtered = useMemo(() => {
    return bookings.filter((b: any) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return [b.customer_name, b.customer_email, b.customer_phone, b.reference_name].filter(Boolean).some((v: string) => v.toLowerCase().includes(q));
      }
      return true;
    });
  }, [bookings, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b: any) => b.status === "pending").length,
    confirmed: bookings.filter((b: any) => b.status === "confirmed").length,
    completed: bookings.filter((b: any) => b.status === "completed").length,
    cancelled: bookings.filter((b: any) => b.status === "cancelled").length,
  }), [bookings]);

  // Calendar: room-wise availability
  const selectedHotelRooms = useMemo(() => {
    if (!form.reference_id) return rooms;
    return rooms.filter((r: any) => r.hotel_id === form.reference_id);
  }, [rooms, form.reference_id]);

  const getRoomBookingsForDate = (roomId: string, date: Date) => {
    return bookingDetails.filter((d: any) => {
      if (d.room_id !== roomId) return false;
      if (!d.check_in || !d.check_out) return false;
      const ci = parseISO(d.check_in);
      const co = parseISO(d.check_out);
      return date >= ci && date <= co;
    });
  };

  const getBookingsForDate = (date: Date) => bookings.filter((b: any) => b.travel_date && isSameDay(parseISO(b.travel_date), date));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2"><Hotel className="w-6 h-6 text-primary" /> Hotel Bookings ({bookings.length})</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCalendarView(!calendarView)}>
            <CalendarIcon className="w-4 h-4 mr-1" /> {calendarView ? "List View" : "Calendar"}
          </Button>
          <Button onClick={() => { setEditing(null); setForm(emptyForm); setDetails(emptyDetails); setTravelDate(undefined); setCheckInDate(undefined); setCheckOutDate(undefined); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Create Booking
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, icon: TrendingUp, color: "text-primary" },
          { label: "Pending", value: stats.pending, icon: Hourglass, color: "text-yellow-600" },
          { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2, color: "text-blue-600" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-green-600" },
          { label: "Cancelled", value: stats.cancelled, icon: XCircle, color: "text-destructive" },
        ].map((s, i) => (
          <Card key={i} className="bg-card/50"><CardContent className="p-3 flex items-center gap-2">
            <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
            <div><p className="text-[10px] text-muted-foreground uppercase">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {/* Calendar View - Room Wise */}
      {calendarView && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold">Room Availability - {format(calendarMonth, "MMMM yyyy")}</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))}>Prev</Button>
              <Button variant="outline" size="sm" onClick={() => setCalendarMonth(new Date())}>Today</Button>
              <Button variant="outline" size="sm" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>Next</Button>
            </div>
          </div>
          <div className="flex gap-3 text-xs items-center">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/20 border border-green-500/40" /> Free</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/40" /> Booked</span>
          </div>
          {rooms.length === 0 ? (
            <p className="text-muted-foreground text-sm">No rooms added yet. Add rooms from the Hotels management page.</p>
          ) : (
            <div className="overflow-x-auto">
              {(() => {
                const start = startOfMonth(calendarMonth);
                const end = endOfMonth(calendarMonth);
                const days = eachDayOfInterval({ start, end });
                return (
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="sticky left-0 bg-card z-10 text-left p-2 border border-border min-w-[120px]">Room</th>
                        {days.map(day => (
                          <th key={day.toISOString()} className={cn("p-1 border border-border min-w-[32px] text-center", isToday(day) && "bg-primary/10")}>
                            <div>{format(day, "d")}</div>
                            <div className="text-[9px] text-muted-foreground">{format(day, "EEE")}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((room: any) => {
                        const hotel = hotels.find((h: any) => h.id === room.hotel_id);
                        return (
                          <tr key={room.id}>
                            <td className="sticky left-0 bg-card z-10 p-2 border border-border text-xs font-medium">
                              <div>{room.room_number}</div>
                              <div className="text-[9px] text-muted-foreground">{hotel?.name || "Unknown"} | {room.ac_type?.toUpperCase()}</div>
                            </td>
                            {days.map(day => {
                              const dayBookings = getRoomBookingsForDate(room.id, day);
                              const isBooked = dayBookings.length > 0;
                              return (
                                <td key={day.toISOString()} className={cn(
                                  "p-0.5 border border-border text-center",
                                  isBooked ? "bg-red-500/15" : "bg-green-500/10",
                                  isToday(day) && "ring-1 ring-primary/30"
                                )}>
                                  {isBooked && <div className="text-[8px] text-red-600 font-medium">{dayBookings.length}</div>}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          )}
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name, email, phone..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-muted-foreground" /></button>}
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><Filter className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No hotel bookings found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((b: any) => {
              const room = getRoomForBooking(b.id);
              const det = getDetailsForBooking(b.id);
              return (
                <div key={b.id} className="border border-border rounded-xl p-4 bg-card/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{b.customer_name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1"><Phone className="w-3 h-3" /> {b.customer_phone}</div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${statusConfig[b.status]?.class || ""}`}>
                      {statusConfig[b.status]?.label || b.status}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {b.reference_name && <div className="flex items-center gap-2 text-muted-foreground"><Hotel className="w-3.5 h-3.5 text-primary" /><span className="text-foreground font-medium">{b.reference_name}</span></div>}
                    {room && <div className="flex items-center gap-2 text-muted-foreground"><BedDouble className="w-3.5 h-3.5 text-primary" /> Room {room.room_number} ({room.ac_type?.toUpperCase()}) - {room.beds} bed(s)</div>}
                    {det?.check_in && det?.check_out && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                        {format(parseISO(det.check_in), "dd MMM")} - {format(parseISO(det.check_out), "dd MMM yyyy")}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-3.5 h-3.5 text-primary" /> {b.num_travelers} guest(s){det ? `, ${det.family_members} family` : ""}</div>
                    {det?.guest_id_number && <div className="flex items-center gap-2 text-muted-foreground"><IdCard className="w-3.5 h-3.5 text-primary" /> {det.guest_id_type?.toUpperCase()}: {det.guest_id_number}</div>}
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-3.5 h-3.5 text-primary" />
                      <Badge variant="outline" className="text-[10px] bg-primary/5">{b.lead_source || "Unknown"}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <select value={b.status} onChange={(e) => updateStatus.mutate({ id: b.id, status: e.target.value })}
                      className="text-xs px-2 py-1.5 rounded-lg border border-input bg-background text-foreground flex-1">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setSelected(b)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => { if (confirm("Delete?")) remove.mutate(b.id); }}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>Hotel Booking Details</DialogTitle></DialogHeader>
          {selected && (() => {
            const det = getDetailsForBooking(selected.id);
            const room = getRoomForBooking(selected.id);
            return (
              <div className="space-y-3 text-sm">
                <DetailRow icon={<Users className="w-4 h-4 text-primary" />} label="Guest" value={selected.customer_name} />
                <DetailRow icon={<Mail className="w-4 h-4 text-primary" />} label="Email" value={selected.customer_email} />
                <DetailRow icon={<Phone className="w-4 h-4 text-primary" />} label="Phone" value={selected.customer_phone} />
                <DetailRow icon={<Hotel className="w-4 h-4 text-primary" />} label="Hotel" value={selected.reference_name || "-"} />
                {room && (
                  <>
                    <DetailRow icon={<BedDouble className="w-4 h-4 text-primary" />} label="Room" value={`${room.room_number} (${room.room_type}) - ${room.ac_type?.toUpperCase()}`} />
                    <DetailRow label="Beds / Pillows / Sheets" value={`${det?.num_beds || room.beds} / ${det?.num_pillows || room.pillows} / ${det?.num_sheets || room.sheets}`} />
                    {room.images?.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Room Images</span>
                        <div className="flex gap-2 flex-wrap">
                          {room.images.filter(Boolean).map((img: string, i: number) => (
                            <img key={i} src={img} alt={`Room ${i+1}`} className="w-16 h-12 rounded object-cover border border-border cursor-pointer" onClick={() => setRoomImagesOpen(room)} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                {det?.check_in && <DetailRow icon={<CalendarIcon className="w-4 h-4 text-primary" />} label="Check-in" value={format(parseISO(det.check_in), "dd MMM yyyy")} />}
                {det?.check_out && <DetailRow label="Check-out" value={format(parseISO(det.check_out), "dd MMM yyyy")} />}
                <DetailRow label="Guests / Family" value={`${selected.num_travelers} guest(s), ${det?.family_members || 1} family member(s)`} />
                {det?.marital_status && <DetailRow icon={<Heart className="w-4 h-4 text-primary" />} label="Marital Status" value={det.marital_status} />}
                {det?.guest_id_type && <DetailRow icon={<IdCard className="w-4 h-4 text-primary" />} label="ID Type" value={det.guest_id_type} />}
                {det?.guest_id_number && <DetailRow label="ID Number" value={det.guest_id_number} />}
                {det?.guest_id_image && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">ID Card Image</span>
                    <img src={det.guest_id_image} alt="ID" className="w-32 h-20 rounded object-cover border border-border" />
                  </div>
                )}
                {det?.special_requests && <DetailRow label="Special Requests" value={det.special_requests} />}
                <DetailRow label="Notes" value={selected.notes || "-"} />
                <DetailRow icon={<Clock className="w-4 h-4 text-primary" />} label="Booked" value={format(new Date(selected.created_at), "dd MMM yyyy, hh:mm a")} />
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Room Images Dialog */}
      <Dialog open={!!roomImagesOpen} onOpenChange={() => setRoomImagesOpen(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Room {roomImagesOpen?.room_number} - Photos</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {roomImagesOpen?.images?.filter(Boolean).map((img: string, i: number) => (
              <img key={i} src={img} alt={`Room photo ${i+1}`} className="w-full h-48 rounded-lg object-cover" />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Hotel Booking" : "Create Hotel Booking"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveBooking.mutate(); }} className="space-y-5">
            {/* Guest Info */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Guest Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Guest Name *</Label><Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required /></div>
                <div className="space-y-1"><Label>Email *</Label><Input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} required /></div>
                <div className="space-y-1"><Label>Phone *</Label><Input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} required /></div>
                <div className="space-y-1"><Label>No. of Guests</Label><Input type="number" min={1} value={form.num_travelers} onChange={(e) => setForm({ ...form, num_travelers: Number(e.target.value) })} /></div>
              </div>
            </div>

            {/* Personal Identity */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><IdCard className="w-4 h-4 text-primary" /> Personal Identity</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>ID Type</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={details.guest_id_type} onChange={(e) => setDetails({ ...details, guest_id_type: e.target.value })}>
                    <option value="aadhar">Aadhar Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                    <option value="voter_id">Voter ID</option>
                    <option value="pan">PAN Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1"><Label>ID Number</Label><Input value={details.guest_id_number} onChange={(e) => setDetails({ ...details, guest_id_number: e.target.value })} placeholder="Enter ID number" /></div>
                <div className="space-y-1"><Label>ID Card Image URL</Label><Input value={details.guest_id_image} onChange={(e) => setDetails({ ...details, guest_id_image: e.target.value })} placeholder="https://..." /></div>
                <div className="space-y-1">
                  <Label>Marital Status</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={details.marital_status} onChange={(e) => setDetails({ ...details, marital_status: e.target.value })}>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1"><Label>Family Members</Label><Input type="number" min={1} value={details.family_members} onChange={(e) => setDetails({ ...details, family_members: Number(e.target.value) })} /></div>
              </div>
            </div>

            {/* Room & Stay */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><BedDouble className="w-4 h-4 text-primary" /> Room & Stay Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Hotel</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={form.reference_name} onChange={(e) => {
                    const h = hotels.find((h: any) => h.name === e.target.value);
                    setForm({ ...form, reference_name: e.target.value, reference_id: h?.id || null });
                    setDetails({ ...details, room_id: null });
                  }}>
                    <option value="">Select hotel</option>
                    {hotels.map((h: any) => <option key={h.id} value={h.name}>{h.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Room</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={details.room_id || ""} onChange={(e) => setDetails({ ...details, room_id: e.target.value || null })}>
                    <option value="">Select room</option>
                    {selectedHotelRooms.map((r: any) => (
                      <option key={r.id} value={r.id}>Room {r.room_number} - {r.room_type} ({r.ac_type?.toUpperCase()}) - {r.beds} bed(s)</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Check-in Date</Label>
                  <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !checkInDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkInDate ? format(checkInDate, "dd MMM yyyy") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={checkInDate} onSelect={(d) => { setCheckInDate(d); setCheckInOpen(false); }} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <Label>Check-out Date</Label>
                  <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !checkOutDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOutDate ? format(checkOutDate, "dd MMM yyyy") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={checkOutDate} onSelect={(d) => { setCheckOutDate(d); setCheckOutOpen(false); }} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="space-y-1"><Label>Beds</Label><Input type="number" min={1} value={details.num_beds} onChange={(e) => setDetails({ ...details, num_beds: Number(e.target.value) })} /></div>
                <div className="space-y-1"><Label>Pillows</Label><Input type="number" min={0} value={details.num_pillows} onChange={(e) => setDetails({ ...details, num_pillows: Number(e.target.value) })} /></div>
                <div className="space-y-1"><Label>Sheets</Label><Input type="number" min={0} value={details.num_sheets} onChange={(e) => setDetails({ ...details, num_sheets: Number(e.target.value) })} /></div>
              </div>
            </div>

            {/* Status & Notes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Lead Source</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={form.lead_source} onChange={(e) => setForm({ ...form, lead_source: e.target.value })}>
                  <option value="">Select source</option>
                  {leadSources.map((src: string) => <option key={src} value={src}>{src}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1"><Label>Special Requests</Label><Textarea value={details.special_requests} onChange={(e) => setDetails({ ...details, special_requests: e.target.value })} rows={2} /></div>
            <div className="space-y-1"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveBooking.isPending}>{saveBooking.isPending ? "Saving..." : editing ? "Update" : "Create"}</Button>
            </div>
          </form>
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
      <span className="font-medium text-foreground break-words">{value}</span>
    </div>
  </div>
);

export default AdminHotelBookings;
