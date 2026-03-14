import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Phone, Mail, MapPin, MessageCircle, Building, Palette, Check, Sun, Moon, Eye, EyeOff, Plus, X, Navigation, FileText, ShieldAlert, LayoutDashboard, Shield } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useTheme, themes } from "@/hooks/useTheme";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const db = (table: string) => (supabase as any).from(table);

const navItems = [
  { key: "packages", label: "Packages" },
  { key: "vehicles", label: "Vehicles" },
  { key: "destinations", label: "Destinations" },
  { key: "hotels", label: "Hotels" },
  { key: "offers", label: "Offers" },
  { key: "blogs", label: "Blogs" },
  { key: "gallery", label: "Gallery" },
  { key: "contact", label: "Contact" },
];

const businessModes = [
  { value: "full", label: "Full Travel Agency", desc: "All features: Packages, Hotels, Vehicles, Invoices, etc." },
  { value: "package_only", label: "Package Only", desc: "Tour packages, vehicles, destinations, bookings & invoices" },
  { value: "hotel_only", label: "Hotel Only", desc: "Hotels, hotel bookings, reviews & invoices" },
  { value: "invoice_only", label: "Invoice Only", desc: "Just invoicing system with customers" },
];

// Admin sidebar modules per business mode (mirrored from useBusinessMode)
const MODE_ADMIN_MODULES: Record<string, string[]> = {
  full: [], // empty = all visible
  package_only: [
    "dashboard", "homepage", "packages", "vehicles", "vehicle_types", "destinations",
    "offers", "gallery", "bookings", "drivers", "customers", "invoices", "invoice_brands",
    "itinerary", "itinerary_history", "contacts", "notifications", "reviews", "blogs",
    "blog_comments", "social_links", "users", "pages", "settings", "role_permissions",
  ],
  hotel_only: [
    "dashboard", "homepage", "hotels", "hotel_bookings", "hotel_reviews",
    "bookings", "customers", "invoices", "invoice_brands", "contacts", "notifications",
    "reviews", "blogs", "blog_comments", "social_links", "users", "pages", "settings",
    "role_permissions", "gallery", "offers",
  ],
  invoice_only: [
    "dashboard", "invoices", "invoice_brands", "customers", "contacts", "notifications",
    "users", "pages", "settings", "role_permissions",
  ],
};

// Frontend nav items per business mode
const MODE_NAV_DEFAULTS: Record<string, string[]> = {
  full: ["packages", "vehicles", "destinations", "hotels", "offers", "blogs", "gallery", "contact"],
  package_only: ["packages", "vehicles", "destinations", "offers", "blogs", "gallery", "contact"],
  hotel_only: ["hotels", "offers", "blogs", "gallery", "contact"],
  invoice_only: ["contact"],
};

const ALL_ADMIN_MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "homepage", label: "Homepage" },
  { key: "packages", label: "Packages" },
  { key: "vehicles", label: "Vehicles" },
  { key: "vehicle_types", label: "Vehicle Types" },
  { key: "destinations", label: "Destinations" },
  { key: "hotels", label: "Hotels" },
  { key: "hotel_bookings", label: "Hotel Bookings" },
  { key: "hotel_reviews", label: "Hotel Reviews" },
  { key: "offers", label: "Offers" },
  { key: "gallery", label: "Gallery" },
  { key: "bookings", label: "Bookings" },
  { key: "drivers", label: "Drivers" },
  { key: "customers", label: "Customers" },
  { key: "invoices", label: "Invoices" },
  { key: "invoice_brands", label: "Invoice Brands" },
  { key: "itinerary", label: "Itinerary Maker" },
  { key: "itinerary_history", label: "Itinerary History" },
  { key: "contacts", label: "Messages" },
  { key: "notifications", label: "Notifications" },
  { key: "reviews", label: "Reviews" },
  { key: "blogs", label: "Blogs" },
  { key: "blog_comments", label: "Blog Comments" },
  { key: "social_links", label: "Social Links" },
];

