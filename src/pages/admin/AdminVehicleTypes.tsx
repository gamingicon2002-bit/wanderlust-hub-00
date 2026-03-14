import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const db = (table: string) => (supabase as any).from(table);

interface VehicleType {
  id: string;
  name: string;
  label: string;
  icon: string;
  parent_id: string | null;
  sort_order: number;
}

const AdminVehicleTypes = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VehicleType | null>(null);
  const [form, setForm] = useState({ name: "", label: "", icon: "", sort_order: 0, parent_id: "" });

  const { data: types = [], isLoading } = useQuery({
    queryKey: ["vehicle-types"],
    queryFn: async () => {
      const { data } = await db("vehicle_types").select("*").order("sort_order");
      return (data || []) as VehicleType[];
    },
  });

  const mainTypes = types.filter((t) => !t.parent_id);
  const getSubTypes = (parentId: string) => types.filter((t) => t.parent_id === parentId);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        label: form.label.trim(),
        icon: form.icon.trim(),
        sort_order: form.sort_order,
        parent_id: form.parent_id || null,
      };
      if (editing) {
        const { error } = await db("vehicle_types").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await db("vehicle_types").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicle-types"] });
      setOpen(false);
      setEditing(null);
      toast({ title: editing ? "Updated" : "Created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db("vehicle_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicle-types"] });
      toast({ title: "Deleted" });
    },
  });

  const openNew = (parentId?: string) => {
    setEditing(null);
    setForm({ name: "", label: "", icon: "", sort_order: 0, parent_id: parentId || "" });
    setOpen(true);
  };

  const openEdit = (t: VehicleType) => {
    setEditing(t);
    setForm({ name: t.name, label: t.label, icon: t.icon || "", sort_order: t.sort_order, parent_id: t.parent_id || "" });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Vehicle Types</h2>
        <Button onClick={() => openNew()}><Plus className="w-4 h-4 mr-1" /> Add Main Type</Button>
      </div>

      {isLoading ? <p>Loading...</p> : (
        <div className="space-y-6">
          {mainTypes.map((mt) => {
            const subs = getSubTypes(mt.id);
            return (
              <div key={mt.id} className="border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-card/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{mt.icon}</span>
                    <div>
                      <span className="font-semibold">{mt.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">({mt.name})</span>
                    </div>
                    <Badge variant="outline">{subs.length} sub-types</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => openNew(mt.id)}>
                      <Plus className="w-3 h-3 mr-1" /> Sub Type
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(mt)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove.mutate(mt.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
                {subs.length > 0 && (
                  <Table>
                    <TableBody>
                      {subs.map((st) => (
                        <TableRow key={st.id}>
                          <TableCell className="pl-12">
                            <ChevronRight className="w-3 h-3 inline mr-2 text-muted-foreground" />
                            {st.label} <span className="text-xs text-muted-foreground">({st.name})</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(st)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => remove.mutate(st.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Type" : form.parent_id ? "New Sub Type" : "New Main Type"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Name (slug) *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. sedan" required />
            </div>
            <div className="space-y-2">
              <Label>Display Label *</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Sedan" required />
            </div>
            {!form.parent_id && (
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🚗" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
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

export default AdminVehicleTypes;
