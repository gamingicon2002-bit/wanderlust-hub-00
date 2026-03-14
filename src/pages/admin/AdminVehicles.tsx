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
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import Pagination from "@/components/Pagination";

const db = (table: string) => (supabase as any).from(table);
const empty = {
  name: "", type: "", sub_type: "", model: "", description: "", short_description: "", image: "",
  images: [] as string[], capacity: 0, price_per_km: "" as string, price_per_day: "" as string,
  fuel_type: "", transmission: "", features: [] as string[], rental_options: [] as string[], brochure_url: ""
};
const PER_PAGE = 10;

const AdminVehicles = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const { mainTypes, getSubTypes, getLabel } = useVehicleTypes();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-vehicles"],
    queryFn: async () => { const { data } = await db("vehicles").select("*").order("created_at", { ascending: false }); return data || []; },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((v: any) => v.name?.toLowerCase().includes(q) || v.model?.toLowerCase().includes(q) || v.type?.toLowerCase().includes(q));
  }, [items, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, price_per_km: form.price_per_km ? Number(form.price_per_km) : null, price_per_day: form.price_per_day ? Number(form.price_per_day) : null, images: form.images.filter(Boolean), features: form.features.filter(Boolean), rental_options: form.rental_options.filter(Boolean) };
      if (editing) { const { error } = await db("vehicles").update(payload).eq("id", editing.id); if (error) throw error; }
      else { const { error } = await db("vehicles").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-vehicles"] }); setOpen(false); setEditing(null); setForm(empty); toast({ title: editing ? "Updated" : "Created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("vehicles").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-vehicles"] }); toast({ title: "Deleted" }); },
  });

  const openEdit = (v: any) => {
    setEditing(v);
    setForm({ name: v.name, type: v.type, sub_type: v.sub_type || "", model: v.model || "", description: v.description, short_description: v.short_description || "", image: v.image, images: v.images || [], capacity: v.capacity, price_per_km: v.price_per_km?.toString() || "", price_per_day: v.price_per_day?.toString() || "", fuel_type: v.fuel_type || "", transmission: v.transmission || "", features: v.features || [], rental_options: v.rental_options || [], brochure_url: v.brochure_url || "" });
    setOpen(true);
  };

  const currentSubTypes = getSubTypes(form.type);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Vehicles ({items.length})</h2>
        <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}><Plus className="w-4 h-4 mr-1" /> Add Vehicle</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search vehicles..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3" /></button>}
      </div>
      {isLoading ? <p>Loading...</p> : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Sub Type</TableHead><TableHead>Model</TableHead><TableHead>Seats</TableHead><TableHead>₹/km</TableHead><TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((v: any) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{getLabel(v.type)}</Badge></TableCell>
                  <TableCell>{v.sub_type ? <Badge variant="secondary" className="capitalize">{getLabel(v.sub_type)}</Badge> : "—"}</TableCell>
                  <TableCell>{v.model || "—"}</TableCell>
                  <TableCell>{v.capacity}</TableCell>
                  <TableCell>{v.price_per_km ? `₹${v.price_per_km}` : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(v)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove.mutate(v.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Vehicle" : "New Vehicle"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Type *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, sub_type: "" })}>
                  <option value="">Select type</option>
                  {mainTypes.map((t) => <option key={t.name} value={t.name}>{t.icon} {t.label}</option>)}
                </select>
              </div>
              {currentSubTypes.length > 0 && (
                <div className="space-y-2"><Label>Sub Type</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.sub_type} onChange={(e) => setForm({ ...form, sub_type: e.target.value })}>
                    <option value="">Select sub type</option>
                    {currentSubTypes.map((st) => <option key={st.name} value={st.name}>{st.label}</option>)}
                  </select>
                </div>
              )}
              <div className="space-y-2"><Label>Model</Label><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></div>
              <div className="space-y-2"><Label>Capacity (seats)</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Price per km (₹)</Label><Input value={form.price_per_km} onChange={(e) => setForm({ ...form, price_per_km: e.target.value })} /></div>
              <div className="space-y-2"><Label>Price per day (₹)</Label><Input value={form.price_per_day} onChange={(e) => setForm({ ...form, price_per_day: e.target.value })} /></div>
              <div className="space-y-2"><Label>Fuel Type</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.fuel_type} onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}>
                  <option value="">Select</option><option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="CNG">CNG</option><option value="Electric">Electric</option><option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Transmission</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })}>
                  <option value="">Select</option><option value="Manual">Manual</option><option value="Automatic">Automatic</option>
                </select>
              </div>
            </div>
            <div className="space-y-2"><Label>Main Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><RichTextEditor content={form.description} onChange={(html) => setForm({ ...form, description: html })} /></div>
            <div className="space-y-2"><Label>Short Description</Label><Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></div>
            <div className="space-y-2"><Label>Additional Images (one per line)</Label><Textarea rows={2} value={form.images.join("\n")} onChange={(e) => setForm({ ...form, images: e.target.value.split("\n") })} /></div>
            <div className="space-y-2"><Label>Features (one per line)</Label><Textarea rows={3} value={form.features.join("\n")} onChange={(e) => setForm({ ...form, features: e.target.value.split("\n") })} /></div>
            <div className="space-y-2"><Label>Rental Options (one per line)</Label><Textarea rows={2} value={form.rental_options.join("\n")} onChange={(e) => setForm({ ...form, rental_options: e.target.value.split("\n") })} /></div>
            <div className="space-y-2"><Label>Brochure URL</Label><Input value={form.brochure_url} onChange={(e) => setForm({ ...form, brochure_url: e.target.value })} /></div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVehicles;