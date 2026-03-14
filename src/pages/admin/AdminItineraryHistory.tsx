import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Search, X, Eye, Trash2, Download, FileText, MapPin, Calendar, Users, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import Pagination from "@/components/Pagination";
import { useNavigate } from "react-router-dom";

const db = (table: string) => (supabase as any).from(table);
const PER_PAGE = 10;

const AdminItineraryHistory = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewOpen, setViewOpen] = useState<any>(null);

  const { data: itineraries = [], isLoading } = useQuery({
    queryKey: ["admin-itineraries"],
    queryFn: async () => {
      const { data } = await db("itineraries").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => { const { data } = await db("site_settings").select("*").limit(1).single(); return data; },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db("itineraries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-itineraries"] }); toast({ title: "Itinerary deleted" }); },
  });

  const filtered = useMemo(() => {
    if (!search) return itineraries;
    const q = search.toLowerCase();
    return itineraries.filter((it: any) =>
      [it.customer_name, it.package_name, it.destination].some((v: string) => v?.toLowerCase().includes(q))
    );
  }, [itineraries, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const generatePDF = (it: any) => {
    const brandColor = settings?.doc_primary_color || "#1a365d";
    const accentColor = settings?.doc_accent_color || "#c9a227";
    const secondaryColor = settings?.doc_secondary_color || "#2d5a87";
    const font = settings?.doc_font_family || "Inter";
    const days = (it.days || []) as any[];

    const headerBar = `<div style="background:${brandColor};padding:14px 40px;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid ${accentColor}">
      <div style="color:#fff;font-size:18px;font-weight:700;letter-spacing:1px">${it.customer_name} — Travel Itinerary</div>
      <div style="color:rgba(255,255,255,0.7);font-size:10px;letter-spacing:1px;text-transform:uppercase">Itinerary</div>
    </div>`;

    const sectionTitle = (title: string) => `<div style="display:flex;align-items:center;gap:12px;margin:28px 0 16px"><div style="width:4px;height:24px;background:${accentColor};border-radius:2px"></div><h2 style="font-size:20px;font-weight:800;color:${brandColor};margin:0">${title}</h2></div>`;

    const daysHtml = days.map((d: any) => {
      let dateStr = "";
      if (it.travel_date) { try { const dd = new Date(it.travel_date); if (!isNaN(dd.getTime())) { dd.setDate(dd.getDate() + d.day - 1); dateStr = format(dd, "EEEE, do MMM"); } } catch(e) {} }
      return `
      <div style="margin-bottom:28px;page-break-inside:avoid">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
          <div style="width:52px;height:52px;border-radius:12px;background:${brandColor};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0">
            <div style="font-size:9px;font-weight:600;text-transform:uppercase;opacity:0.7">Day</div>
            <div style="font-size:18px;font-weight:900;line-height:1">${d.day}</div>
          </div>
          <div>
            <div style="font-size:17px;font-weight:800;color:#1e293b">${d.title || `Day ${d.day}`}</div>
            ${dateStr ? `<div style="font-size:11px;color:#94a3b8">${dateStr}</div>` : ""}
            ${d.hotel ? `<div style="font-size:11px;color:#64748b">🏨 ${d.hotel}</div>` : ""}
          </div>
        </div>
        ${d.image ? `<div style="margin-bottom:14px;border-radius:14px;overflow:hidden;height:200px"><img src="${d.image}" style="width:100%;height:100%;object-fit:cover" /></div>` : ""}
        <div style="padding:18px;background:#f8fafc;border-radius:12px;border-left:4px solid ${accentColor}">
          <p style="font-size:13px;color:#475569;line-height:1.9;margin:0">${d.description || ""}</p>
          ${d.activities ? `<div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap">${d.activities.split(",").map((a: string) => `<span style="background:${brandColor}0a;border:1px solid ${brandColor}20;color:${brandColor};padding:4px 12px;border-radius:6px;font-size:10px;font-weight:600">📍 ${a.trim()}</span>`).join("")}</div>` : ""}
          ${d.meals ? `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${d.meals.split(",").map((m: string) => `<span style="background:#fefce8;color:#854d0e;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:600">🍽 ${m.trim()}</span>`).join("")}</div>` : ""}
        </div>
      </div>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Itinerary - ${it.customer_name}</title>
<style>@import url('https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;500;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'${font}',system-ui,sans-serif;color:#1f2937;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{max-width:850px;margin:0 auto;padding:0}@media print{.page{padding:0}}</style></head><body>
<div class="page">
  <!-- Cover -->
  <div style="position:relative;border-radius:0 0 20px 20px;overflow:hidden;min-height:240px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${brandColor},${secondaryColor})">
    ${it.background_image ? `<img src="${it.background_image}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.3" />` : ""}
    <div style="position:relative;z-index:1;text-align:center;padding:48px 32px;color:#fff">
      <div style="display:inline-block;background:${accentColor};color:#fff;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:5px 18px;border-radius:20px;margin-bottom:16px">Travel Itinerary</div>
      <div style="font-size:32px;font-weight:900;letter-spacing:2px">${it.package_name || "Custom Tour"}</div>
      <div style="font-size:14px;opacity:0.85;margin-top:6px">${it.destination || ""} ${it.duration ? "• " + it.duration : ""}</div>
      ${it.total_price > 0 ? `<div style="margin-top:14px;font-size:22px;font-weight:800;color:${accentColor}">₹${Number(it.total_price).toLocaleString("en-IN")} /-</div>` : ""}
    </div>
  </div>

  <div style="padding:32px 40px">
    <!-- Guest & Trip -->
    <div style="display:flex;gap:20px;margin-bottom:28px">
      <div style="flex:1;background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #e2e8f0">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin-bottom:10px">Guest Details</div>
        <div style="font-size:16px;font-weight:800;color:${brandColor}">${it.customer_name}</div>
        <div style="font-size:12px;color:#64748b;line-height:1.8;margin-top:4px">${it.customer_phone || ""}${it.customer_email ? "<br>" + it.customer_email : ""}<br>${it.num_travelers || 1} Traveler(s)</div>
      </div>
      <div style="flex:1;background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #e2e8f0">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin-bottom:10px">Trip Details</div>
        <div style="font-size:12px;color:#64748b;line-height:2">
          ${it.travel_date ? "<strong style='color:#1e293b'>Date:</strong> " + format(new Date(it.travel_date), "dd MMM yyyy") : ""}
          ${it.pickup_location ? "<br><strong style='color:#1e293b'>Pickup:</strong> " + it.pickup_location : ""}
          ${it.drop_location ? "<br><strong style='color:#1e293b'>Drop:</strong> " + it.drop_location : ""}
        </div>
      </div>
    </div>

    ${(it.vehicle_name || it.driver_name) ? `
    <div style="display:flex;gap:20px;margin-bottom:28px">
      ${it.vehicle_name || it.vehicle_type ? `<div style="flex:1;background:#eff6ff;border-radius:12px;padding:18px;border:1px solid #bfdbfe"><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${brandColor};margin-bottom:6px">🚗 Vehicle</div><div style="font-size:15px;font-weight:700;color:#1e40af">${it.vehicle_name || ""}</div>${it.vehicle_type ? `<div style="font-size:11px;color:#3b82f6">${it.vehicle_type}</div>` : ""}</div>` : ""}
      ${it.driver_name ? `<div style="flex:1;background:#f0fdf4;border-radius:12px;padding:18px;border:1px solid #bbf7d0"><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#16a34a;margin-bottom:6px">👤 Driver</div><div style="font-size:15px;font-weight:700;color:#166534">${it.driver_name}</div>${it.driver_phone ? `<div style="font-size:11px;color:#22c55e">☎ ${it.driver_phone}</div>` : ""}</div>` : ""}
    </div>` : ""}

    ${sectionTitle("Day-wise Itinerary")}
    ${daysHtml}

    ${(it.inclusions || it.exclusions) ? `
    <div style="display:flex;gap:20px;margin-bottom:28px">
      ${it.inclusions ? `<div style="flex:1;background:#f0fdf4;border-radius:14px;padding:24px;border:1px solid #bbf7d0"><div style="font-size:13px;font-weight:800;color:#166534;margin-bottom:12px">✅ Inclusions</div><ul style="font-size:12px;color:#374151;line-height:2;padding-left:16px;margin:0">${it.inclusions.split("\n").filter(Boolean).map((i: string) => `<li>${i}</li>`).join("")}</ul></div>` : ""}
      ${it.exclusions ? `<div style="flex:1;background:#fef2f2;border-radius:14px;padding:24px;border:1px solid #fecaca"><div style="font-size:13px;font-weight:800;color:#991b1b;margin-bottom:12px">❌ Exclusions</div><ul style="font-size:12px;color:#374151;line-height:2;padding-left:16px;margin:0">${it.exclusions.split("\n").filter(Boolean).map((i: string) => `<li>${i}</li>`).join("")}</ul></div>` : ""}
    </div>` : ""}

    ${it.special_notes ? `<div style="background:#fffbeb;border-radius:12px;padding:20px;border:1px solid #fde68a;margin-bottom:24px"><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#d97706;margin-bottom:8px">⚠ Important Notes</div><p style="font-size:12px;color:#92400e;line-height:1.8;margin:0;white-space:pre-line">${it.special_notes}</p></div>` : ""}

    ${it.emergency_contact ? `<div style="background:#fef2f2;border-radius:12px;padding:16px 20px;border:1px solid #fecaca;margin-bottom:24px"><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#dc2626;margin-bottom:4px">🆘 Emergency Contact</div><div style="font-size:14px;font-weight:800;color:#991b1b">${it.emergency_contact}</div></div>` : ""}

    <div style="margin-top:40px;padding:28px;background:linear-gradient(135deg,${brandColor},${secondaryColor});border-radius:16px;text-align:center;color:#fff">
      <div style="font-size:18px;font-weight:800;letter-spacing:1px">Have a wonderful trip! ✈</div>
      <div style="font-size:11px;opacity:0.7;margin-top:8px">This itinerary is subject to change based on weather and local conditions.</div>
    </div>
  </div>
</div></body></html>`;

    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 600); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" /> Itinerary History ({itineraries.length})
        </h2>
        <Button onClick={() => navigate("/admin/itinerary")}>Create New Itinerary</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by customer, package, destination..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3" /></button>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: itineraries.length, icon: FileText },
          { label: "This Month", value: itineraries.filter((i: any) => new Date(i.created_at).getMonth() === new Date().getMonth()).length, icon: Calendar },
          { label: "Unique Customers", value: new Set(itineraries.map((i: any) => i.customer_name)).size, icon: Users },
          { label: "Total Value", value: `₹${itineraries.reduce((s: number, i: any) => s + Number(i.total_price || 0), 0).toLocaleString()}`, icon: IndianRupee },
        ].map((s, i) => (
          <Card key={i} className="bg-card/50"><CardContent className="p-3 flex items-center gap-2">
            <s.icon className="w-5 h-5 text-primary shrink-0" />
            <div><p className="text-[10px] text-muted-foreground uppercase">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No itineraries found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden sm:table-cell">Package</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Destination</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Travel Date</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Price</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {paginated.map((it: any) => (
                  <tr key={it.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-2">
                      <div className="font-medium">{it.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{it.customer_phone}</div>
                    </td>
                    <td className="py-3 px-2 hidden sm:table-cell">{it.package_name || "Custom"}</td>
                    <td className="py-3 px-2 hidden md:table-cell">
                      <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-muted-foreground" /> {it.destination || "-"}</div>
                    </td>
                    <td className="py-3 px-2 hidden md:table-cell text-muted-foreground">
                      {it.travel_date ? format(new Date(it.travel_date), "dd MMM yyyy") : "-"}
                    </td>
                    <td className="py-3 px-2 text-right font-semibold">
                      {it.total_price > 0 ? `₹${Number(it.total_price).toLocaleString()}` : "-"}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewOpen(it)}><Eye className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => generatePDF(it)}><Download className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { if (confirm("Delete this itinerary?")) remove.mutate(it.id); }}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewOpen} onOpenChange={() => setViewOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Itinerary - {viewOpen?.customer_name}</DialogTitle></DialogHeader>
          {viewOpen && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground font-medium uppercase">Customer</p><p className="font-semibold">{viewOpen.customer_name}</p><p className="text-muted-foreground">{viewOpen.customer_phone}</p><p className="text-muted-foreground">{viewOpen.customer_email}</p></div>
                <div className="text-right"><p className="text-xs text-muted-foreground font-medium uppercase">Trip</p><p className="font-semibold">{viewOpen.package_name || "Custom Tour"}</p><p className="text-muted-foreground">{viewOpen.destination}</p><p className="text-muted-foreground">{viewOpen.duration}</p></div>
              </div>
              {viewOpen.total_price > 0 && (
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <span className="font-bold text-lg text-primary">₹{Number(viewOpen.total_price).toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground ml-2">{viewOpen.price_includes_driver ? "(incl. driver)" : "(excl. driver)"}</span>
                </div>
              )}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Day-wise Plan</p>
                {(viewOpen.days || []).map((d: any, idx: number) => (
                  <div key={idx} className="border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">Day {d.day}</Badge>
                      <span className="font-medium text-sm">{d.title}</span>
                    </div>
                    {d.image && <img src={d.image} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />}
                    <p className="text-sm text-muted-foreground">{d.description}</p>
                    {d.hotel && <p className="text-xs text-muted-foreground mt-1">Stay: {d.hotel}</p>}
                  </div>
                ))}
              </div>
              <Button onClick={() => generatePDF(viewOpen)} className="w-full"><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminItineraryHistory;
