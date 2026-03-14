import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, X, Users, IndianRupee, FileText, Mail, Download, Upload, Send, Megaphone } from "lucide-react";
import Pagination from "@/components/Pagination";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

const db = (table: string) => (supabase as any).from(table);
const PER_PAGE = 15;

const AdminCustomers = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [leadFilter, setLeadFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sendOpen, setSendOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [sending, setSending] = useState(false);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data } = await db("customers").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => { const { data } = await db("email_templates").select("*"); return data || []; },
  });

  const { data: bookingLeadRows = [] } = useQuery({
    queryKey: ["customer-booking-leads"],
    queryFn: async () => {
      const { data } = await db("bookings")
        .select("customer_email, customer_phone, lead_source, created_at")
        .neq("lead_source", "")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const leadLookup = useMemo(() => {
    const byEmail = new Map<string, string>();
    const byPhone = new Map<string, string>();

    bookingLeadRows.forEach((row: any) => {
      const source = (row.lead_source || "").trim();
      if (!source) return;

      const emailKey = (row.customer_email || "").toLowerCase().trim();
      const phoneKey = (row.customer_phone || "").trim();

      if (emailKey && !byEmail.has(emailKey)) byEmail.set(emailKey, source);
      if (phoneKey && !byPhone.has(phoneKey)) byPhone.set(phoneKey, source);
    });

    return { byEmail, byPhone };
  }, [bookingLeadRows]);

  const customersWithLead = useMemo(() => {
    return customers.map((c: any) => {
      const directLead = (c.lead_source || "").trim();
      const emailKey = (c.email || "").toLowerCase().trim();
      const phoneKey = (c.phone || "").trim();
      const fallbackLead = (emailKey && leadLookup.byEmail.get(emailKey)) || (phoneKey && leadLookup.byPhone.get(phoneKey)) || "Unknown";

      return {
        ...c,
        resolved_lead_source: directLead || fallbackLead,
      };
    });
  }, [customers, leadLookup]);

  const leadSources = useMemo(() => {
    const sources = new Set<string>();
    customersWithLead.forEach((c: any) => sources.add(c.resolved_lead_source));
    return Array.from(sources).sort();
  }, [customersWithLead]);

  const filtered = useMemo(() => {
    let arr = customersWithLead;
    if (leadFilter !== "all") arr = arr.filter((c: any) => c.resolved_lead_source === leadFilter);
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter((c: any) =>
        [c.name, c.email, c.phone, c.resolved_lead_source].some((v: string) => v?.toLowerCase().includes(q))
      );
    }
    return arr;
  }, [customersWithLead, search, leadFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Lead source analytics
  const leadStats = useMemo(() => {
    const map: Record<string, { count: number; revenue: number; invoices: number }> = {};
    customersWithLead.forEach((c: any) => {
      const src = c.resolved_lead_source || "Unknown";
      if (!map[src]) map[src] = { count: 0, revenue: 0, invoices: 0 };
      map[src].count++;
      map[src].revenue += Number(c.total_spent || 0);
      map[src].invoices += Number(c.total_invoices || 0);
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [customersWithLead]);

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c: any) => c.email).filter(Boolean)));
  };

  const toggle = (email: string) => {
    const next = new Set(selected);
    if (next.has(email)) next.delete(email); else next.add(email);
    setSelected(next);
  };

  const applyTemplate = (id: string) => {
    setTemplateId(id);
    const t = templates.find((t: any) => t.id === id);
    if (t) { setEmailSubject(t.subject); setEmailBody(t.body); }
  };

  const sendEmails = async () => {
    if (!emailSubject || !emailBody || selected.size === 0) {
      toast({ title: "Please fill subject, body and select recipients", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const recipients = filtered.filter((c: any) => selected.has(c.email)).map((c: any) => ({ name: c.name, email: c.email }));
      const { error } = await supabase.functions.invoke("send-email", {
        body: { recipients, subject: emailSubject, body: emailBody },
      });
      if (error) throw error;
      toast({ title: `Emails queued for ${recipients.length} recipients` });
      setSendOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSending(false);
  };

  const exportCSV = () => {
    const headers = ["name", "email", "phone", "lead_source", "total_invoices", "total_spent"];
    const rows = filtered.map((c: any) => headers.map(h => {
      const value = h === "lead_source" ? c.resolved_lead_source : (c as any)[h];
      return `"${(value || "").toString().replace(/"/g, '""')}"`;
    }).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `customers-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
    toast({ title: `Exported ${filtered.length} customers` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Customers ({customers.length})
        </h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> Export</Button>
          <Button disabled={selected.size === 0} size="sm" onClick={() => setSendOpen(true)}>
            <Mail className="w-4 h-4 mr-1" /> Email ({selected.size})
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="bg-card/50"><CardContent className="p-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <div><p className="text-[10px] text-muted-foreground uppercase">Total</p><p className="text-lg font-bold">{customers.length}</p></div>
        </CardContent></Card>
        <Card className="bg-card/50"><CardContent className="p-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <div><p className="text-[10px] text-muted-foreground uppercase">Total Invoices</p><p className="text-lg font-bold">{customers.reduce((s: number, c: any) => s + (c.total_invoices || 0), 0)}</p></div>
        </CardContent></Card>
        <Card className="bg-card/50"><CardContent className="p-3 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-primary" />
          <div><p className="text-[10px] text-muted-foreground uppercase">Total Revenue</p><p className="text-lg font-bold">₹{customers.reduce((s: number, c: any) => s + Number(c.total_spent || 0), 0).toLocaleString()}</p></div>
        </CardContent></Card>
      </div>

      {/* Lead Source Analytics */}
      {leadStats.length > 0 && (
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><Megaphone className="w-4 h-4 text-primary" /> Lead Source Analytics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {leadStats.map(([source, stats]) => {
                const maxRevenue = Math.max(...leadStats.map(([, s]) => s.revenue), 1);
                const pct = Math.round((stats.revenue / maxRevenue) * 100);
                return (
                  <div key={source} className="border border-border rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">{source}</Badge>
                      <span className="text-xs font-bold">{stats.count}</span>
                    </div>
                    <p className="text-sm font-semibold">₹{stats.revenue.toLocaleString()}</p>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{stats.invoices} invoices</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, phone..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3" /></button>}
        </div>
        <select className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={leadFilter} onChange={(e) => { setLeadFilter(e.target.value); setPage(1); }}>
          <option value="all">All Sources</option>
          {leadSources.map(src => <option key={src} value={src}>{src}</option>)}
        </select>
        <Button variant="outline" size="sm" onClick={toggleAll}>{selected.size === filtered.length && filtered.length > 0 ? "Deselect All" : "Select All"}</Button>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No customers found. Customers are auto-created when bookings are made.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="py-3 px-2 w-10"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Phone</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Source</th>
                <th className="text-center py-3 px-2 font-medium text-muted-foreground">Invoices</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total Spent</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Added</th>
              </tr></thead>
              <tbody>
                {paginated.map((c: any) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-2"><input type="checkbox" checked={selected.has(c.email)} onChange={() => c.email && toggle(c.email)} /></td>
                    <td className="py-3 px-2 font-medium">{c.name}</td>
                    <td className="py-3 px-2 hidden sm:table-cell text-muted-foreground">{c.email || "-"}</td>
                    <td className="py-3 px-2 hidden md:table-cell text-muted-foreground">{c.phone || "-"}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="text-[10px]">{c.resolved_lead_source}</Badge>
                    </td>
                    <td className="py-3 px-2 text-center">{c.total_invoices || 0}</td>
                    <td className="py-3 px-2 text-right font-semibold">₹{Number(c.total_spent || 0).toLocaleString()}</td>
                    <td className="py-3 px-2 text-right hidden md:table-cell text-muted-foreground">{c.created_at ? format(new Date(c.created_at), "dd MMM yyyy") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}

      {/* Send Email Dialog */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Send Email to {selected.size} Recipients</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Use Template</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={templateId} onChange={(e) => applyTemplate(e.target.value)}>
                <option value="">None (write custom)</option>
                {templates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Subject *</Label><Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} /></div>
            <div className="space-y-2"><Label>Body *</Label><Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={6} /></div>
            <Button onClick={sendEmails} disabled={sending} className="w-full">{sending ? "Sending..." : `Send to ${selected.size} recipients`}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
