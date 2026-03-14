import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, Eye, EyeOff, LayoutDashboard } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const db = (table: string) => (supabase as any).from(table);

const AdminHomepage = () => {
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", badge_text: "", cta_text: "", cta_link: "", image_url: "" });
  const [statsJson, setStatsJson] = useState("");

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["admin-homepage-sections"],
    queryFn: async () => {
      const { data } = await db("homepage_sections").select("*").order("sort_order");
      return data || [];
    },
  });

  const openEdit = (section: any) => {
    setEditing(section);
    setForm({
      title: section.title || "",
      subtitle: section.subtitle || "",
      badge_text: section.badge_text || "",
      cta_text: section.cta_text || "",
      cta_link: section.cta_link || "",
      image_url: section.image_url || "",
    });
    if (section.section_key === "stats") {
      setStatsJson(JSON.stringify(section.extra_data?.items || [], null, 2));
    }
    setEditOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!editing?.id) return;
      const update: any = { ...form };
      if (editing.section_key === "stats") {
        try {
          update.extra_data = { items: JSON.parse(statsJson) };
        } catch { throw new Error("Invalid JSON for stats items"); }
      }
      const { error } = await db("homepage_sections").update(update).eq("id", editing.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-homepage-sections"] });
      qc.invalidateQueries({ queryKey: ["homepage-sections"] });
      setEditOpen(false);
      toast({ title: "Section updated!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await db("homepage_sections").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-homepage-sections"] });
      qc.invalidateQueries({ queryKey: ["homepage-sections"] });
      toast({ title: "Visibility updated!" });
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Homepage Sections</h2>
        <p className="text-sm text-muted-foreground">Manage the text, titles, subtitles, and call-to-action for every section on your homepage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((s: any) => (
          <Card key={s.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  {s.section_key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </CardTitle>
                <Badge variant={s.is_active ? "default" : "secondary"}>{s.is_active ? "Active" : "Hidden"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-medium text-foreground line-clamp-1">{s.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{s.subtitle}</p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(s)} className="flex-1 text-xs">
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleActive.mutate({ id: s.id, is_active: !s.is_active })}>
                  {s.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit: {editing?.section_key?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Textarea value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} rows={3} />
            </div>
            {editing?.section_key === "hero" && (
              <>
                <div className="space-y-2">
                  <Label>Badge Text</Label>
                  <Input value={form.badge_text} onChange={(e) => setForm({ ...form, badge_text: e.target.value })} placeholder="✦ Premium Travel" />
                </div>
                <div className="space-y-2">
                  <Label>Hero Image URL</Label>
                  <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>CTA Button Text</Label>
                <Input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} placeholder="View All" />
              </div>
              <div className="space-y-2">
                <Label>CTA Button Link</Label>
                <Input value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} placeholder="/packages" />
              </div>
            </div>
            {editing?.section_key === "stats" && (
              <div className="space-y-2">
                <Label>Stats Items (JSON)</Label>
                <Textarea value={statsJson} onChange={(e) => setStatsJson(e.target.value)} rows={10} className="font-mono text-xs" />
                <p className="text-xs text-muted-foreground">Format: [{"{"}"icon":"MapPin","label":"Destinations","value":"50+"{"}"}]</p>
              </div>
            )}
            <Button onClick={() => save.mutate()} disabled={save.isPending} className="w-full">
              <Save className="w-4 h-4 mr-2" /> {save.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHomepage;
