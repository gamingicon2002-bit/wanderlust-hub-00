import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Eye, Pencil, EyeOff, Save, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const db = (table: string) => (supabase as any).from(table);

const ALL_MODULES = [
  { key: "dashboard", label: "Dashboard", group: "Overview" },
  { key: "homepage", label: "Homepage", group: "Content" },
  { key: "packages", label: "Packages", group: "Content" },
  { key: "vehicles", label: "Vehicles", group: "Content" },
  { key: "vehicle_types", label: "Vehicle Types", group: "Content" },
  { key: "destinations", label: "Destinations", group: "Content" },
  { key: "hotels", label: "Hotels", group: "Content" },
  { key: "offers", label: "Offers", group: "Content" },
  { key: "gallery", label: "Gallery", group: "Content" },
  { key: "hotel_bookings", label: "Hotel Bookings", group: "Hotels" },
  { key: "hotel_reviews", label: "Hotel Reviews", group: "Hotels" },
  { key: "bookings", label: "Bookings", group: "Operations" },
  { key: "drivers", label: "Drivers", group: "Operations" },
  { key: "customers", label: "Customers", group: "Operations" },
  { key: "invoices", label: "Invoices", group: "Operations" },
  { key: "invoice_brands", label: "Invoice Brands", group: "Operations" },
  { key: "itinerary", label: "Itinerary Maker", group: "Operations" },
  { key: "itinerary_history", label: "Itinerary History", group: "Operations" },
  { key: "contacts", label: "Messages", group: "Communication" },
  { key: "notifications", label: "Notifications", group: "Communication" },
  { key: "reviews", label: "Reviews", group: "Communication" },
  { key: "blogs", label: "Blogs", group: "Communication" },
  { key: "blog_comments", label: "Blog Comments", group: "Communication" },
  { key: "social_links", label: "Social Links", group: "Communication" },
  { key: "users", label: "Admin Users", group: "System" },
  { key: "pages", label: "Pages", group: "System" },
  { key: "settings", label: "Settings", group: "System" },
  { key: "role_permissions", label: "Role Permissions", group: "System" },
];

const ROLES = ["admin", "moderator"];

const AdminRolePermissions = () => {
  const qc = useQueryClient();
  const [selectedRole, setSelectedRole] = useState("moderator");
  const [localPerms, setLocalPerms] = useState<Record<string, { can_view: boolean; can_edit: boolean; is_hidden: boolean; can_view_all: boolean }>>({});

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["role-permissions"],
    queryFn: async () => { const { data } = await db("role_permissions").select("*"); return data || []; },
  });

  const DATA_MODULES = ["bookings", "invoices", "customers"];

  useEffect(() => {
    const permsForRole: Record<string, any> = {};
    ALL_MODULES.forEach(m => {
      const existing = permissions.find((p: any) => p.role === selectedRole && p.module === m.key);
      permsForRole[m.key] = existing
        ? { can_view: existing.can_view, can_edit: existing.can_edit, is_hidden: existing.is_hidden, can_view_all: existing.can_view_all ?? false }
        : { can_view: true, can_edit: false, is_hidden: false, can_view_all: false };
    });
    setLocalPerms(permsForRole);
  }, [permissions, selectedRole]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Delete existing for this role, then insert all
      await db("role_permissions").delete().eq("role", selectedRole);
      const rows = ALL_MODULES.map(m => ({
        role: selectedRole,
        module: m.key,
        can_view: localPerms[m.key]?.can_view ?? true,
        can_edit: localPerms[m.key]?.can_edit ?? false,
        is_hidden: localPerms[m.key]?.is_hidden ?? false,
        can_view_all: localPerms[m.key]?.can_view_all ?? false,
      }));
      const { error } = await db("role_permissions").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["role-permissions"] });
      toast({ title: "Permissions saved" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggle = (module: string, field: "can_view" | "can_edit" | "is_hidden" | "can_view_all") => {
    setLocalPerms(prev => ({
      ...prev,
      [module]: { ...prev[module], [field]: !prev[module]?.[field] },
    }));
  };

  const groups = useMemo(() => {
    const g: Record<string, typeof ALL_MODULES> = {};
    ALL_MODULES.forEach(m => { if (!g[m.group]) g[m.group] = []; g[m.group].push(m); });
    return g;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-primary" /> Role Permissions</h2>
        <div className="flex items-center gap-3">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-1" /> {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Configure which modules each role can view, edit, or is hidden from. <strong>"View All"</strong> (for Bookings, Invoices, Customers) lets moderators see all records — otherwise they only see data they created. Super admins always have full access.
      </div>

      {isLoading ? <p>Loading...</p> : (
        <div className="space-y-6">
          {Object.entries(groups).map(([groupName, modules]) => (
            <Card key={groupName}>
              <CardHeader className="py-3 px-4"><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{groupName}</CardTitle></CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                     <tr className="border-b border-border">
                       <th className="text-left p-3 font-medium">Module</th>
                       <th className="text-center p-3 font-medium w-24"><div className="flex items-center justify-center gap-1"><Eye className="w-3.5 h-3.5" /> View</div></th>
                       <th className="text-center p-3 font-medium w-24"><div className="flex items-center justify-center gap-1"><Pencil className="w-3.5 h-3.5" /> Edit</div></th>
                       <th className="text-center p-3 font-medium w-24"><div className="flex items-center justify-center gap-1"><EyeOff className="w-3.5 h-3.5" /> Hide</div></th>
                       <th className="text-center p-3 font-medium w-24"><div className="flex items-center justify-center gap-1"><Users className="w-3.5 h-3.5" /> View All</div></th>
                     </tr>
                  </thead>
                  <tbody>
                     {modules.map(m => (
                       <tr key={m.key} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                         <td className="p-3 font-medium text-foreground">{m.label}</td>
                         <td className="p-3 text-center">
                           <Switch checked={localPerms[m.key]?.can_view ?? true} onCheckedChange={() => toggle(m.key, "can_view")} />
                         </td>
                         <td className="p-3 text-center">
                           <Switch checked={localPerms[m.key]?.can_edit ?? false} onCheckedChange={() => toggle(m.key, "can_edit")} />
                         </td>
                         <td className="p-3 text-center">
                           <Switch checked={localPerms[m.key]?.is_hidden ?? false} onCheckedChange={() => toggle(m.key, "is_hidden")} />
                         </td>
                         <td className="p-3 text-center">
                           {DATA_MODULES.includes(m.key) ? (
                             <Switch checked={localPerms[m.key]?.can_view_all ?? false} onCheckedChange={() => toggle(m.key, "can_view_all")} />
                           ) : (
                             <span className="text-muted-foreground text-xs">—</span>
                           )}
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRolePermissions;
