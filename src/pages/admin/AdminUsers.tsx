import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, KeyRound, Shield, ShieldAlert, UserCog, Crown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const callAdmin = async (action: string, params: any = {}) => {
  const { data, error } = await supabase.functions.invoke("admin-management", {
    body: { action, ...params },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
};

const roleBadge = (role: string) => {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
    super_admin: { label: "Super Admin", variant: "destructive", icon: Crown },
    admin: { label: "Admin", variant: "default", icon: ShieldAlert },
    moderator: { label: "Moderator", variant: "secondary", icon: Shield },
  };
  const r = map[role] || { label: role, variant: "outline" as const, icon: Shield };
  return (
    <Badge variant={r.variant} className="gap-1">
      <r.icon className="w-3 h-3" /> {r.label}
    </Badge>
  );
};

const AdminUsers = () => {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [form, setForm] = useState({ email: "", password: "", role: "admin" });
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("admin");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await callAdmin("list");
      return res.users || [];
    },
  });

  const createUser = useMutation({
    mutationFn: () => callAdmin("create", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setCreateOpen(false);
      setForm({ email: "", password: "", role: "admin" });
      toast({ title: "Admin created successfully!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteUser = useMutation({
    mutationFn: (user_id: string) => callAdmin("delete", { user_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const changePassword = useMutation({
    mutationFn: () => callAdmin("change_password", { user_id: selectedUser?.id, new_password: newPassword }),
    onSuccess: () => {
      setPasswordOpen(false);
      setNewPassword("");
      toast({ title: "Password changed!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateRole = useMutation({
    mutationFn: () => callAdmin("update_role", { user_id: selectedUser?.id, role: newRole }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setRoleOpen(false);
      toast({ title: "Role updated!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Admin Management</h2>
          <p className="text-sm text-muted-foreground">Create, edit, and manage admin users and their access levels.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Admin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u: any) => {
          const isSelf = u.id === currentUser?.id;
          const isSuperAdmin = u.roles?.includes("super_admin");
          const primaryRole = u.roles?.includes("super_admin") ? "super_admin" : u.roles?.includes("admin") ? "admin" : u.roles?.[0] || "user";

          return (
            <Card key={u.id} className={isSelf ? "border-primary/50" : ""}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{u.email}</p>
                    <div className="flex flex-wrap gap-1">
                      {roleBadge(primaryRole)}
                      {isSelf && <Badge variant="outline" className="text-xs">You</Badge>}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>Created: {new Date(u.created_at).toLocaleDateString()}</p>
                  {u.last_sign_in_at && <p>Last login: {new Date(u.last_sign_in_at).toLocaleDateString()}</p>}
                </div>
                {!isSelf && (
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => { setSelectedUser(u); setNewRole(primaryRole); setRoleOpen(true); }}>
                      <UserCog className="w-3 h-3 mr-1" /> Role
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => { setSelectedUser(u); setPasswordOpen(true); }}>
                      <KeyRound className="w-3 h-3 mr-1" /> Password
                    </Button>
                    <Button variant="destructive" size="sm" className="text-xs" onClick={() => { if (confirm("Delete this admin?")) deleteUser.mutate(u.id); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Admin Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Admin</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full content access</SelectItem>
                  <SelectItem value="moderator">Moderator - Limited access</SelectItem>
                  <SelectItem value="super_admin">Super Admin - Full access + user management</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => {
              if (form.password.length < 6) {
                toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
                return;
              }
              createUser.mutate();
            }} disabled={createUser.isPending || !form.email || !form.password} className="w-full">
              {createUser.isPending ? "Creating..." : "Create Admin"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Password for {selectedUser?.email}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <Button onClick={() => changePassword.mutate()} disabled={changePassword.isPending} className="w-full">
              {changePassword.isPending ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Role for {selectedUser?.email}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin - Full content access</SelectItem>
                <SelectItem value="moderator">Moderator - Limited access</SelectItem>
                <SelectItem value="super_admin">Super Admin - Full access + user management</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => updateRole.mutate()} disabled={updateRole.isPending} className="w-full">
              {updateRole.isPending ? "Updating..." : "Update Role"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
