import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Save, Eye, EyeOff, Globe, Hotel, Receipt } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const db = (table: string) => (supabase as any).from(table);

const AdminLandingPages = () => {
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", description: "", icon: "", image_url: "", cta_text: "", cta_link: "" });

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["admin-landing-sections"],
    queryFn: async () => {
      const { data } = await db("landing_page_sections").select("*").order("sort_order");
      return data || [];
    },
  });

  const hotelSections = sections.filter((s: any) => s.page_key === "hotel_landing");
  const invoiceSections = sections.filter((s: any) => s.page_key === "invoice_landing");

  const openEdit = (section: any) => {
    setEditing(section);
    setForm({
      title: section.title || "",
      subtitle: section.subtitle || "",
      description: section.description || "",
      icon: section.icon || "",
      image_url: section.image_url || "",
      cta_text: section.cta_text || "",
      cta_link: section.cta_link || "",
    });
    setEditOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!editing?.id) return;
      const { error } = await db("landing_page_sections").update(form).eq("id", editing.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-landing-sections"] });
      qc.invalidateQueries({ queryKey: ["landing-sections"] });
      setEditOpen(false);
      toast({ title: "Section updated!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await db("landing_page_sections").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-landing-sections"] });
      qc.invalidateQueries({ queryKey: ["landing-sections"] });
      toast({ title: "Visibility updated!" });
    },
  });

  const formatKey = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  const renderSections = (items: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((s: any) => (
        <Card key={s.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                {formatKey(s.section_key)}
              </CardTitle>
              <Badge variant={s.is_active ? "default" : "secondary"}>{s.is_active ? "Active" : "Hidden"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-medium text-foreground line-clamp-1">{s.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{s.subtitle || s.description}</p>
            {s.cta_text && <p className="text-xs text-primary">CTA: {s.cta_text} → {s.cta_link}</p>}
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
  );

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Landing Pages</h2>
        <p className="text-sm text-muted-foreground">Manage the content for Hotel Landing and Invoice Landing pages.</p>
      </div>

      <Tabs defaultValue="hotel">
        <TabsList>
          <TabsTrigger value="hotel" className="gap-1.5"><Hotel className="w-3.5 h-3.5" /> Hotel Landing</TabsTrigger>
          <TabsTrigger value="invoice" className="gap-1.5"><Receipt className="w-3.5 h-3.5" /> Invoice Landing</TabsTrigger>
        </TabsList>
        <TabsContent value="hotel" className="mt-4">{renderSections(hotelSections)}</TabsContent>
        <TabsContent value="invoice" className="mt-4">{renderSections(invoiceSections)}</TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit: {editing ? formatKey(editing.section_key) : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Textarea value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Icon Name</Label>
              <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. Receipt, Hotel, Users" />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>CTA Button Text</Label>
                <Input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>CTA Button Link</Label>
                <Input value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} />
              </div>
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending} className="w-full">
              <Save className="w-4 h-4 mr-2" /> {save.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLandingPages;
