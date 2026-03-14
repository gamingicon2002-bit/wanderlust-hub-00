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
import RichTextEditor from "@/components/RichTextEditor";
import Pagination from "@/components/Pagination";

const db = (table: string) => (supabase as any).from(table);
const empty = { name: "", description: "", short_description: "", image: "", images: [] as string[], highlights: [] as string[], best_time: "", brochure_url: "" };
const PER_PAGE = 10;

const AdminDestinations = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-destinations"],
    queryFn: async () => { const { data } = await db("destinations").select("*").order("created_at", { ascending: false }); return data || []; },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((d: any) => d.name?.toLowerCase().includes(q));
  }, [items, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, images: form.images.filter(Boolean), highlights: form.highlights.filter(Boolean) };
      if (editing) { const { error } = await db("destinations").update(payload).eq("id", editing.id); if (error) throw error; }
      else { const { error } = await db("destinations").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-destinations"] }); setOpen(false); setEditing(null); setForm(empty); toast({ title: editing ? "Updated" : "Created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("destinations").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-destinations"] }); toast({ title: "Deleted" }); },
  });

  const openEdit = (d: any) => { setEditing(d); setForm({ name: d.name, description: d.description, short_description: d.short_description || "", image: d.image, images: d.images || [], highlights: d.highlights || [], best_time: d.best_time || "", brochure_url: d.brochure_url || "" }); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Destinations ({items.length})</h2>
        <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}><Plus className="w-4 h-4 mr-1" /> Add Destination</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search destinations..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3" /></button>}
      </div>
      {isLoading ? <p>Loading...</p> : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Best Time</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {paginated.map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.best_time}</TableCell>
                    <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => openEdit(d)}><Pencil className="w-4 h-4" /></Button><Button size="icon" variant="ghost" onClick={() => remove.mutate(d.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Destination" : "New Destination"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Best Time to Visit</Label><Input value={form.best_time} onChange={(e) => setForm({ ...form, best_time: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Main Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
            <div className="space-y-2"><Label>Short Description</Label><Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Full Description</Label>
              <RichTextEditor content={form.description} onChange={(html) => setForm({ ...form, description: html })} />
            </div>
            <div className="space-y-2"><Label>Additional Images (one per line)</Label><Textarea rows={2} value={form.images.join("\n")} onChange={(e) => setForm({ ...form, images: e.target.value.split("\n") })} /></div>
            <div className="space-y-2"><Label>Highlights (one per line)</Label><Textarea rows={3} value={form.highlights.join("\n")} onChange={(e) => setForm({ ...form, highlights: e.target.value.split("\n") })} /></div>
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

export default AdminDestinations;