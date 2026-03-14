import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Pagination from "@/components/Pagination";

const db = (table: string) => (supabase as any).from(table);
const empty = { title: "", description: "", discount_percent: "" as string, discount_text: "", image: "", is_active: true, valid_from: "", valid_until: "" };
const PER_PAGE = 10;

const AdminOffers = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => { const { data } = await db("special_offers").select("*").order("created_at", { ascending: false }); return data || []; },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((o: any) => o.title?.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q));
  }, [items, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, discount_percent: form.discount_percent ? Number(form.discount_percent) : null, valid_from: form.valid_from || null, valid_until: form.valid_until || null };
      if (editing) { const { error } = await db("special_offers").update(payload).eq("id", editing.id); if (error) throw error; }
      else { const { error } = await db("special_offers").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-offers"] }); setOpen(false); setEditing(null); setForm(empty); toast({ title: editing ? "Updated" : "Created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("special_offers").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-offers"] }); toast({ title: "Deleted" }); },
  });

  const openEdit = (o: any) => { setEditing(o); setForm({ title: o.title, description: o.description, discount_percent: o.discount_percent?.toString() || "", discount_text: o.discount_text || "", image: o.image, is_active: o.is_active, valid_from: o.valid_from?.split("T")[0] || "", valid_until: o.valid_until?.split("T")[0] || "" }); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Special Offers ({items.length})</h2>
        <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}><Plus className="w-4 h-4 mr-1" /> Add Offer</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search offers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3" /></button>}
      </div>
      {isLoading ? <p>Loading...</p> : (
        <>
          <Table>
            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Discount</TableHead><TableHead>Active</TableHead><TableHead>Valid Until</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {paginated.map((o: any) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.title}</TableCell>
                  <TableCell>{o.discount_percent ? `${o.discount_percent}%` : o.discount_text || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={o.is_active ? "default" : "secondary"}>{o.is_active ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell>{o.valid_until ? new Date(o.valid_until).toLocaleDateString() : "-"}</TableCell>
                  <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => openEdit(o)}><Pencil className="w-4 h-4" /></Button><Button size="icon" variant="ghost" onClick={() => remove.mutate(o.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Offer" : "New Offer"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Discount %</Label><Input type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} /></div>
              <div className="space-y-2"><Label>Discount Text</Label><Input value={form.discount_text} onChange={(e) => setForm({ ...form, discount_text: e.target.value })} /></div>
              <div className="space-y-2"><Label>Valid From</Label><Input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} /></div>
              <div className="space-y-2"><Label>Valid Until</Label><Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
              <Label>Active</Label>
            </div>
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

export default AdminOffers;
