import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, KeyRound, Lock, X, Car, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Pagination from "@/components/Pagination";

const db = (table: string) => (supabase as any).from(table);
const empty = { name: "", phone: "", email: "", license_number: "", experience_years: 0, photo: "", is_active: true };
const PER_PAGE = 10;

const callAdmin = async (action: string, params: any = {}) => {
  const { data, error } = await supabase.functions.invoke("admin-management", {
    body: { action, ...params },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
};

const AdminDrivers = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [accountOpen, setAccountOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [accountDriver, setAccountDriver] = useState<any>(null);
  const [accountForm, setAccountForm] = useState({ email: "", password: "" });
  const [newPassword, setNewPassword] = useState("");
  const [selectedDriverForPwd, setSelectedDriverForPwd] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: async () => { const { data } = await db("drivers").select("*").order("created_at", { ascending: false }); return data || []; },
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["admin-vehicles-list"],
    queryFn: async () => { const { data } = await db("vehicles").select("id, name, type").order("name"); return data || []; },
  });

  const { data: driverVehicles = [] } = useQuery({
    queryKey: ["driver-vehicles-all"],
    queryFn: async () => { const { data } = await db("driver_vehicles").select("*"); return data || []; },
  });

  const getDriverVehicleIds = (driverId: string) => {
    return driverVehicles.filter((dv: any) => dv.driver_id === driverId).map((dv: any) => dv.vehicle_id);
  };

  const getVehicleNames = (driverId: string) => {
    const vIds = getDriverVehicleIds(driverId);
    if (vIds.length === 0) return "—";
    return vehicles.filter((v: any) => vIds.includes(v.id)).map((v: any) => `${v.name}`).join(", ") || "—";
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return drivers;
    const q = search.toLowerCase();
    return drivers.filter((d: any) => d.name?.toLowerCase().includes(q) || d.phone?.toLowerCase().includes(q) || d.email?.toLowerCase().includes(q));
  }, [drivers, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const save = useMutation({
    mutationFn: async () => {
      let driverId: string;
      const payload = { ...form };
      if (editing) {
        const { error } = await db("drivers").update(payload).eq("id", editing.id);
        if (error) throw error;
        driverId = editing.id;
      } else {
        const { data: newD, error } = await db("drivers").insert(payload).select().single();
        if (error) throw error;
        driverId = newD.id;
      }
      await db("driver_vehicles").delete().eq("driver_id", driverId);
      if (selectedVehicleIds.length > 0) {
        const rows = selectedVehicleIds.map((vid, i) => ({ driver_id: driverId, vehicle_id: vid, is_primary: i === 0 }));
        const { error: e2 } = await db("driver_vehicles").insert(rows);
        if (e2) throw e2;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-drivers"] });
      qc.invalidateQueries({ queryKey: ["driver-vehicles-all"] });
      qc.invalidateQueries({ queryKey: ["driver-vehicles"] });
      setOpen(false); setEditing(null); setForm(empty); setSelectedVehicleIds([]);
      toast({ title: editing ? "Updated" : "Created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("drivers").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-drivers"] }); toast({ title: "Deleted" }); },
  });

  const createAccount = useMutation({
    mutationFn: async () => {
      await callAdmin("create_driver_account", { email: accountForm.email, password: accountForm.password, driver_id: accountDriver.id });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-drivers"] }); setAccountOpen(false); setAccountForm({ email: "", password: "" }); toast({ title: "Driver login account created!" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const changeDriverPassword = useMutation({
    mutationFn: async () => {
      if (!selectedDriverForPwd?.user_id) throw new Error("Driver has no login account");
      await callAdmin("change_password", { user_id: selectedDriverForPwd.user_id, new_password: newPassword });
    },
    onSuccess: () => { setPasswordOpen(false); setNewPassword(""); toast({ title: "Password changed!" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openEdit = (d: any) => {
    setEditing(d);
    setForm({ name: d.name, phone: d.phone, email: d.email || "", license_number: d.license_number || "", experience_years: d.experience_years || 0, photo: d.photo || "", is_active: d.is_active });
    setSelectedVehicleIds(getDriverVehicleIds(d.id));
    setOpen(true);
  };

  const toggleVehicle = (vid: string) => {
    setSelectedVehicleIds(prev => prev.includes(vid) ? prev.filter(v => v !== vid) : [...prev, vid]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Drivers ({drivers.length})</h2>
        <Button onClick={() => { setEditing(null); setForm(empty); setSelectedVehicleIds([]); setOpen(true); }}><Plus className="w-4 h-4 mr-1" /> Add Driver</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search drivers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3" /></button>}
      </div>
      {isLoading ? <p>Loading...</p> : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="hidden md:table-cell">License</TableHead>
                  <TableHead className="hidden lg:table-cell">Exp</TableHead>
                  <TableHead className="hidden md:table-cell">Vehicles</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {d.photo && <img src={d.photo} alt={d.name} className="w-8 h-8 rounded-full object-cover hidden sm:block" />}
                        <div>
                          <span>{d.name}</span>
                          <span className="block sm:hidden text-xs text-muted-foreground">{d.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{d.phone}</TableCell>
                    <TableCell className="hidden md:table-cell">{d.license_number || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{d.experience_years}y</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate text-xs">{getVehicleNames(d.id)}</TableCell>
                    <TableCell>
                      {d.user_id ? (
                        <div className="flex items-center gap-1">
                          <Badge variant="default" className="text-xs">Active</Badge>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelectedDriverForPwd(d); setNewPassword(""); setPasswordOpen(true); }} title="Change password">
                            <Lock className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { setAccountDriver(d); setAccountForm({ email: d.email || "", password: "" }); setAccountOpen(true); }}>
                          <KeyRound className="w-3 h-3 mr-1" /> Login
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={d.is_active ? "default" : "secondary"}>{d.is_active ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(d)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) remove.mutate(d.id); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}

      {/* Edit/Create Driver */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Driver" : "New Driver"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Phone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>License Number</Label><Input value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} /></div>
              <div className="space-y-2"><Label>Experience (years)</Label><Input type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Photo URL</Label><Input value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} /></div>
            </div>
            <div className="space-y-2 bg-muted/30 rounded-xl p-4">
              <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1"><Car className="w-3.5 h-3.5" /> Assign Vehicles ({selectedVehicleIds.length})</Label>
              {selectedVehicleIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedVehicleIds.map(vid => {
                    const v = vehicles.find((v: any) => v.id === vid);
                    return v ? (
                      <Badge key={vid} variant="secondary" className="gap-1 pr-1">
                        {v.name} ({v.type})
                        <button type="button" onClick={() => toggleVehicle(vid)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                {vehicles.map((v: any) => (
                  <label key={v.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded-lg px-2 py-1.5">
                    <Checkbox checked={selectedVehicleIds.includes(v.id)} onCheckedChange={() => toggleVehicle(v.id)} />
                    <span>{v.name} <span className="text-muted-foreground">({v.type})</span></span>
                  </label>
                ))}
              </div>
              {vehicles.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No vehicles available</p>}
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                <span className="text-sm font-medium text-foreground">Active Driver</span>
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Login for {accountDriver?.name}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will create a login account so the driver can access the Driver Portal.</p>
          <form onSubmit={(e) => { e.preventDefault(); createAccount.mutate(); }} className="space-y-4 mt-2">
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={accountForm.email} onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })} required placeholder="driver@example.com" /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={accountForm.password} onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })} required placeholder="Min 6 characters" minLength={6} /></div>
            <Button type="submit" className="w-full" disabled={createAccount.isPending}>{createAccount.isPending ? "Creating..." : "Create Driver Account"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Password — {selectedDriverForPwd?.name}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); changeDriverPassword.mutate(); }} className="space-y-4">
            <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Min 6 characters" minLength={6} /></div>
            <Button type="submit" className="w-full" disabled={changeDriverPassword.isPending}>{changeDriverPassword.isPending ? "Updating..." : "Update Password"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDrivers;