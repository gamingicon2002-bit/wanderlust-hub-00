import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Pagination from "@/components/Pagination";

const db = (table: string) => (supabase as any).from(table);
const empty = { title: "", description: "", image_url: "", category: "general", sort_order: 0 };
const PER_PAGE = 12;

const AdminGallery = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [page, setPage] = useState(1);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => { const { data } = await db("gallery").select("*").order("sort_order"); return data || []; },
  });

  const totalPages = Math.ceil(items.length / PER_PAGE);
  const paginated = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const save = useMutation({
    mutationFn: async () => {
      if (editing) { const { error } = await db("gallery").update(form).eq("id", editing.id); if (error) throw error; }
      else { const { error } = await db("gallery").insert(form); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-gallery"] }); setOpen(false); setEditing(null); setForm(empty); toast({ title: editing ? "Updated" : "Added" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("gallery").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-gallery"] }); toast({ title: "Deleted" }); },
  });

  const openEdit = (g: any) => { setEditing(g); setForm({ title: g.title, description: g.description || "", image_url: g.image_url, category: g.category, sort_order: g.sort_order }); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Gallery ({items.length})</h2>
        <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}><Plus className="w-4 h-4 mr-1" /> Add Image</Button>
      </div>
      {isLoading ? <p>Loading...</p> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {paginated.map((g: any) => (
              <div key={g.id} className="relative group rounded-lg overflow-hidden bg-card">
                <div className="aspect-square"><img src={g.image_url} alt={g.title} className="w-full h-full object-cover" /></div>
                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" onClick={() => openEdit(g)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="destructive" onClick={() => remove.mutate(g.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
                <div className="p-2"><p className="text-sm font-medium truncate">{g.title || g.category}</p></div>
              </div>
            ))}
          </div>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Image" : "Add Image"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
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

export default AdminGallery;