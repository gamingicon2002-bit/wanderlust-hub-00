import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Eye, Search, X, Download, FileText, Filter, IndianRupee } from "lucide-react";
import Pagination from "@/components/Pagination";
import SearchableBookingPicker from "@/components/SearchableBookingPicker";

const db = (table: string) => (supabase as any).from(table);
const PER_PAGE = 10;

const statusCfg: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", cls: "bg-blue-500/10 text-blue-600" },
  paid: { label: "Paid", cls: "bg-green-500/10 text-green-600" },
  overdue: { label: "Overdue", cls: "bg-destructive/10 text-destructive" },
  cancelled: { label: "Cancelled", cls: "bg-yellow-500/10 text-yellow-600" },
};

const emptyItem = { description: "", quantity: 1, unit_price: 0, amount: 0 };

interface TaxRow { label: string; percent: number; }
const defaultTaxes: TaxRow[] = [
  { label: "CGST", percent: 9 },
  { label: "SGST", percent: 9 },
];

const emptyForm = {
  invoice_number: "", brand_id: null as string | null, booking_id: null as string | null,
  customer_name: "", customer_email: "", customer_phone: "", customer_address: "", customer_gst: "",
  cgst_percent: 9, sgst_percent: 9, igst_percent: 0, discount: 0,
  notes: "", status: "draft", invoice_date: format(new Date(), "yyyy-MM-dd"), due_date: "",
  heading: "INVOICE", description: "", footer_text: "Thank you for your business!",
  terms: "", payment_method: "",
};

