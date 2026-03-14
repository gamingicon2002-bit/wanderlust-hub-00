import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Eye, EyeOff, FileText, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/RichTextEditor";

const db = (table: string) => (supabase as any).from(table);

const AdminPages = () => {
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", content: "", is_active: true });

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data } = await db("pages").select("*").order("created_at");
      return data || [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!editing?.id) throw new Error("No page selected");
      const { error } = await db("pages").update({
        title: form.title,
        content: form.content,
        is_active: form.is_active,
      }).eq("id", editing.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pages"] });
      setEditOpen(false);
      toast({ title: "Page saved!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await db("pages").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pages"] });
      toast({ title: "Status updated!" });
    },
  });

  const openEdit = (page: any) => {
    setEditing(page);
    setForm({ title: page.title, content: page.content, is_active: page.is_active });
    setEditOpen(true);
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Pages</h2>
        <p className="text-sm text-muted-foreground">Manage your Privacy Policy, Terms & Conditions, and other static pages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pages.map((page: any) => (
          <Card key={page.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {page.title}
                </CardTitle>
                <Badge variant={page.is_active ? "default" : "secondary"}>
                  {page.is_active ? "Active" : "Hidden"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">/{page.slug}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                className="text-sm text-muted-foreground line-clamp-3 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content.substring(0, 200) + "..." }}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(page)} className="flex-1">
                  <Pencil className="w-3 h-3 mr-1" /> Edit Content
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleActive.mutate({ id: page.id, is_active: !page.is_active })}
                >
                  {page.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Page Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit: {editing?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Page Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                content={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
              />
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending} className="w-full">
              <Save className="w-4 h-4 mr-2" /> {save.isPending ? "Saving..." : "Save Page"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPages;
