import { useState, useMemo } from "react";
import { Check, X, Clock, Filter, Trash2, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import RichTextEditor from "@/components/RichTextEditor";
import Pagination from "@/components/Pagination";

const db = (table: string) => (supabase as any).from(table);
const emptyForm = { title: "", content: "", excerpt: "", author_name: "Admin", author_email: "", image: "", status: "approved" };
const PER_PAGE = 10;

const AdminBlogs = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: async () => {
      const { data, error } = await db("blogs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const saveBlog = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(), content: form.content,
        excerpt: form.excerpt.trim() || form.content.replace(/<[^>]*>/g, '').slice(0, 150),
        author_name: form.author_name.trim(), author_email: form.author_email.trim(),
        image: form.image.trim(), status: form.status,
      };
      if (editing) { const { error } = await db("blogs").update(payload).eq("id", editing.id); if (error) throw error; }
      else { const { error } = await db("blogs").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-blogs"] }); setOpen(false); setEditing(null); setForm(emptyForm); toast({ title: editing ? "Blog updated" : "Blog created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => { const { error } = await db("blogs").update({ status }).eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-blogs"] }); toast({ title: "Blog updated" }); },
  });

  const deleteBlog = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("blogs").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-blogs"] }); toast({ title: "Blog deleted" }); },
  });

  const openEdit = (blog: any) => {
    setEditing(blog);
    setForm({ title: blog.title, content: blog.content, excerpt: blog.excerpt || "", author_name: blog.author_name, author_email: blog.author_email, image: blog.image || "", status: blog.status });
    setOpen(true);
  };

  const filtered = useMemo(() => {
    return statusFilter === "all" ? blogs : blogs.filter((b: any) => b.status === statusFilter);
  }, [blogs, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const statusColor = (s: string) => {
    if (s === "approved") return "bg-green-500/10 text-green-600 border-green-500/20";
    if (s === "rejected") return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Blog Posts</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{blogs.length} total</Badge>
          <Button onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }}><Plus className="w-4 h-4 mr-1" /> New Blog</Button>
        </div>
      </div>

      <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
        <SelectTrigger className="w-[150px]"><Filter className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : paginated.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No blogs found.</p>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map((blog: any) => (
              <div key={blog.id} className="border border-border rounded-xl p-4 bg-card/50 space-y-3">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{blog.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{blog.author_name}</span>
                      <Badge variant="outline" className={`text-[10px] ${statusColor(blog.status)}`}>{blog.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {format(new Date(blog.created_at), "dd MMM yyyy")}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{(blog.excerpt || blog.content || '').replace(/<[^>]*>/g, '').slice(0, 200)}</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => openEdit(blog)}><Pencil className="w-3 h-3" /> Edit</Button>
                  {blog.status !== "approved" && <Button size="sm" variant="outline" className="gap-1 text-green-600" onClick={() => updateStatus.mutate({ id: blog.id, status: "approved" })}><Check className="w-3 h-3" /> Approve</Button>}
                  {blog.status !== "rejected" && <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => updateStatus.mutate({ id: blog.id, status: "rejected" })}><X className="w-3 h-3" /> Reject</Button>}
                  <Button size="sm" variant="ghost" className="text-destructive ml-auto gap-1" onClick={() => deleteBlog.mutate(blog.id)}><Trash2 className="w-3 h-3" /> Delete</Button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Blog" : "New Blog Post"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveBlog.mutate(); }} className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Author Name *</Label><Input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Author Email *</Label><Input type="email" value={form.author_email} onChange={(e) => setForm({ ...form, author_email: e.target.value })} required /></div>
            </div>
            <div className="space-y-2"><Label>Cover Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
            <div className="space-y-2"><Label>Excerpt</Label><Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary (auto-generated if empty)" /></div>
            <div className="space-y-2"><Label>Content *</Label><RichTextEditor content={form.content} onChange={(html) => setForm({ ...form, content: html })} /></div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveBlog.isPending}>{saveBlog.isPending ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlogs;