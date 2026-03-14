import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, ExternalLink, Search, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Pagination from "@/components/Pagination";

const db = (table: string) => (supabase as any).from(table);
const PER_PAGE = 10;

const AdminSocialLinks = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", url: "", icon_name: "", sort_order: 0, is_active: true });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: links = [], isLoading } = useQuery({
    queryKey: ["admin-social-links"],
    queryFn: async () => {
      const { data } = await db("social_links").select("*").order("sort_order");
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return links;
    const q = search.toLowerCase();
    return links.filter((l: any) => l.name?.toLowerCase().includes(q) || l.url?.toLowerCase().includes(q));
  }, [links, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { name: form.name.trim(), url: form.url.trim(), icon_name: form.icon_name.trim(), sort_order: form.sort_order, is_active: form.is_active };
      if (editing) {
        const { error } = await db("social_links").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await db("social_links").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-social-links"] });
      qc.invalidateQueries({ queryKey: ["social-links"] });
      setOpen(false);
      setEditing(null);
      toast({ title: editing ? "Updated" : "Created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db("social_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-social-links"] });
      qc.invalidateQueries({ queryKey: ["social-links"] });
      toast({ title: "Deleted" });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await db("social_links").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-social-links"] });
      qc.invalidateQueries({ queryKey: ["social-links"] });
    },
  });

  const openEdit = (link: any) => {
    setEditing(link);
    setForm({ name: link.name, url: link.url, icon_name: link.icon_name, sort_order: link.sort_order, is_active: link.is_active });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Social Media Links</h2>
        <Button onClick={() => { setEditing(null); setForm({ name: "", url: "", icon_name: "", sort_order: 0, is_active: true }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Link
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Add your social media platforms. Use icon identifiers (e.g. Facebook, Instagram, Twitter, YouTube, LinkedIn).
      </p>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search links..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3" /></button>}
      </div>

      {isLoading ? <p>Loading...</p> : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No social links found.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((link: any) => (
                <TableRow key={link.id}>
                  <TableCell className="text-sm font-medium">{link.icon_name}</TableCell>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm flex items-center gap-1 hover:underline">
                      {link.url.slice(0, 40)}... <ExternalLink className="w-3 h-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <Switch checked={link.is_active} onCheckedChange={(checked) => toggleActive.mutate({ id: link.id, is_active: checked })} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(link)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove.mutate(link.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Social Link" : "New Social Link"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Platform Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Instagram" required />
            </div>
            <div className="space-y-2">
              <Label>Icon Identifier *</Label>
              <div className="flex gap-2 items-center">
                <Input
                  value={form.icon_name}
                  onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
                  placeholder="e.g. Facebook"
                  required
                />
                {form.icon_name && (
                  <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => setForm({ ...form, icon_name: "" })}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Enter the platform name: Facebook, Instagram, Twitter, YouTube, LinkedIn, Pinterest</p>
            </div>
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://instagram.com/yourpage" required />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
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

export default AdminSocialLinks;
