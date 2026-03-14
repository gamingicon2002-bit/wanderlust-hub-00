import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Search, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Pagination from "@/components/Pagination";

const db = (table: string) => (supabase as any).from(table);
const PER_PAGE = 10;

const AdminContacts = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => { const { data } = await db("contact_submissions").select("*").order("created_at", { ascending: false }); return data || []; },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((c: any) => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.message?.toLowerCase().includes(q));
  }, [items, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("contact_submissions").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-contacts"] }); toast({ title: "Deleted" }); },
  });

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-bold">Contact Submissions ({items.length})</h2>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search contacts..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3" /></button>}
      </div>
      {isLoading ? <p>Loading...</p> : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Message</TableHead><TableHead>Date</TableHead><TableHead className="w-16">Del</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.phone || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{c.message}</TableCell>
                  <TableCell className="text-xs">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  <TableCell><Button size="icon" variant="ghost" onClick={() => remove.mutate(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
};

export default AdminContacts;