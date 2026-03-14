import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";

const db = (table: string) => (supabase as any).from(table);

const emptyForm = { name: "", logo_url: "", address: "", phone: "", email: "", gst_number: "", bank_details: "", is_default: false };

const AdminInvoiceBrands = () => {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["invoice-brands"],
    queryFn: async () => { const { data } = await db("invoice_brands").select("*").order("name"); return data || []; },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await db("invoice_brands").update(form).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await db("invoice_brands").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoice-brands"] }); setFormOpen(false); setEditing(null); toast({ title: "Saved" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("invoice_brands").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoice-brands"] }); toast({ title: "Deleted" }); },
  });

  const openEdit = (b: any) => {
    setEditing(b);
    setForm({ name: b.name, logo_url: b.logo_url || "", address: b.address || "", phone: b.phone || "", email: b.email || "", gst_number: b.gst_number || "", bank_details: b.bank_details || "", is_default: b.is_default || false });
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Invoice Brands ({brands.length})</h2>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setFormOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Add Brand</Button>
      </div>

      {isLoading ? <p>Loading...</p> : brands.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No brands yet. Create one to use in invoices.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {brands.map((b: any) => (
            <div key={b.id} className="border border-border rounded-xl p-4 bg-card/50 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    {b.logo_url ? <img src={b.logo_url} alt="" className="w-8 h-8 rounded object-cover" /> : <Building2 className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{b.name}</h3>
                    {b.is_default && <span className="text-[10px] text-primary font-medium">DEFAULT</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { if (confirm("Delete?")) remove.mutate(b.id); }}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {b.address && <p>{b.address}</p>}
                {b.gst_number && <p>GSTIN: {b.gst_number}</p>}
                {b.phone && <p>{b.phone}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Brand" : "New Brand"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="space-y-2"><Label>Brand Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Logo URL</Label><Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." /></div>
            <div className="space-y-2"><Label>Address</Label><Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>GST Number</Label><Input value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} /></div>
            <div className="space-y-2"><Label>Bank Details</Label><Textarea value={form.bank_details} onChange={(e) => setForm({ ...form, bank_details: e.target.value })} rows={3} placeholder="Bank name, A/C no, IFSC..." /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_default} onCheckedChange={(v) => setForm({ ...form, is_default: v })} /><Label>Default Brand</Label></div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInvoiceBrands;
