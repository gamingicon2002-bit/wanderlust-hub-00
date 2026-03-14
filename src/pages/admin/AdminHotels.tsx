import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Star, Search, X, BedDouble, Hotel } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import RichTextEditor from "@/components/RichTextEditor";
import Pagination from "@/components/Pagination";

const db = (table: string) => (supabase as any).from(table);
const emptyHotel = {
  name: "", location: "", destination: "", description: "", short_description: "",
  image: "", images: [] as string[], price_per_night: 0, rating: 0,
  amenities: [] as string[], contact_phone: "", contact_email: "", is_active: true
};
const emptyRoom = {
  hotel_id: "", room_number: "", room_type: "standard", ac_type: "ac",
  beds: 1, pillows: 2, sheets: 2, price_per_night: 0, images: [] as string[],
  is_available: true, floor: "",
};
const PER_PAGE = 10;

const AdminHotels = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyHotel);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // Rooms
  const [roomOpen, setRoomOpen] = useState(false);
  const [roomEditing, setRoomEditing] = useState<any>(null);
  const [roomForm, setRoomForm] = useState(emptyRoom);
  const [roomSearch, setRoomSearch] = useState("");
  const [roomPage, setRoomPage] = useState(1);

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ["admin-hotels"],
    queryFn: async () => { const { data } = await db("hotels").select("*").order("created_at", { ascending: false }); return data || []; },
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["admin-hotel-rooms"],
    queryFn: async () => { const { data } = await db("hotel_rooms").select("*").order("room_number"); return data || []; },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return hotels;
    const q = search.toLowerCase();
    return hotels.filter((h: any) => h.name?.toLowerCase().includes(q) || h.destination?.toLowerCase().includes(q) || h.location?.toLowerCase().includes(q));
  }, [hotels, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const filteredRooms = useMemo(() => {
    if (!roomSearch.trim()) return rooms;
    const q = roomSearch.toLowerCase();
    return rooms.filter((r: any) => r.room_number?.toLowerCase().includes(q) || r.room_type?.toLowerCase().includes(q));
  }, [rooms, roomSearch]);
  const roomTotalPages = Math.ceil(filteredRooms.length / PER_PAGE);
  const roomPaginated = filteredRooms.slice((roomPage - 1) * PER_PAGE, roomPage * PER_PAGE);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, images: form.images.filter(Boolean), amenities: form.amenities.filter(Boolean) };
      if (editing) { const { error } = await db("hotels").update(payload).eq("id", editing.id); if (error) throw error; }
      else { const { error } = await db("hotels").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-hotels"] }); setOpen(false); setEditing(null); setForm(emptyHotel); toast({ title: editing ? "Updated" : "Created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("hotels").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-hotels"] }); toast({ title: "Deleted" }); },
  });

  const saveRoom = useMutation({
    mutationFn: async () => {
      const payload = { ...roomForm, images: roomForm.images.filter(Boolean) };
      if (roomEditing) { const { error } = await db("hotel_rooms").update(payload).eq("id", roomEditing.id); if (error) throw error; }
      else { const { error } = await db("hotel_rooms").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-hotel-rooms"] }); setRoomOpen(false); setRoomEditing(null); setRoomForm(emptyRoom); toast({ title: roomEditing ? "Room Updated" : "Room Created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const removeRoom = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("hotel_rooms").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-hotel-rooms"] }); toast({ title: "Room Deleted" }); },
  });

  const openEdit = (h: any) => {
    setEditing(h);
    setForm({ name: h.name, location: h.location, destination: h.destination, description: h.description || "", short_description: h.short_description || "", image: h.image || "", images: h.images || [], price_per_night: h.price_per_night || 0, rating: h.rating || 0, amenities: h.amenities || [], contact_phone: h.contact_phone || "", contact_email: h.contact_email || "", is_active: h.is_active });
    setOpen(true);
  };

  const openRoomEdit = (r: any) => {
    setRoomEditing(r);
    setRoomForm({ hotel_id: r.hotel_id, room_number: r.room_number, room_type: r.room_type, ac_type: r.ac_type, beds: r.beds, pillows: r.pillows, sheets: r.sheets, price_per_night: r.price_per_night || 0, images: r.images || [], is_available: r.is_available, floor: r.floor || "" });
    setRoomOpen(true);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="hotels">
        <TabsList>
          <TabsTrigger value="hotels"><Hotel className="w-4 h-4 mr-1" /> Hotels ({hotels.length})</TabsTrigger>
          <TabsTrigger value="rooms"><BedDouble className="w-4 h-4 mr-1" /> Rooms ({rooms.length})</TabsTrigger>
        </TabsList>

        {/* Hotels Tab */}
        <TabsContent value="hotels" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search hotels..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
              {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3" /></button>}
            </div>
            <Button onClick={() => { setEditing(null); setForm(emptyHotel); setOpen(true); }}><Plus className="w-4 h-4 mr-1" /> Add Hotel</Button>
          </div>
          {isLoading ? <p>Loading...</p> : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Location</TableHead>
                      <TableHead className="hidden md:table-cell">Destination</TableHead>
                      <TableHead>Price/Night</TableHead>
                      <TableHead className="hidden sm:table-cell">Rating</TableHead>
                      <TableHead>Rooms</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((h: any) => (
                      <TableRow key={h.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {h.image && <img src={h.image} alt={h.name} className="w-8 h-8 rounded object-cover hidden sm:block" />}
                            {h.name}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{h.location}</TableCell>
                        <TableCell className="hidden md:table-cell">{h.destination}</TableCell>
                        <TableCell>Rs.{h.price_per_night?.toLocaleString()}</TableCell>
                        <TableCell className="hidden sm:table-cell"><div className="flex items-center gap-1"><Star className="w-3 h-3 text-primary fill-primary" />{h.rating}</div></TableCell>
                        <TableCell>{rooms.filter((r: any) => r.hotel_id === h.id).length}</TableCell>
                        <TableCell><Badge variant={h.is_active ? "default" : "secondary"}>{h.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(h)}><Pencil className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) remove.mutate(h.id); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search rooms..." value={roomSearch} onChange={(e) => { setRoomSearch(e.target.value); setRoomPage(1); }} className="pl-9" />
              {roomSearch && <button onClick={() => { setRoomSearch(""); setRoomPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3" /></button>}
            </div>
            <Button onClick={() => { setRoomEditing(null); setRoomForm(emptyRoom); setRoomOpen(true); }}><Plus className="w-4 h-4 mr-1" /> Add Room</Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room No.</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>AC</TableHead>
                  <TableHead>Beds</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomPaginated.map((r: any) => {
                  const hotel = hotels.find((h: any) => h.id === r.hotel_id);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.room_number}</TableCell>
                      <TableCell>{hotel?.name || "-"}</TableCell>
                      <TableCell className="capitalize">{r.room_type}</TableCell>
                      <TableCell><Badge variant={r.ac_type === "ac" ? "default" : "secondary"}>{r.ac_type?.toUpperCase()}</Badge></TableCell>
                      <TableCell>{r.beds}</TableCell>
                      <TableCell>{r.floor || "-"}</TableCell>
                      <TableCell>Rs.{r.price_per_night?.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={r.is_available ? "default" : "secondary"}>{r.is_available ? "Available" : "Occupied"}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openRoomEdit(r)}><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete room?")) removeRoom.mutate(r.id); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {roomTotalPages > 1 && <Pagination currentPage={roomPage} totalPages={roomTotalPages} onPageChange={setRoomPage} />}
        </TabsContent>
      </Tabs>

      {/* Hotel Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Hotel" : "New Hotel"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Hotel Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Location *</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State" required /></div>
              <div className="space-y-2"><Label>Destination *</Label><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Price per Night</Label><Input type="number" value={form.price_per_night} onChange={(e) => setForm({ ...form, price_per_night: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Rating (0-5)</Label><Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Cover Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Short Description</Label><Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></div>
            <div className="space-y-2"><Label>Full Description</Label><RichTextEditor content={form.description} onChange={(html) => setForm({ ...form, description: html })} /></div>
            <div className="space-y-2"><Label>Amenities (one per line)</Label><Textarea rows={3} value={form.amenities.join("\n")} onChange={(e) => setForm({ ...form, amenities: e.target.value.split("\n") })} placeholder="WiFi&#10;Pool&#10;Restaurant" /></div>
            <div className="space-y-2"><Label>Gallery Images (one URL per line)</Label><Textarea rows={2} value={form.images.join("\n")} onChange={(e) => setForm({ ...form, images: e.target.value.split("\n") })} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Contact Phone</Label><Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Contact Email</Label><Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
              <span className="text-sm font-medium text-foreground">Active</span>
            </label>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Room Dialog */}
      <Dialog open={roomOpen} onOpenChange={setRoomOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{roomEditing ? "Edit Room" : "New Room"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveRoom.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Hotel *</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={roomForm.hotel_id} onChange={(e) => setRoomForm({ ...roomForm, hotel_id: e.target.value })} required>
                <option value="">Select hotel</option>
                {hotels.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Room Number *</Label><Input value={roomForm.room_number} onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })} placeholder="101" required /></div>
              <div className="space-y-2"><Label>Floor</Label><Input value={roomForm.floor} onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })} placeholder="1st" /></div>
              <div className="space-y-2">
                <Label>Room Type</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={roomForm.room_type} onChange={(e) => setRoomForm({ ...roomForm, room_type: e.target.value })}>
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                  <option value="premium">Premium</option>
                  <option value="family">Family</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>AC Type</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={roomForm.ac_type} onChange={(e) => setRoomForm({ ...roomForm, ac_type: e.target.value })}>
                  <option value="ac">AC</option>
                  <option value="non-ac">Non-AC</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Beds</Label><Input type="number" min={1} value={roomForm.beds} onChange={(e) => setRoomForm({ ...roomForm, beds: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Pillows</Label><Input type="number" min={0} value={roomForm.pillows} onChange={(e) => setRoomForm({ ...roomForm, pillows: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Sheets</Label><Input type="number" min={0} value={roomForm.sheets} onChange={(e) => setRoomForm({ ...roomForm, sheets: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Price/Night</Label><Input type="number" value={roomForm.price_per_night} onChange={(e) => setRoomForm({ ...roomForm, price_per_night: Number(e.target.value) })} /></div>
            </div>
            <div className="space-y-2"><Label>Room Images (one URL per line)</Label><Textarea rows={3} value={roomForm.images.join("\n")} onChange={(e) => setRoomForm({ ...roomForm, images: e.target.value.split("\n") })} placeholder="https://image1.jpg&#10;https://image2.jpg" /></div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={roomForm.is_available} onChange={(e) => setRoomForm({ ...roomForm, is_available: e.target.checked })} className="rounded" />
              <span className="text-sm font-medium text-foreground">Available</span>
            </label>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setRoomOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveRoom.isPending}>{saveRoom.isPending ? "Saving..." : "Save Room"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHotels;
