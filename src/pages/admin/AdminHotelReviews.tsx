import { useState, useMemo } from "react";
import { Star, Check, X, Clock, Filter, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Pagination from "@/components/Pagination";

const db = (table: string) => (supabase as any).from(table);
const PER_PAGE = 10;

const AdminHotelReviews = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-hotel-reviews"],
    queryFn: async () => {
      const { data, error } = await db("reviews").select("*").eq("reviewable_type", "hotel").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => { const { error } = await db("reviews").update({ status }).eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-hotel-reviews"] }); toast({ title: "Review updated" }); },
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => { const { error } = await db("reviews").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-hotel-reviews"] }); toast({ title: "Review deleted" }); },
  });

  const filtered = useMemo(() => {
    return reviews.filter((r: any) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (ratingFilter !== "all" && r.rating !== Number(ratingFilter)) return false;
      return true;
    });
  }, [reviews, statusFilter, ratingFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const statusColor = (s: string) => {
    if (s === "approved") return "bg-green-500/10 text-green-600 border-green-500/20";
    if (s === "rejected") return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Hotel className="w-6 h-6 text-primary" /> Hotel Reviews</h1>
        <Badge variant="outline">{reviews.length} total</Badge>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><Filter className="w-3 h-3 mr-1" /><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ratingFilter} onValueChange={(v) => { setRatingFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Rating" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            {[5, 4, 3, 2, 1].map((r) => <SelectItem key={r} value={String(r)}>{r} Star{r > 1 ? "s" : ""}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : paginated.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No hotel reviews found.</p>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map((review: any) => (
              <div key={review.id} className="border border-border rounded-xl p-4 bg-card/50 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{review.reviewer_name}</span>
                      <span className="text-xs text-muted-foreground">{review.reviewer_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />)}</div>
                      <Badge variant="outline" className={`text-[10px] ${statusColor(review.status)}`}>{review.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{format(new Date(review.created_at), "dd MMM yyyy")}</div>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
                <div className="flex gap-2">
                  {review.status !== "approved" && <Button size="sm" variant="outline" className="gap-1 text-green-600" onClick={() => updateStatus.mutate({ id: review.id, status: "approved" })}><Check className="w-3 h-3" /> Approve</Button>}
                  {review.status !== "rejected" && <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => updateStatus.mutate({ id: review.id, status: "rejected" })}><X className="w-3 h-3" /> Reject</Button>}
                  <Button size="sm" variant="ghost" className="text-destructive ml-auto" onClick={() => deleteReview.mutate(review.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
};

export default AdminHotelReviews;