const AdminInvoices = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ ...emptyForm });
  const [taxes, setTaxes] = useState<TaxRow[]>([...defaultTaxes]);
  const [items, setItems] = useState([{ ...emptyItem }]);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: async () => {
      const { data } = await db("invoices").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => { const { data } = await db("site_settings").select("*").limit(1).single(); return data; },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["invoice-brands"],
    queryFn: async () => { const { data } = await db("invoice_brands").select("*").order("name"); return data || []; },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["admin-bookings-ref"],
    queryFn: async () => { const { data } = await db("bookings").select("id, customer_name, customer_email, customer_phone, reference_name").order("created_at", { ascending: false }); return data || []; },
  });

  const subtotal = items.reduce((s, i) => s + (i.quantity * i.unit_price), 0);
  const taxAmounts = taxes.map(t => ({ label: t.label, percent: t.percent, amount: (subtotal * t.percent) / 100 }));
  const totalTax = taxAmounts.reduce((s, t) => s + t.amount, 0);
  const total = subtotal + totalTax - (form.discount || 0);

  // Map custom taxes back to cgst/sgst/igst for DB compatibility
  const cgst = taxAmounts.find(t => t.label.toUpperCase() === "CGST")?.amount || 0;
  const sgst = taxAmounts.find(t => t.label.toUpperCase() === "SGST")?.amount || 0;
  const igst = taxAmounts.find(t => t.label.toUpperCase() === "IGST")?.amount || 0;

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form, brand_id: form.brand_id || null, booking_id: form.booking_id || null,
        subtotal, cgst_amount: cgst, sgst_amount: sgst, igst_amount: igst, total,
        ...(!editing ? { created_by: user?.id } : {}),
      };
      if (editing) {
        const { error } = await db("invoices").update(payload).eq("id", editing.id);
        if (error) throw error;
        await db("invoice_items").delete().eq("invoice_id", editing.id);
        const lineItems = items.map((i, idx) => ({ ...i, amount: i.quantity * i.unit_price, invoice_id: editing.id, sort_order: idx }));
        const { error: e2 } = await db("invoice_items").insert(lineItems);
        if (e2) throw e2;
      } else {
        const { data: inv, error } = await db("invoices").insert(payload).select().single();
        if (error) throw error;
        const lineItems = items.map((i, idx) => ({ ...i, amount: i.quantity * i.unit_price, invoice_id: inv.id, sort_order: idx }));
        const { error: e2 } = await db("invoice_items").insert(lineItems);
        if (e2) throw e2;

        // Auto-create customer
        if (form.customer_name) {
          const { data: existing } = form.customer_email
            ? await db("customers").select("id, total_invoices, total_spent").eq("email", form.customer_email).maybeSingle()
            : { data: null };
          if (existing) {
            await db("customers").update({
              total_invoices: (existing.total_invoices || 0) + 1,
              total_spent: Number(existing.total_spent || 0) + total,
              phone: form.customer_phone || undefined,
              address: form.customer_address || undefined,
              gst_number: form.customer_gst || undefined,
            }).eq("id", existing.id);
          } else {
            await db("customers").insert({
              name: form.customer_name,
              email: form.customer_email || "",
              phone: form.customer_phone || "",
              address: form.customer_address || "",
              gst_number: form.customer_gst || "",
              total_invoices: 1,
              total_spent: total,
              created_by: user?.id,
            });
          }
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-invoices"] });
      setFormOpen(false); setEditing(null);
      toast({ title: editing ? "Invoice updated" : "Invoice created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("invoices").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-invoices"] }); toast({ title: "Deleted" }); },
  });

  const openNew = () => {
    setEditing(null);
    const num = `INV-${Date.now().toString().slice(-6)}`;
    const defaultBrand = brands.find((b: any) => b.is_default)?.id || null;
    setForm({ ...emptyForm, invoice_number: num, brand_id: defaultBrand });
    setItems([{ ...emptyItem }]);
    setTaxes([...defaultTaxes]);
    setFormOpen(true);
  };

  const openEdit = async (inv: any) => {
    setEditing(inv);
    setForm({
      invoice_number: inv.invoice_number, brand_id: inv.brand_id, booking_id: inv.booking_id,
      customer_name: inv.customer_name, customer_email: inv.customer_email || "",
      customer_phone: inv.customer_phone || "", customer_address: inv.customer_address || "",
      customer_gst: inv.customer_gst || "", cgst_percent: inv.cgst_percent || 0,
      sgst_percent: inv.sgst_percent || 0, igst_percent: inv.igst_percent || 0,
      discount: inv.discount || 0, notes: inv.notes || "", status: inv.status || "draft",
      invoice_date: inv.invoice_date || "", due_date: inv.due_date || "",
      heading: inv.heading || "INVOICE", description: inv.description || "",
      footer_text: inv.footer_text || "Thank you for your business!",
      terms: inv.terms || "", payment_method: inv.payment_method || "",
    });
    // Reconstruct taxes from stored values
    const editTaxes: TaxRow[] = [];
    if (inv.cgst_percent > 0) editTaxes.push({ label: "CGST", percent: inv.cgst_percent });
    if (inv.sgst_percent > 0) editTaxes.push({ label: "SGST", percent: inv.sgst_percent });
    if (inv.igst_percent > 0) editTaxes.push({ label: "IGST", percent: inv.igst_percent });
    setTaxes(editTaxes.length > 0 ? editTaxes : [...defaultTaxes]);
    const { data: lineItems } = await db("invoice_items").select("*").eq("invoice_id", inv.id).order("sort_order");
    setItems(lineItems?.length ? lineItems.map((i: any) => ({ description: i.description, quantity: i.quantity, unit_price: i.unit_price, amount: i.amount })) : [{ ...emptyItem }]);
    setFormOpen(true);
  };

  const openView = async (inv: any) => {
    const { data: lineItems } = await db("invoice_items").select("*").eq("invoice_id", inv.id).order("sort_order");
    const brand = brands.find((b: any) => b.id === inv.brand_id);
    setViewOpen({ ...inv, items: lineItems || [], brand });
  };

  const fillFromBooking = (bookingId: string) => {
    const b = bookings.find((bk: any) => bk.id === bookingId);
    if (b) setForm(f => ({ ...f, booking_id: bookingId, customer_name: b.customer_name, customer_email: b.customer_email || "", customer_phone: b.customer_phone || "" }));
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;
    updated[idx].amount = updated[idx].quantity * updated[idx].unit_price;
    setItems(updated);
  };

  const filtered = useMemo(() => {
    return invoices.filter((inv: any) => {
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return [inv.invoice_number, inv.customer_name, inv.customer_email].some((v: string) => v?.toLowerCase().includes(q));
      }
      return true;
    });
  }, [invoices, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">Invoices ({invoices.length})</h2>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Create Invoice</Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search invoice #, customer..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3" /></button>}
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px]"><Filter className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", value: invoices.length, icon: FileText, color: "text-primary" },
          { label: "Draft", value: invoices.filter((i: any) => i.status === "draft").length, icon: FileText, color: "text-muted-foreground" },
          { label: "Sent", value: invoices.filter((i: any) => i.status === "sent").length, icon: FileText, color: "text-blue-600" },
          { label: "Paid", value: invoices.filter((i: any) => i.status === "paid").length, icon: IndianRupee, color: "text-green-600" },
          { label: "Overdue", value: invoices.filter((i: any) => i.status === "overdue").length, icon: FileText, color: "text-destructive" },
          { label: "Revenue", value: `₹${invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + Number(i.total || 0), 0).toLocaleString()}`, icon: IndianRupee, color: "text-green-600" },
        ].map((s, i) => (
          <Card key={i} className="bg-card/50"><CardContent className="p-3 flex items-center gap-2">
            <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
            <div><p className="text-[10px] text-muted-foreground uppercase">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Due", value: `₹${invoices.filter((i: any) => ["sent", "overdue"].includes(i.status)).reduce((s: number, i: any) => s + Number(i.total || 0), 0).toLocaleString()}` },
          { label: "Cancelled", value: invoices.filter((i: any) => i.status === "cancelled").length },
          { label: "Draft Value", value: `₹${invoices.filter((i: any) => i.status === "draft").reduce((s: number, i: any) => s + Number(i.total || 0), 0).toLocaleString()}` },
        ].map((s, i) => (
          <Card key={i} className="bg-card/50"><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">{s.label}</p><p className="text-sm font-bold">{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No invoices found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Invoice #</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden sm:table-cell">Customer</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total</th>
                <th className="text-center py-3 px-2 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {paginated.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-2 font-medium">{inv.invoice_number}</td>
                    <td className="py-3 px-2 hidden sm:table-cell">{inv.customer_name}</td>
                    <td className="py-3 px-2 hidden md:table-cell text-muted-foreground">{inv.invoice_date ? format(new Date(inv.invoice_date + "T00:00:00"), "dd MMM yyyy") : "—"}</td>
                    <td className="py-3 px-2 text-right font-semibold">₹{Number(inv.total).toLocaleString()}</td>
                    <td className="py-3 px-2 text-center"><Badge variant="outline" className={statusCfg[inv.status]?.cls}>{statusCfg[inv.status]?.label || inv.status}</Badge></td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openView(inv)}><Eye className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={async () => { const { data: li } = await db("invoice_items").select("*").eq("invoice_id", inv.id).order("sort_order"); const brand = brands.find((b: any) => b.id === inv.brand_id); generatePDF({ ...inv, items: li || [], brand }, settings); }}><Download className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(inv)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { if (confirm("Delete?")) remove.mutate(inv.id); }}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}

      {/* View Invoice */}
      <Dialog open={!!viewOpen} onOpenChange={() => setViewOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewOpen?.heading || "Invoice"} — {viewOpen?.invoice_number}</DialogTitle></DialogHeader>
          {viewOpen && (
            <div className="space-y-4">
              {viewOpen.brand && (
                <div className="flex items-start justify-between">
                  <div className="text-sm">
                    {viewOpen.brand.logo_url && <img src={viewOpen.brand.logo_url} alt="" className="h-12 mb-2 object-contain" />}
                    <p className="font-bold text-lg">{viewOpen.brand.name}</p>
                    <p className="text-muted-foreground whitespace-pre-line">{viewOpen.brand.address}</p>
                    {viewOpen.brand.gst_number && <p className="text-xs mt-1">GSTIN: {viewOpen.brand.gst_number}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{viewOpen.heading || "INVOICE"}</p>
                    <p className="font-medium">#{viewOpen.invoice_number}</p>
                  </div>
                </div>
              )}
              {viewOpen.description && <p className="text-sm text-muted-foreground italic border-l-2 border-primary pl-3">{viewOpen.description}</p>}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground font-medium uppercase">Bill To</p><p className="font-semibold">{viewOpen.customer_name}</p><p className="text-muted-foreground">{viewOpen.customer_email}</p><p className="text-muted-foreground">{viewOpen.customer_phone}</p>{viewOpen.customer_address && <p className="text-muted-foreground">{viewOpen.customer_address}</p>}{viewOpen.customer_gst && <p className="text-xs">GSTIN: {viewOpen.customer_gst}</p>}</div>
                <div className="text-right"><p className="text-xs text-muted-foreground font-medium uppercase">Invoice Details</p><p>Date: {viewOpen.invoice_date}</p>{viewOpen.due_date && <p>Due: {viewOpen.due_date}</p>}{viewOpen.payment_method && <p>Payment: {viewOpen.payment_method}</p>}<Badge variant="outline" className={`mt-1 ${statusCfg[viewOpen.status]?.cls}`}>{statusCfg[viewOpen.status]?.label}</Badge></div>
              </div>
              <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead><tr className="bg-primary/10"><th className="p-2.5 text-left text-xs font-semibold">#</th><th className="p-2.5 text-left text-xs font-semibold">Description</th><th className="p-2.5 text-right text-xs font-semibold">Qty</th><th className="p-2.5 text-right text-xs font-semibold">Rate (₹)</th><th className="p-2.5 text-right text-xs font-semibold">Amount (₹)</th></tr></thead>
                <tbody>{viewOpen.items.map((i: any, idx: number) => (
                  <tr key={idx} className="border-t border-border/50"><td className="p-2.5">{idx + 1}</td><td className="p-2.5">{i.description}</td><td className="p-2.5 text-right">{i.quantity}</td><td className="p-2.5 text-right">{Number(i.unit_price).toLocaleString()}</td><td className="p-2.5 text-right font-medium">{Number(i.amount).toLocaleString()}</td></tr>
                ))}</tbody>
              </table>
              <div className="ml-auto w-72 space-y-1.5 text-sm bg-muted/30 rounded-lg p-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{Number(viewOpen.subtotal).toLocaleString()}</span></div>
                {viewOpen.cgst_amount > 0 && <div className="flex justify-between text-muted-foreground"><span>CGST ({viewOpen.cgst_percent}%)</span><span>₹{Number(viewOpen.cgst_amount).toLocaleString()}</span></div>}
                {viewOpen.sgst_amount > 0 && <div className="flex justify-between text-muted-foreground"><span>SGST ({viewOpen.sgst_percent}%)</span><span>₹{Number(viewOpen.sgst_amount).toLocaleString()}</span></div>}
                {viewOpen.igst_amount > 0 && <div className="flex justify-between text-muted-foreground"><span>IGST ({viewOpen.igst_percent}%)</span><span>₹{Number(viewOpen.igst_amount).toLocaleString()}</span></div>}
                {viewOpen.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{Number(viewOpen.discount).toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold text-lg border-t border-border pt-2"><span>Total</span><span className="text-primary">₹{Number(viewOpen.total).toLocaleString()}</span></div>
              </div>
              {viewOpen.notes && <div><p className="text-xs font-semibold text-muted-foreground uppercase">Notes</p><p className="text-sm text-muted-foreground">{viewOpen.notes}</p></div>}
              {viewOpen.terms && <div><p className="text-xs font-semibold text-muted-foreground uppercase">Terms & Conditions</p><p className="text-sm text-muted-foreground whitespace-pre-line">{viewOpen.terms}</p></div>}
              {viewOpen.brand?.bank_details && <div><p className="text-xs font-semibold text-muted-foreground uppercase">Bank Details</p><p className="text-sm text-muted-foreground whitespace-pre-line">{viewOpen.brand.bank_details}</p></div>}
              <Button onClick={() => generatePDF(viewOpen, settings)} className="w-full"><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create / Edit Form */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Invoice" : "New Invoice"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-5">

            {/* Document Customization */}
            <div className="bg-muted/30 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document Customization</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Document Heading</Label><Input value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} placeholder="INVOICE / TAX INVOICE / PROFORMA" /></div>
                <div className="space-y-1.5"><Label className="text-xs">Invoice #</Label><Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label className="text-xs">Brand</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={form.brand_id || ""} onChange={(e) => setForm({ ...form, brand_id: e.target.value || null })}>
                    <option value="">No brand</option>
                    {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Description / Subtitle</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. For Goa Tour Package — 5N/6D" /></div>
            </div>

            {/* Link Booking */}
            <div className="space-y-1.5">
              <Label className="text-xs">Link to Booking (auto-fills customer)</Label>
              <SearchableBookingPicker
                bookings={bookings}
                value={form.booking_id || ""}
                onSelect={(id) => { setForm({ ...form, booking_id: id || null }); if (id) fillFromBooking(id); }}
                placeholder="Search booking by customer name, package..."
              />
            </div>

            {/* Customer */}
            <div className="bg-muted/30 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Name *</Label><Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Phone</Label><Input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">GSTIN</Label><Input value={form.customer_gst} onChange={(e) => setForm({ ...form, customer_gst: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Address</Label><Input value={form.customer_address} onChange={(e) => setForm({ ...form, customer_address: e.target.value })} /></div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Line Items</p>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-muted-foreground uppercase px-1">
                  <span className="col-span-5">Description</span><span className="col-span-2">Qty</span><span className="col-span-2">Rate (₹)</span><span className="col-span-2">Amount</span><span className="col-span-1"></span>
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5"><Input placeholder="Service / item" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} /></div>
                    <div className="col-span-2"><Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} /></div>
                    <div className="col-span-2"><Input type="number" min={0} value={item.unit_price} onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))} /></div>
                    <div className="col-span-2 text-sm font-semibold text-center">₹{(item.quantity * item.unit_price).toLocaleString()}</div>
                    <div className="col-span-1 flex justify-center">{items.length > 1 && <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => setItems(items.filter((_, i) => i !== idx))}><X className="w-3 h-3" /></Button>}</div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { ...emptyItem }])}><Plus className="w-3 h-3 mr-1" /> Add Item</Button>
              </div>
            </div>

            {/* Tax & Totals */}
            <div className="bg-muted/30 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax & Totals</p>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax & Totals</p>
                <Button type="button" size="sm" variant="outline" onClick={() => setTaxes([...taxes, { label: "", percent: 0 }])}><Plus className="w-3 h-3 mr-1" /> Add Tax</Button>
              </div>
              <div className="space-y-2">
                {taxes.map((tax, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5"><Input placeholder="Tax label (e.g. CGST, VAT, Service Tax)" value={tax.label} onChange={(e) => { const u = [...taxes]; u[idx] = { ...u[idx], label: e.target.value }; setTaxes(u); }} /></div>
                    <div className="col-span-3"><Input type="number" placeholder="%" value={tax.percent} onChange={(e) => { const u = [...taxes]; u[idx] = { ...u[idx], percent: Number(e.target.value) }; setTaxes(u); }} /></div>
                    <div className="col-span-3 text-sm text-muted-foreground text-right">₹{((subtotal * tax.percent) / 100).toLocaleString()}</div>
                    <div className="col-span-1 flex justify-center"><Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => setTaxes(taxes.filter((_, i) => i !== idx))}><X className="w-3 h-3" /></Button></div>
                  </div>
                ))}
                {taxes.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No taxes added. Click "Add Tax" to add custom tax rows.</p>}
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Discount (₹)</Label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} /></div>
              <div className="bg-background rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                {taxAmounts.filter(t => t.amount > 0).map((t, i) => <div key={i} className="flex justify-between text-muted-foreground"><span>{t.label} ({t.percent}%)</span><span>₹{t.amount.toLocaleString()}</span></div>)}
                {form.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{Number(form.discount).toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold text-lg border-t border-border pt-2"><span>Grand Total</span><span className="text-primary">₹{total.toLocaleString()}</span></div>
              </div>
            </div>

            {/* Dates & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Invoice Date</Label><Input type="date" value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Payment Method</Label><Input value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} placeholder="UPI / Bank / Cash" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option><option value="overdue">Overdue</option><option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Footer Customization */}
            <div className="bg-muted/30 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Footer & Terms</p>
              <div className="space-y-1.5"><Label className="text-xs">Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Special instructions or notes..." /></div>
              <div className="space-y-1.5"><Label className="text-xs">Terms & Conditions</Label><Textarea value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} rows={3} placeholder="1. Payment due within 15 days&#10;2. Cancellation charges apply..." /></div>
              <div className="space-y-1.5"><Label className="text-xs">Footer Message</Label><Input value={form.footer_text} onChange={(e) => setForm({ ...form, footer_text: e.target.value })} placeholder="Thank you for your business!" /></div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : editing ? "Update Invoice" : "Create Invoice"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Professional PDF Generator ──────────────────────────────────────
function generatePDF(inv: any, siteSettings?: any) {
  const brand = inv.brand || {};
  const primary = siteSettings?.doc_primary_color || "#2563eb";
  const font = siteSettings?.doc_font_family || "Inter";
  const itemsHtml = (inv.items || []).map((i: any, idx: number) =>
    `<tr><td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;text-align:center">${idx + 1}</td>
     <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb">${i.description}</td>
     <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:center">${i.quantity}</td>
     <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right">₹${Number(i.unit_price).toLocaleString("en-IN")}</td>
     <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">₹${Number(i.amount).toLocaleString("en-IN")}</td></tr>`
  ).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${inv.heading || "Invoice"} ${inv.invoice_number}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'${font}',system-ui,sans-serif;color:#1f2937;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{max-width:800px;margin:0 auto;padding:48px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:32px;border-bottom:3px solid ${primary}}
  .brand-name{font-size:22px;font-weight:700;color:#111827;margin-bottom:4px}
  .brand-info{font-size:11px;color:#6b7280;line-height:1.7}
  .inv-heading{font-size:32px;font-weight:800;color:${primary};letter-spacing:2px;text-align:right}
  .inv-number{font-size:14px;font-weight:600;color:#374151;text-align:right;margin-top:4px}
  .inv-desc{margin:20px 0;padding:12px 16px;background:#eff6ff;border-left:4px solid ${primary};border-radius:0 8px 8px 0;font-size:13px;color:#1e40af;font-style:italic}
  .parties{display:flex;justify-content:space-between;margin:28px 0;gap:40px}
  .party-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;margin-bottom:8px}
  .party-name{font-size:15px;font-weight:700;color:#111827}
  .party-detail{font-size:12px;color:#6b7280;line-height:1.8}
  table{width:100%;border-collapse:collapse;margin:24px 0;border-radius:12px;overflow:hidden}
  thead tr{background:linear-gradient(135deg,${primary},${primary}dd)}
  thead th{padding:14px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;text-align:left}
  thead th:nth-child(1){text-align:center;width:50px}thead th:nth-child(3){text-align:center}
  thead th:nth-child(4),thead th:nth-child(5){text-align:right}
  tbody tr:nth-child(even){background:#f9fafb}
  .totals-wrap{display:flex;justify-content:flex-end;margin:8px 0 28px}
  .totals{width:320px;background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #e5e7eb}
  .total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#6b7280}
  .total-row.grand{border-top:2px solid ${primary};padding-top:14px;margin-top:8px;font-size:20px;font-weight:800;color:${primary}}
  .total-row.grand span:last-child{font-size:22px}
  .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;margin-bottom:6px}
  .section-text{font-size:12px;color:#6b7280;line-height:1.8;white-space:pre-line}
  .footer{margin-top:40px;padding-top:20px;border-top:2px solid #e5e7eb;text-align:center}
  .footer-text{font-size:16px;font-weight:600;color:${primary};margin-bottom:4px}
  .footer-sub{font-size:11px;color:#9ca3af}
  .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
  .badge-paid{background:#dcfce7;color:#166534}.badge-sent{background:#dbeafe;color:#1e40af}
  .badge-draft{background:#f3f4f6;color:#6b7280}.badge-overdue{background:#fef2f2;color:#991b1b}
  @media print{.page{padding:24px}body{-webkit-print-color-adjust:exact}}
</style></head><body><div class="page">
  <div class="header">
    <div>
      ${brand.logo_url ? `<img src="${brand.logo_url}" alt="" style="height:48px;margin-bottom:10px;object-fit:contain">` : ""}
      <div class="brand-name">${brand.name || "Company Name"}</div>
      <div class="brand-info">${(brand.address || "").replace(/\n/g, "<br>")}</div>
      ${brand.phone || brand.email ? `<div class="brand-info">${[brand.phone, brand.email].filter(Boolean).join(" • ")}</div>` : ""}
      ${brand.gst_number ? `<div class="brand-info" style="margin-top:4px;font-weight:600;color:#374151">GSTIN: ${brand.gst_number}</div>` : ""}
    </div>
    <div>
      <div class="inv-heading">${inv.heading || "INVOICE"}</div>
      <div class="inv-number">#${inv.invoice_number}</div>
      <div style="text-align:right;margin-top:8px">
        <span class="badge badge-${inv.status}">${(inv.status || "draft").toUpperCase()}</span>
      </div>
    </div>
  </div>

  ${inv.description ? `<div class="inv-desc">${inv.description}</div>` : ""}

  <div class="parties">
    <div>
      <div class="party-label">Bill To</div>
      <div class="party-name">${inv.customer_name}</div>
      <div class="party-detail">
        ${[inv.customer_email, inv.customer_phone, inv.customer_address].filter(Boolean).join("<br>")}
        ${inv.customer_gst ? `<br><span style="font-weight:600;color:#374151">GSTIN: ${inv.customer_gst}</span>` : ""}
      </div>
    </div>
    <div style="text-align:right">
      <div class="party-label">Invoice Info</div>
      <div class="party-detail">
        <strong>Date:</strong> ${inv.invoice_date || "—"}<br>
        ${inv.due_date ? `<strong>Due:</strong> ${inv.due_date}<br>` : ""}
        ${inv.payment_method ? `<strong>Payment:</strong> ${inv.payment_method}` : ""}
      </div>
    </div>
  </div>

  <table>
    <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Rate (₹)</th><th>Amount (₹)</th></tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <div class="totals-wrap"><div class="totals">
    <div class="total-row"><span>Subtotal</span><span>₹${Number(inv.subtotal).toLocaleString("en-IN")}</span></div>
    ${inv.cgst_amount > 0 ? `<div class="total-row"><span>CGST (${inv.cgst_percent || 0}%)</span><span>₹${Number(inv.cgst_amount).toLocaleString("en-IN")}</span></div>` : ""}
    ${inv.sgst_amount > 0 ? `<div class="total-row"><span>SGST (${inv.sgst_percent || 0}%)</span><span>₹${Number(inv.sgst_amount).toLocaleString("en-IN")}</span></div>` : ""}
    ${inv.igst_amount > 0 ? `<div class="total-row"><span>IGST (${inv.igst_percent || 0}%)</span><span>₹${Number(inv.igst_amount).toLocaleString("en-IN")}</span></div>` : ""}
    ${inv.discount > 0 ? `<div class="total-row" style="color:#16a34a"><span>Discount</span><span>-₹${Number(inv.discount).toLocaleString("en-IN")}</span></div>` : ""}
    <div class="total-row grand"><span>Total</span><span>₹${Number(inv.total).toLocaleString("en-IN")}</span></div>
  </div></div>

  ${inv.notes ? `<div style="margin-bottom:16px"><div class="section-title">Notes</div><div class="section-text">${inv.notes}</div></div>` : ""}
  ${(inv.terms || siteSettings?.invoice_terms) ? `<div style="margin-bottom:16px"><div class="section-title">Terms & Conditions</div><div class="section-text">${inv.terms || siteSettings?.invoice_terms || ""}</div></div>` : ""}
  ${siteSettings?.invoice_cancellation_policy ? `<div style="margin-bottom:16px"><div class="section-title">Cancellation Policy</div><div class="section-text">${siteSettings.invoice_cancellation_policy}</div></div>` : ""}
  ${brand.bank_details ? `<div style="margin-bottom:16px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e5e7eb"><div class="section-title">Bank Details</div><div class="section-text">${brand.bank_details.replace(/\n/g, "<br>")}</div></div>` : ""}

  <div class="footer">
    <div class="footer-text">${inv.footer_text || "Thank you for your business!"}</div>
    <div class="footer-sub">This is a computer-generated document and does not require a physical signature.</div>
  </div>
</div></body></html>`;

  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
}

export default AdminInvoices;