const AdminSettings = () => {
  const qc = useQueryClient();
  const { currentTheme, setTheme, mode, toggleMode } = useTheme();
  const [form, setForm] = useState({
    company_name: "",
    tagline: "",
    contact_email: "",
    phone: "",
    whatsapp: "",
    office_address: "",
    doc_primary_color: "#2563eb",
    doc_secondary_color: "#7c3aed",
    doc_accent_color: "#f59e0b",
    doc_font_family: "Inter",
    business_mode: "full",
    map_lat: "28.6139",
    map_lng: "77.2090",
    invoice_terms: "",
    invoice_cancellation_policy: "",
    package_terms: "",
    package_cancellation_policy: "",
    show_theme_toggle: true,
  });
  const [navbarItems, setNavbarItems] = useState<Record<string, boolean>>({});
  const [leadSources, setLeadSources] = useState<string[]>([]);
  const [newLeadSource, setNewLeadSource] = useState("");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await db("site_settings").select("*").limit(1).single();
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setForm({
        company_name: settings.company_name || "",
        tagline: settings.tagline || "",
        contact_email: settings.contact_email || "",
        phone: settings.phone || "",
        whatsapp: settings.whatsapp || "",
        office_address: settings.office_address || "",
        doc_primary_color: settings.doc_primary_color || "#2563eb",
        doc_secondary_color: settings.doc_secondary_color || "#7c3aed",
        doc_accent_color: settings.doc_accent_color || "#f59e0b",
        doc_font_family: settings.doc_font_family || "Inter",
        business_mode: settings.business_mode || "full",
        map_lat: settings.map_lat || "28.6139",
        map_lng: settings.map_lng || "77.2090",
        invoice_terms: settings.invoice_terms || "",
        invoice_cancellation_policy: settings.invoice_cancellation_policy || "",
        package_terms: settings.package_terms || "",
        package_cancellation_policy: settings.package_cancellation_policy || "",
        show_theme_toggle: settings.show_theme_toggle !== false,
      });
      setNavbarItems(settings.navbar_items || { packages: true, vehicles: true, destinations: true, hotels: true, offers: true, blogs: true, gallery: true, contact: true });
      setLeadSources(settings.lead_sources || ["Website", "WhatsApp", "Phone", "Walk-in", "Facebook", "Instagram", "Google", "Referral"]);
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      if (!settings?.id) throw new Error("No settings found");
      const { error } = await db("site_settings").update({
        ...form,
        navbar_items: navbarItems,
        lead_sources: leadSources,
      }).eq("id", settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: "Settings saved!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <p>Loading...</p>;

  const darkThemes = themes.filter(t => t.mode === "dark");
  const lightThemes = themes.filter(t => t.mode === "light");

  const fields = [
    { key: "company_name", label: "Company Name", icon: Building, placeholder: "Your Travel Company" },
    { key: "tagline", label: "Tagline", icon: Building, placeholder: "Book your dream trip!" },
    { key: "contact_email", label: "Contact Email", icon: Mail, placeholder: "info@company.com" },
    { key: "phone", label: "Phone Number", icon: Phone, placeholder: "+91 XXXXX XXXXX" },
    { key: "whatsapp", label: "WhatsApp Number", icon: MessageCircle, placeholder: "+919876543210" },
    { key: "office_address", label: "Office Address", icon: MapPin, placeholder: "Full office address" },
  ];

  const addLeadSource = () => {
    if (newLeadSource.trim() && !leadSources.includes(newLeadSource.trim())) {
      setLeadSources([...leadSources, newLeadSource.trim()]);
      setNewLeadSource("");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Site Settings</h2>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          <Save className="w-4 h-4 mr-2" /> {save.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Business Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" /> Business Mode
          </CardTitle>
          <p className="text-sm text-muted-foreground">Choose which features to enable. This controls the admin sidebar, dashboard stats, and public homepage.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {businessModes.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => {
                  setForm({ ...form, business_mode: m.value });
                  // Auto-set navbar items based on mode
                  const modeNav = MODE_NAV_DEFAULTS[m.value] || MODE_NAV_DEFAULTS.full;
                  const newNavbar: Record<string, boolean> = {};
                  navItems.forEach(n => { newNavbar[n.key] = modeNav.includes(n.key); });
                  setNavbarItems(newNavbar);
                }}
                className={`text-left p-4 rounded-xl border-2 transition-all ${form.business_mode === m.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 bg-muted/20"}`}
              >
                <div className="font-semibold text-sm text-foreground">{m.label}</div>
                <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
              </button>
            ))}
          </div>

          {/* Module Preview for selected business mode */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <LayoutDashboard className="w-4 h-4" /> Admin Sidebar Modules
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ADMIN_MODULES.map((mod) => {
                const isVisible = form.business_mode === "full" || (MODE_ADMIN_MODULES[form.business_mode]?.includes(mod.key) ?? false);
                return (
                  <Badge
                    key={mod.key}
                    variant={isVisible ? "default" : "outline"}
                    className={`text-xs ${isVisible ? "" : "opacity-40 line-through"}`}
                  >
                    {isVisible ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                    {mod.label}
                  </Badge>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mt-3">
              <Navigation className="w-4 h-4" /> Website Navbar Pages
            </div>
            <div className="flex flex-wrap gap-1.5">
              {navItems.map((item) => {
                const isVisible = navbarItems[item.key] !== false;
                return (
                  <Badge
                    key={item.key}
                    variant={isVisible ? "default" : "outline"}
                    className={`text-xs ${isVisible ? "" : "opacity-40 line-through"}`}
                  >
                    {isVisible ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                    {item.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navbar Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" /> Navbar Items
          </CardTitle>
          <p className="text-sm text-muted-foreground">Fine-tune which pages appear in the website navigation bar. Business mode sets defaults, but you can override here.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {navItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                <span className="text-sm font-medium">{item.label}</span>
                <Switch
                  checked={navbarItems[item.key] !== false}
                  onCheckedChange={(checked) => setNavbarItems({ ...navbarItems, [item.key]: checked })}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lead Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" /> Lead Sources
          </CardTitle>
          <p className="text-sm text-muted-foreground">Manage where your booking leads come from. These appear as a dropdown when creating bookings.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {leadSources.map((src, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-muted/50 border border-border rounded-full px-3 py-1.5 text-sm">
                {src}
                <button onClick={() => setLeadSources(leadSources.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newLeadSource}
              onChange={(e) => setNewLeadSource(e.target.value)}
              placeholder="Add new lead source..."
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLeadSource())}
              className="max-w-xs"
            />
            <Button type="button" variant="outline" size="sm" onClick={addLeadSource}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" /> Theme
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Choose a color theme for your website.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.show_theme_toggle} onCheckedChange={(v) => setForm({ ...form, show_theme_toggle: v })} />
                <Label className="text-xs text-muted-foreground">Show toggle on website</Label>
              </div>
              <Button variant="outline" size="sm" onClick={toggleMode} className="gap-2">
                {mode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {mode === "dark" ? "Light Mode" : "Dark Mode"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Moon className="w-4 h-4" /> Dark Themes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {darkThemes.map((theme) => {
                const isActive = currentTheme.id === theme.id;
                return (
                  <button key={theme.id} onClick={() => setTheme(theme.id)} className={`relative p-4 rounded-xl border-2 transition-all text-left group ${isActive ? "border-primary bg-primary/5 shadow-[var(--glow-primary)]" : "border-border hover:border-primary/40 bg-muted/30"}`}>
                    {isActive && <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Check className="w-3.5 h-3.5 text-primary-foreground" /></div>}
                    <div className="flex gap-2 mb-3">{theme.preview.map((color, i) => <div key={i} className="w-8 h-8 rounded-full border border-border/50 shadow-sm" style={{ backgroundColor: color }} />)}</div>
                    <h4 className="font-display font-semibold text-sm mb-0.5">{theme.name}</h4>
                    <p className="text-xs text-muted-foreground">{theme.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Sun className="w-4 h-4" /> Light Themes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lightThemes.map((theme) => {
                const isActive = currentTheme.id === theme.id;
                return (
                  <button key={theme.id} onClick={() => setTheme(theme.id)} className={`relative p-4 rounded-xl border-2 transition-all text-left group ${isActive ? "border-primary bg-primary/5 shadow-[var(--glow-primary)]" : "border-border hover:border-primary/40 bg-muted/30"}`}>
                    {isActive && <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Check className="w-3.5 h-3.5 text-primary-foreground" /></div>}
                    <div className="flex gap-2 mb-3">{theme.preview.map((color, i) => <div key={i} className="w-8 h-8 rounded-full border border-border/50 shadow-sm" style={{ backgroundColor: color }} />)}</div>
                    <h4 className="font-display font-semibold text-sm mb-0.5">{theme.name}</h4>
                    <p className="text-xs text-muted-foreground">{theme.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Design */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Invoice & Itinerary Design</CardTitle>
          <p className="text-sm text-muted-foreground">Customize colors and font for generated documents.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2"><Label className="text-xs">Primary Color</Label><div className="flex items-center gap-2"><input type="color" value={form.doc_primary_color} onChange={(e) => setForm({ ...form, doc_primary_color: e.target.value })} className="w-10 h-10 rounded border border-border cursor-pointer" /><Input value={form.doc_primary_color} onChange={(e) => setForm({ ...form, doc_primary_color: e.target.value })} className="flex-1" /></div></div>
            <div className="space-y-2"><Label className="text-xs">Secondary Color</Label><div className="flex items-center gap-2"><input type="color" value={form.doc_secondary_color} onChange={(e) => setForm({ ...form, doc_secondary_color: e.target.value })} className="w-10 h-10 rounded border border-border cursor-pointer" /><Input value={form.doc_secondary_color} onChange={(e) => setForm({ ...form, doc_secondary_color: e.target.value })} className="flex-1" /></div></div>
            <div className="space-y-2"><Label className="text-xs">Accent Color</Label><div className="flex items-center gap-2"><input type="color" value={form.doc_accent_color} onChange={(e) => setForm({ ...form, doc_accent_color: e.target.value })} className="w-10 h-10 rounded border border-border cursor-pointer" /><Input value={form.doc_accent_color} onChange={(e) => setForm({ ...form, doc_accent_color: e.target.value })} className="flex-1" /></div></div>
            <div className="space-y-2"><Label className="text-xs">Font Family</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={form.doc_font_family} onChange={(e) => setForm({ ...form, doc_font_family: e.target.value })}>
                <option value="Inter">Inter</option><option value="Poppins">Poppins</option><option value="Roboto">Roboto</option><option value="Open Sans">Open Sans</option><option value="Lato">Lato</option><option value="Montserrat">Montserrat</option><option value="Playfair Display">Playfair Display</option>
              </select>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-border">
            <div style={{ background: `linear-gradient(135deg, ${form.doc_primary_color}, ${form.doc_secondary_color})`, padding: "24px 32px", color: "#fff", fontFamily: form.doc_font_family }}>
              <p className="text-xs uppercase tracking-widest opacity-80">Preview</p>
              <p className="text-xl font-bold mt-1">Document Title</p>
              <p className="text-sm opacity-90 mt-1">This is how your invoice and itinerary headers will look</p>
            </div>
            <div className="p-4 bg-card text-sm text-muted-foreground" style={{ fontFamily: form.doc_font_family }}>
              <p>Body text with <span style={{ color: form.doc_accent_color, fontWeight: 700 }}>accent highlights</span> using your selected font.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Cancellation Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Terms & Cancellation Policies</CardTitle>
          <p className="text-sm text-muted-foreground">These will appear in generated Invoice PDFs and Itinerary/Package PDFs.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" /> Invoice Terms & Conditions</Label>
            <Textarea value={form.invoice_terms} onChange={(e) => setForm({ ...form, invoice_terms: e.target.value })} rows={5} placeholder={"1. Payment is due within 15 days of invoice date.\n2. Late payments may attract interest at 2% per month.\n3. All disputes are subject to local jurisdiction."} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-muted-foreground" /> Invoice Cancellation Policy</Label>
            <Textarea value={form.invoice_cancellation_policy} onChange={(e) => setForm({ ...form, invoice_cancellation_policy: e.target.value })} rows={4} placeholder={"Cancellation within 24 hours: Full refund\nCancellation within 48 hours: 50% refund\nAfter 48 hours: No refund"} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" /> Package / Itinerary Terms & Conditions</Label>
            <Textarea value={form.package_terms} onChange={(e) => setForm({ ...form, package_terms: e.target.value })} rows={5} placeholder={"1. Booking is confirmed only after receiving confirmation.\n2. Fares are calculated based on distance, duration, and vehicle category.\n3. Vehicle images are indicative and may be substituted."} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-muted-foreground" /> Package Cancellation Policy</Label>
            <Textarea value={form.package_cancellation_policy} onChange={(e) => setForm({ ...form, package_cancellation_policy: e.target.value })} rows={4} placeholder={"30+ days before travel: 10% cancellation charge\n15-30 days: 25% charge\n7-15 days: 50% charge\nLess than 7 days: No refund"} />
          </div>
        </CardContent>
      </Card>

      {/* Map Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Contact Page Map Location
          </CardTitle>
          <p className="text-sm text-muted-foreground">Set the latitude and longitude for the map displayed on the Contact page. You can find coordinates from Google Maps.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Latitude</Label>
              <Input value={form.map_lat} onChange={(e) => setForm({ ...form, map_lat: e.target.value })} placeholder="28.6139" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Longitude</Label>
              <Input value={form.map_lng} onChange={(e) => setForm({ ...form, map_lng: e.target.value })} placeholder="77.2090" />
            </div>
          </div>
          {form.map_lat && form.map_lng && (
            <div className="rounded-xl overflow-hidden border border-border aspect-video">
              <iframe
                title="Map Preview"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${form.map_lat},${form.map_lng}&zoom=15`}
                allowFullScreen
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Global Contact Information</CardTitle>
          <p className="text-sm text-muted-foreground">Used across the website — header, footer, contact page, and booking forms.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {fields.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label className="flex items-center gap-2"><f.icon className="w-4 h-4 text-muted-foreground" /> {f.label}</Label>
              <Input value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
