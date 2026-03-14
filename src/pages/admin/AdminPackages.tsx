import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, GripVertical, Link2, Hotel, X, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Pagination from "@/components/Pagination";

const db = (table: string) => (supabase as any).from(table);
const PER_PAGE = 10;

interface ItineraryDay { title: string; description: string; }

const emptyPkg = {
  name: "", destination: "", duration: "", price: 0, original_price: null as number | null,
  description: "", short_description: "", image: "", images: [] as string[],
  itinerary: [] as string[], inclusions: [] as string[], exclusions: [] as string[],
  is_featured: false, brochure_url: "", tour_type: "domestic",
  additional_notes: "", special_features: [] as string[]
};

const parseItinerary = (items: string[]): ItineraryDay[] => items.map((item) => { const sep = item.indexOf("|"); return sep > -1 ? { title: item.slice(0, sep).trim(), description: item.slice(sep + 1).trim() } : { title: item, description: "" }; });
const serializeItinerary = (days: ItineraryDay[]): string[] => days.filter((d) => d.title.trim()).map((d) => d.description ? `${d.title} | ${d.description}` : d.title);

const AdminPackages = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [relOpen, setRelOpen] = useState(false);
  const [relPkgId, setRelPkgId] = useState<string | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyPkg);
  const [itDays, setItDays] = useState<ItineraryDay[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => { const { data } = await db("packages").select("*").order("created_at", { ascending: false }); return data || []; },
  });

  const { data: allHotels = [] } = useQuery({
    queryKey: ["admin-all-hotels"],
    queryFn: async () => { const { data } = await db("hotels").select("id, name, destination, location").order("name"); return data || []; },
  });

  const { data: assignedRelPkgs = [] } = useQuery({
    queryKey: ["assigned-related-pkgs", relPkgId],
    enabled: !!relPkgId,
    queryFn: async () => { const { data } = await db("related_packages").select("related_package_id").eq("package_id", relPkgId!).order("sort_order"); return data?.map((r: any) => r.related_package_id) || []; },
  });

  const { data: assignedRelHotels = [] } = useQuery({
    queryKey: ["assigned-related-hotels", relPkgId],
    enabled: !!relPkgId,
    queryFn: async () => { const { data } = await db("related_hotels").select("hotel_id").eq("package_id", relPkgId!).order("sort_order"); return data?.map((r: any) => r.hotel_id) || []; },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return packages;
    const q = search.toLowerCase();
    return packages.filter((p: any) => p.name?.toLowerCase().includes(q) || p.destination?.toLowerCase().includes(q));
  }, [packages, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, itinerary: serializeItinerary(itDays), images: form.images.filter(Boolean), inclusions: form.inclusions.filter(Boolean), exclusions: form.exclusions.filter(Boolean), special_features: form.special_features.filter(Boolean) };
      if (editing) { const { error } = await db("packages").update(payload).eq("id", editing.id); if (error) throw error; }
      else { const { error } = await db("packages").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-packages"] }); setOpen(false); setEditing(null); setForm(emptyPkg); setItDays([]); toast({ title: editing ? "Package updated" : "Package created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("packages").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-packages"] }); toast({ title: "Package deleted" }); },
  });

  const toggleRelatedPackage = useMutation({
    mutationFn: async ({ pkgId, relId, add }: { pkgId: string; relId: string; add: boolean }) => {
      if (add) { const { error } = await db("related_packages").insert({ package_id: pkgId, related_package_id: relId }); if (error) throw error; }
      else { const { error } = await db("related_packages").delete().eq("package_id", pkgId).eq("related_package_id", relId); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assigned-related-pkgs", relPkgId] }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleRelatedHotel = useMutation({
    mutationFn: async ({ pkgId, hotelId, add }: { pkgId: string; hotelId: string; add: boolean }) => {
      if (add) { const { error } = await db("related_hotels").insert({ package_id: pkgId, hotel_id: hotelId }); if (error) throw error; }
      else { const { error } = await db("related_hotels").delete().eq("package_id", pkgId).eq("hotel_id", hotelId); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assigned-related-hotels", relPkgId] }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openEdit = (pkg: any) => {
    setEditing(pkg);
    setForm({ name: pkg.name, destination: pkg.destination, duration: pkg.duration, price: pkg.price, original_price: pkg.original_price, description: pkg.description, short_description: pkg.short_description || "", image: pkg.image, images: pkg.images || [], itinerary: pkg.itinerary || [], inclusions: pkg.inclusions || [], exclusions: pkg.exclusions || [], is_featured: pkg.is_featured, brochure_url: pkg.brochure_url || "", tour_type: pkg.tour_type || "domestic", additional_notes: pkg.additional_notes || "", special_features: pkg.special_features || [] });
    setItDays(parseItinerary(pkg.itinerary || []));
    setOpen(true);
  };

  const openNew = () => { setEditing(null); setForm(emptyPkg); setItDays([]); setOpen(true); };
  const openRelations = (pkg: any) => { setRelPkgId(pkg.id); setRelOpen(true); };
  const addDay = () => setItDays([...itDays, { title: `Day ${itDays.length + 1}`, description: "" }]);
  const removeDay = (i: number) => setItDays(itDays.filter((_, idx) => idx !== i));
  const updateDay = (i: number, field: keyof ItineraryDay, value: string) => { const updated = [...itDays]; updated[i] = { ...updated[i], [field]: value }; setItDays(updated); };
  const relPkg = packages.find((p: any) => p.id === relPkgId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Packages ({packages.length})</h2>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Add Package</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search packages..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3" /></button>}
      </div>
      {isLoading ? <p>Loading...</p> : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>Destination</TableHead><TableHead>Price</TableHead><TableHead>Duration</TableHead><TableHead>Type</TableHead><TableHead>Featured</TableHead><TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((pkg: any) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.destination}</TableCell>
                  <TableCell>₹{pkg.price?.toLocaleString()}</TableCell>
                  <TableCell>{pkg.duration}</TableCell>
                  <TableCell><Badge variant={pkg.tour_type === "international" ? "secondary" : "outline"} className="capitalize">{pkg.tour_type || "domestic"}</Badge></TableCell>
                  <TableCell>{pkg.is_featured ? "✅" : ""}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openRelations(pkg)} title="Manage related"><Link2 className="w-4 h-4 text-primary" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => openEdit(pkg)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove.mutate(pkg.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}

      {/* Edit/Create Package Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Package" : "New Package"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Package Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Destination *</Label><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Duration</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="5 Days / 4 Nights" /></div>
              <div className="space-y-2"><Label>Price (₹) *</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Original Price (₹)</Label><Input type="number" value={form.original_price || ""} onChange={(e) => setForm({ ...form, original_price: e.target.value ? Number(e.target.value) : null })} /></div>
              <div className="space-y-2"><Label>Cover Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tour Type</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.tour_type} onChange={(e) => setForm({ ...form, tour_type: e.target.value })}>
                  <option value="domestic">Domestic</option><option value="international">International</option>
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="rounded" />
                  <span className="text-sm font-medium">Featured Package</span>
                </label>
              </div>
            </div>
            <div className="space-y-2"><Label>Short Description</Label><Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></div>
            <div className="space-y-2"><Label>Full Description</Label><RichTextEditor content={form.description} onChange={(html) => setForm({ ...form, description: html })} /></div>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><Label className="text-base font-semibold">Itinerary ({itDays.length} days)</Label><Button type="button" size="sm" variant="outline" onClick={addDay}><Plus className="w-3 h-3 mr-1" /> Add Day</Button></div>
              {itDays.map((day, i) => (
                <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-1 pt-2 text-muted-foreground"><GripVertical className="w-4 h-4" /><span className="text-xs font-bold w-8">D{i + 1}</span></div>
                  <div className="flex-1 space-y-2">
                    <Input placeholder={`Day ${i + 1} Title`} value={day.title} onChange={(e) => updateDay(i, "title", e.target.value)} />
                    <Textarea placeholder="Description..." rows={2} value={day.description} onChange={(e) => updateDay(i, "description", e.target.value)} />
                  </div>
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeDay(i)} className="mt-1"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              ))}
              {itDays.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No itinerary days.</p>}
            </div>
            <div className="space-y-2"><Label>Inclusions (one per line)</Label><Textarea rows={3} value={form.inclusions.join("\n")} onChange={(e) => setForm({ ...form, inclusions: e.target.value.split("\n") })} /></div>
            <div className="space-y-2"><Label>Exclusions (one per line)</Label><Textarea rows={3} value={form.exclusions.join("\n")} onChange={(e) => setForm({ ...form, exclusions: e.target.value.split("\n") })} /></div>
            <div className="space-y-2"><Label>Special Features (one per line)</Label><Textarea rows={3} value={form.special_features.join("\n")} onChange={(e) => setForm({ ...form, special_features: e.target.value.split("\n") })} /></div>
            <div className="space-y-2"><Label>Additional Notes</Label><Textarea rows={3} value={form.additional_notes} onChange={(e) => setForm({ ...form, additional_notes: e.target.value })} /></div>
            <div className="space-y-2"><Label>Gallery Images (one URL per line)</Label><Textarea rows={2} value={form.images.join("\n")} onChange={(e) => setForm({ ...form, images: e.target.value.split("\n") })} /></div>
            <div className="space-y-2"><Label>Brochure URL</Label><Input value={form.brochure_url} onChange={(e) => setForm({ ...form, brochure_url: e.target.value })} /></div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save Package"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Relations Dialog */}
      <Dialog open={relOpen} onOpenChange={setRelOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Link2 className="w-5 h-5 text-primary" />Manage Relations — {relPkg?.name}</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Link2 className="w-4 h-4" /> Related Packages</h3>
              <p className="text-xs text-muted-foreground mb-3">Select packages to show as "Related" on this package's detail page.</p>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-border rounded-lg p-3">
                {packages.filter((p: any) => p.id !== relPkgId).map((p: any) => {
                  const isAssigned = assignedRelPkgs.includes(p.id);
                  return (
                    <label key={p.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isAssigned ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"}`}>
                      <Checkbox checked={isAssigned} onCheckedChange={(checked) => toggleRelatedPackage.mutate({ pkgId: relPkgId!, relId: p.id, add: !!checked })} />
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p><p className="text-xs text-muted-foreground">{p.destination} • {p.duration} • ₹{p.price?.toLocaleString()}</p></div>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Hotel className="w-4 h-4" /> Related Hotels</h3>
              <p className="text-xs text-muted-foreground mb-3">Select hotels to show on this package's detail page.</p>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-border rounded-lg p-3">
                {allHotels.map((h: any) => {
                  const isAssigned = assignedRelHotels.includes(h.id);
                  return (
                    <label key={h.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isAssigned ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"}`}>
                      <Checkbox checked={isAssigned} onCheckedChange={(checked) => toggleRelatedHotel.mutate({ pkgId: relPkgId!, hotelId: h.id, add: !!checked })} />
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{h.name}</p><p className="text-xs text-muted-foreground">{h.destination} • {h.location}</p></div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPackages;