import { useState } from "react";
import { Check, X, Clock, Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const db = (table: string) => (supabase as any).from(table);

const AdminBlogComments = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["admin-blog-comments"],
    queryFn: async () => {
      const { data } = await db("blog_comments").select("*, blogs(title)").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await db("blog_comments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-blog-comments"] }); toast({ title: "Updated" }); },
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db("blog_comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-blog-comments"] }); toast({ title: "Deleted" }); },
  });

  const filtered = statusFilter === "all" ? comments : comments.filter((c: any) => c.status === statusFilter);

  const statusColor = (s: string) => {
    if (s === "approved") return "bg-green-500/10 text-green-600 border-green-500/20";
    if (s === "rejected") return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Blog Comments</h1>
        <Badge variant="outline">{comments.length} total</Badge>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[150px]"><Filter className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No comments found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c: any) => (
            <div key={c.id} className="border border-border rounded-xl p-4 bg-card/50 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">On: <span className="font-medium text-foreground">{c.blogs?.title || "Unknown blog"}</span></p>
                  <p className="text-sm font-medium mt-1">{c.commenter_name} ({c.commenter_email})</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${statusColor(c.status)}`}>{c.status}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />{format(new Date(c.created_at), "dd MMM yyyy")}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{c.comment}</p>
              <div className="flex gap-2">
                {c.status !== "approved" && (
                  <Button size="sm" variant="outline" className="gap-1 text-green-600" onClick={() => updateStatus.mutate({ id: c.id, status: "approved" })}>
                    <Check className="w-3 h-3" /> Approve
                  </Button>
                )}
                {c.status !== "rejected" && (
                  <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => updateStatus.mutate({ id: c.id, status: "rejected" })}>
                    <X className="w-3 h-3" /> Reject
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-destructive ml-auto gap-1" onClick={() => deleteComment.mutate(c.id)}>
                  <Trash2 className="w-3 h-3" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBlogComments;
