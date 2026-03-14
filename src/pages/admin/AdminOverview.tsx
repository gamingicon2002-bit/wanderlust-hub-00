import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfDay, isAfter } from "date-fns";
import { Link } from "react-router-dom";
import {
  Package, Car, MapPin, CalendarCheck, Users, Hotel,
  TrendingUp, IndianRupee, Clock, Star, FileText,
  Hourglass, CheckCircle2, XCircle, ArrowRight, Eye, Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModuleAccess } from "@/hooks/useModuleAccess";

const db = (table: string) => (supabase as any).from(table);

const AdminOverview = () => {
  const { mode, isModuleVisible } = useModuleAccess();

  const { data: bookings = [] } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => { const { data } = await db("bookings").select("*").order("created_at", { ascending: false }); return data || []; },
    enabled: isModuleVisible("bookings"),
  });

  const { data: packages = [] } = useQuery({
    queryKey: ["overview-packages"],
    queryFn: async () => { const { data } = await db("packages").select("id").order("created_at", { ascending: false }); return data || []; },
    enabled: isModuleVisible("packages"),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["overview-vehicles"],
    queryFn: async () => { const { data } = await db("vehicles").select("id").order("created_at", { ascending: false }); return data || []; },
    enabled: isModuleVisible("vehicles"),
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["overview-drivers"],
    queryFn: async () => { const { data } = await db("drivers").select("id, is_active"); return data || []; },
    enabled: isModuleVisible("drivers"),
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ["overview-destinations"],
    queryFn: async () => { const { data } = await db("destinations").select("id"); return data || []; },
    enabled: isModuleVisible("destinations"),
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ["overview-hotels"],
    queryFn: async () => { const { data } = await db("hotels").select("id"); return data || []; },
    enabled: isModuleVisible("hotels"),
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["overview-invoices"],
    queryFn: async () => { const { data } = await db("invoices").select("id, total, status"); return data || []; },
    enabled: isModuleVisible("invoices"),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["overview-reviews"],
    queryFn: async () => { const { data } = await db("reviews").select("id, status, rating"); return data || []; },
    enabled: isModuleVisible("reviews"),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["overview-contacts"],
    queryFn: async () => { const { data } = await db("contact_submissions").select("id").order("created_at", { ascending: false }).limit(5); return data || []; },
    enabled: isModuleVisible("contacts"),
  });

  const today = startOfDay(new Date());
  const pending = bookings.filter((b: any) => b.status === "pending").length;
  const confirmed = bookings.filter((b: any) => b.status === "confirmed").length;
  const inProgress = bookings.filter((b: any) => b.status === "in_progress").length;
  const completed = bookings.filter((b: any) => b.status === "completed").length;
  const cancelled = bookings.filter((b: any) => b.status === "cancelled").length;
  const upcoming = bookings.filter((b: any) => b.travel_date && isAfter(startOfDay(new Date(b.travel_date)), today)).length;
  const revenue = invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + Number(i.total || 0), 0);
  const pendingRevenue = invoices.filter((i: any) => ["sent", "overdue"].includes(i.status)).reduce((s: number, i: any) => s + Number(i.total || 0), 0);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : "—";
  const recentBookings = bookings.slice(0, 8);

  // Lead source analytics
  const leadStats = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    bookings.forEach((b: any) => {
      const src = b.lead_source || "Unknown";
      if (!map[src]) map[src] = { count: 0, revenue: 0 };
      map[src].count++;
    });
    // Add revenue from invoices by matching bookings
    invoices.filter((i: any) => i.status === "paid").forEach((inv: any) => {
      const booking = inv.booking_id ? bookings.find((b: any) => b.id === inv.booking_id) : null;
      const src = booking?.lead_source || "Unknown";
      if (!map[src]) map[src] = { count: 0, revenue: 0 };
      map[src].revenue += Number(inv.total || 0);
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [bookings, invoices]);

  const statusConfig: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-yellow-500/10 text-yellow-600" },
    confirmed: { label: "Confirmed", cls: "bg-blue-500/10 text-blue-600" },
    in_progress: { label: "In Progress", cls: "bg-purple-500/10 text-purple-600" },
    completed: { label: "Completed", cls: "bg-green-500/10 text-green-600" },
    cancelled: { label: "Cancelled", cls: "bg-destructive/10 text-destructive" },
  };

  const modeLabel: Record<string, string> = {
    full: "Full Travel Agency",
    package_only: "Package System",
    hotel_only: "Hotel System",
    invoice_only: "Invoice System",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Welcome back! Mode: <span className="font-semibold text-primary">{modeLabel[mode] || "Full"}</span></p>
      </div>

      {/* Revenue & Booking Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isModuleVisible("invoices") && <StatCard icon={IndianRupee} label="Revenue" value={`₹${revenue.toLocaleString()}`} color="text-green-600" />}
        {isModuleVisible("invoices") && <StatCard icon={IndianRupee} label="Pending Due" value={`₹${pendingRevenue.toLocaleString()}`} color="text-yellow-600" />}
        {isModuleVisible("bookings") && <StatCard icon={CalendarCheck} label="Total Bookings" value={bookings.length} color="text-primary" />}
        {isModuleVisible("reviews") && <StatCard icon={Star} label="Avg Rating" value={avgRating} color="text-yellow-500" />}
      </div>

      {/* Booking Status - only if bookings visible */}
      {isModuleVisible("bookings") && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <StatCard icon={Hourglass} label="Pending" value={pending} color="text-yellow-600" small />
          <StatCard icon={CheckCircle2} label="Confirmed" value={confirmed} color="text-blue-600" small />
          <StatCard icon={ArrowRight} label="In Progress" value={inProgress} color="text-purple-600" small />
          <StatCard icon={CheckCircle2} label="Completed" value={completed} color="text-green-600" small />
          <StatCard icon={XCircle} label="Cancelled" value={cancelled} color="text-destructive" small />
          <StatCard icon={CalendarCheck} label="Upcoming" value={upcoming} color="text-primary" small />
        </div>
      )}

      {/* Inventory Summary - adaptive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {isModuleVisible("packages") && <InventoryCard icon={Package} label="Packages" value={packages.length} to="/admin/packages" />}
        {isModuleVisible("vehicles") && <InventoryCard icon={Car} label="Vehicles" value={vehicles.length} to="/admin/vehicles" />}
        {isModuleVisible("drivers") && <InventoryCard icon={Users} label="Drivers" value={`${drivers.filter((d: any) => d.is_active).length}/${drivers.length}`} to="/admin/drivers" />}
        {isModuleVisible("destinations") && <InventoryCard icon={MapPin} label="Destinations" value={destinations.length} to="/admin/destinations" />}
        {isModuleVisible("hotels") && <InventoryCard icon={Hotel} label="Hotels" value={hotels.length} to="/admin/hotels" />}
        {isModuleVisible("invoices") && <InventoryCard icon={FileText} label="Invoices" value={invoices.length} to="/admin/invoices" />}
      </div>

      {/* Lead Source Analytics */}
      {isModuleVisible("bookings") && leadStats.length > 0 && (
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><Megaphone className="w-4 h-4 text-primary" /> Lead Source Performance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {leadStats.slice(0, 6).map(([source, stats]) => {
                const maxCount = Math.max(...leadStats.map(([, s]) => s.count), 1);
                const pct = Math.round((stats.count / maxCount) * 100);
                return (
                  <div key={source} className="border border-border rounded-lg p-3 space-y-1.5">
                    <Badge variant="outline" className="text-[10px]">{source}</Badge>
                    <p className="text-lg font-bold">{stats.count}</p>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">₹{stats.revenue.toLocaleString()} revenue</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Bookings */}
      {isModuleVisible("bookings") && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Recent Bookings</h3>
            <Link to="/admin/bookings"><Button variant="ghost" size="sm" className="gap-1 text-xs"><Eye className="w-3 h-3" /> View All</Button></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-2 font-medium text-muted-foreground text-xs">Customer</th>
                  <th className="text-left py-2.5 px-2 font-medium text-muted-foreground text-xs hidden sm:table-cell">Package/Vehicle</th>
                  <th className="text-left py-2.5 px-2 font-medium text-muted-foreground text-xs hidden md:table-cell">Date</th>
                  <th className="text-left py-2.5 px-2 font-medium text-muted-foreground text-xs hidden lg:table-cell">Source</th>
                  <th className="text-center py-2.5 px-2 font-medium text-muted-foreground text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b: any) => (
                  <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 px-2">
                      <p className="font-medium text-foreground">{b.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{b.customer_phone}</p>
                    </td>
                    <td className="py-2.5 px-2 hidden sm:table-cell text-muted-foreground">{b.reference_name || "—"}</td>
                    <td className="py-2.5 px-2 hidden md:table-cell text-muted-foreground text-xs">{b.travel_date ? format(new Date(b.travel_date), "dd MMM yyyy") : "—"}</td>
                    <td className="py-2.5 px-2 hidden lg:table-cell">
                      {b.lead_source ? <Badge variant="outline" className="text-[10px]">{b.lead_source}</Badge> : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <Badge variant="outline" className={`text-[10px] ${statusConfig[b.status]?.cls || ""}`}>
                        {statusConfig[b.status]?.label || b.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {recentBookings.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No bookings yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice-only: show invoice summary */}
      {mode === "invoice_only" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Invoice Summary</h3>
            <Link to="/admin/invoices"><Button variant="ghost" size="sm" className="gap-1 text-xs"><Eye className="w-3 h-3" /> View All</Button></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={FileText} label="Total Invoices" value={invoices.length} color="text-primary" />
            <StatCard icon={CheckCircle2} label="Paid" value={invoices.filter((i: any) => i.status === "paid").length} color="text-green-600" />
            <StatCard icon={Hourglass} label="Pending" value={invoices.filter((i: any) => i.status === "sent").length} color="text-yellow-600" />
            <StatCard icon={XCircle} label="Overdue" value={invoices.filter((i: any) => i.status === "overdue").length} color="text-destructive" />
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, small }: { icon: any; label: string; value: any; color: string; small?: boolean }) => (
  <Card className="bg-card/50">
    <CardContent className={`${small ? "p-2.5" : "p-3"} flex items-center gap-2`}>
      <Icon className={`${small ? "w-4 h-4" : "w-5 h-5"} ${color} shrink-0`} />
      <div>
        <p className={`${small ? "text-[9px]" : "text-[10px]"} text-muted-foreground uppercase`}>{label}</p>
        <p className={`${small ? "text-base" : "text-lg"} font-bold`}>{value}</p>
      </div>
    </CardContent>
  </Card>
);

const InventoryCard = ({ icon: Icon, label, value, to }: { icon: any; label: string; value: any; to: string }) => (
  <Link to={to}>
    <Card className="bg-card/50 hover:bg-muted/50 transition-colors cursor-pointer">
      <CardContent className="p-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default AdminOverview;
