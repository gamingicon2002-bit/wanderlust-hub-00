import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Bell, Send, Mail, MessageCircle, Save, Plus, Pencil, Trash2 } from "lucide-react";

const db = (table: string) => (supabase as any).from(table);

const AdminNotifications = () => {
  const [tab, setTab] = useState("whatsapp");

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Notifications & Messaging</h2>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="whatsapp"><MessageCircle className="w-3.5 h-3.5 mr-1" /> WhatsApp</TabsTrigger>
          <TabsTrigger value="smtp"><Mail className="w-3.5 h-3.5 mr-1" /> SMTP</TabsTrigger>
          <TabsTrigger value="templates"><Send className="w-3.5 h-3.5 mr-1" /> Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp"><WhatsAppConfig /></TabsContent>
        <TabsContent value="smtp"><SmtpConfig /></TabsContent>
        <TabsContent value="templates"><EmailTemplates /></TabsContent>
      </Tabs>
    </div>
  );
};

const WhatsAppConfig = () => {
  const qc = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => { const { data } = await db("site_settings").select("*").limit(1).single(); return data; },
  });

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (settings && !form) {
      setForm({
        id: settings.id,
        whatsapp_api_url: settings.whatsapp_api_url || "",
        whatsapp_api_key: settings.whatsapp_api_key || "",
        whatsapp_enabled: settings.whatsapp_enabled || false,
        whatsapp_booking_template: settings.whatsapp_booking_template || "",
        whatsapp_admin_template: settings.whatsapp_admin_template || "",
      });
    }
  }, [settings, form]);

  const save = useMutation({
    mutationFn: async () => {
      const { id, ...payload } = form;
      const { error } = await db("site_settings").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["site-settings"] }); toast({ title: "WhatsApp settings saved" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (!form) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-green-500" /> WhatsApp Configuration</CardTitle>
        <p className="text-sm text-muted-foreground">Connect any WhatsApp Business API provider (e.g., Interakt, Wati, Meta Cloud API, Twilio).</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Label>Enable WhatsApp</Label>
          <input type="checkbox" checked={form.whatsapp_enabled} onChange={(e) => setForm({ ...form, whatsapp_enabled: e.target.checked })} className="w-4 h-4" />
        </div>
        <div className="space-y-2"><Label>API URL</Label><Input value={form.whatsapp_api_url} onChange={(e) => setForm({ ...form, whatsapp_api_url: e.target.value })} placeholder="https://api.provider.com/v1/messages" /></div>
        <div className="space-y-2"><Label>API Key / Token</Label><Input type="password" value={form.whatsapp_api_key} onChange={(e) => setForm({ ...form, whatsapp_api_key: e.target.value })} placeholder="Your API key" /></div>
        <div className="space-y-2">
          <Label>Booking Confirmation Template (Customer)</Label>
          <Textarea value={form.whatsapp_booking_template} onChange={(e) => setForm({ ...form, whatsapp_booking_template: e.target.value })} rows={3} />
          <p className="text-xs text-muted-foreground">Variables: {"{{customer_name}}, {{reference_name}}, {{travel_date}}, {{travel_time}}, {{pickup_location}}, {{drop_location}}"}</p>
        </div>
        <div className="space-y-2">
          <Label>Admin Notification Template</Label>
          <Textarea value={form.whatsapp_admin_template} onChange={(e) => setForm({ ...form, whatsapp_admin_template: e.target.value })} rows={3} />
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="w-4 h-4 mr-2" /> {save.isPending ? "Saving..." : "Save Settings"}</Button>
      </CardContent>
    </Card>
  );
};

const SmtpConfig = () => {
  const qc = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => { const { data } = await db("site_settings").select("*").limit(1).single(); return data; },
  });

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (settings && !form) {
      setForm({
        id: settings.id,
        smtp_host: settings.smtp_host || "",
        smtp_port: settings.smtp_port || "587",
        smtp_user: settings.smtp_user || "",
        smtp_pass: settings.smtp_pass || "",
        smtp_from_email: settings.smtp_from_email || "",
        smtp_from_name: settings.smtp_from_name || "",
        smtp_enabled: settings.smtp_enabled || false,
      });
    }
  }, [settings, form]);

  const save = useMutation({
    mutationFn: async () => {
      const { id, ...payload } = form;
      const { error } = await db("site_settings").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["site-settings"] }); toast({ title: "SMTP settings saved" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (!form) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-primary" /> SMTP Configuration</CardTitle>
        <p className="text-sm text-muted-foreground">Configure SMTP for sending emails. Use Gmail App Password, SendGrid, Mailgun, or any SMTP provider.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Label>Enable SMTP</Label>
          <input type="checkbox" checked={form.smtp_enabled} onChange={(e) => setForm({ ...form, smtp_enabled: e.target.checked })} className="w-4 h-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>SMTP Host</Label><Input value={form.smtp_host} onChange={(e) => setForm({ ...form, smtp_host: e.target.value })} placeholder="smtp.gmail.com" /></div>
          <div className="space-y-2"><Label>SMTP Port</Label><Input value={form.smtp_port} onChange={(e) => setForm({ ...form, smtp_port: e.target.value })} placeholder="587" /></div>
          <div className="space-y-2"><Label>Username / Email</Label><Input value={form.smtp_user} onChange={(e) => setForm({ ...form, smtp_user: e.target.value })} placeholder="you@gmail.com" /></div>
          <div className="space-y-2"><Label>Password / App Password</Label><Input type="password" value={form.smtp_pass} onChange={(e) => setForm({ ...form, smtp_pass: e.target.value })} placeholder="App password" /></div>
          <div className="space-y-2"><Label>From Email</Label><Input value={form.smtp_from_email} onChange={(e) => setForm({ ...form, smtp_from_email: e.target.value })} placeholder="noreply@company.com" /></div>
          <div className="space-y-2"><Label>From Name</Label><Input value={form.smtp_from_name} onChange={(e) => setForm({ ...form, smtp_from_name: e.target.value })} placeholder="Your Company" /></div>
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="w-4 h-4 mr-2" /> {save.isPending ? "Saving..." : "Save Settings"}</Button>
      </CardContent>
    </Card>
  );
};

const EmailTemplates = () => {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", subject: "", body: "", template_type: "general" });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => { const { data } = await db("email_templates").select("*").order("created_at", { ascending: false }); return data || []; },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) { const { error } = await db("email_templates").update(form).eq("id", editing.id); if (error) throw error; }
      else { const { error } = await db("email_templates").insert(form); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["email-templates"] }); setFormOpen(false); setEditing(null); toast({ title: "Saved" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("email_templates").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["email-templates"] }); toast({ title: "Deleted" }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Email Templates</h3>
        <Button onClick={() => { setEditing(null); setForm({ name: "", subject: "", body: "", template_type: "general" }); setFormOpen(true); }}><Plus className="w-4 h-4 mr-2" /> New Template</Button>
      </div>

      {isLoading ? <p>Loading...</p> : templates.length === 0 ? <p className="text-muted-foreground text-center py-4">No templates yet.</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t: any) => (
            <Card key={t.id} className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div><h4 className="font-semibold">{t.name}</h4><p className="text-xs text-muted-foreground">{t.template_type} • {t.subject}</p></div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(t); setForm({ name: t.name, subject: t.subject, body: t.body, template_type: t.template_type }); setFormOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { if (confirm("Delete?")) remove.mutate(t.id); }}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{t.body?.replace(/<[^>]*>/g, "")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Template" : "New Template"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="space-y-2"><Label>Template Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Type</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={form.template_type} onChange={(e) => setForm({ ...form, template_type: e.target.value })}>
                <option value="general">General</option><option value="booking">Booking</option><option value="promotion">Promotion</option><option value="welcome">Welcome</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Body (HTML supported)</Label>
              <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={8} />
              <p className="text-xs text-muted-foreground">Variables: {"{{customer_name}}, {{customer_email}}, {{reference_name}}, {{travel_date}}, {{company_name}}"}</p>
            </div>
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

export default AdminNotifications;
