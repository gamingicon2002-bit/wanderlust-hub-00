import { useState, useMemo } from "react";
import { Star, Filter, Send, Clock, ArrowUpDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import GlassCard from "@/components/GlassCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const db = (table: string) => (supabase as any).from(table);

interface ReviewSectionProps {
  reviewableType: "package" | "vehicle" | "destination" | "hotel";
  reviewableId: string;
}

const StarRating = ({ rating, onChange, size = "w-5 h-5" }: { rating: number; onChange?: (r: number) => void; size?: string }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`${size} ${s <= rating ? "text-primary fill-primary" : "text-muted-foreground/30"} ${onChange ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
        onClick={() => onChange?.(s)}
      />
    ))}
  </div>
);

const REVIEWS_PER_PAGE = 5;

const ReviewSection = ({ reviewableType, reviewableId }: ReviewSectionProps) => {
  const queryClient = useQueryClient();
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
  const [form, setForm] = useState({ name: "", email: "", rating: 5, comment: "" });

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", reviewableType, reviewableId],
    queryFn: async () => {
      const { data } = await db("reviews")
        .select("*")
        .eq("reviewable_type", reviewableType)
        .eq("reviewable_id", reviewableId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await db("reviews").insert({
        reviewable_type: reviewableType, reviewable_id: reviewableId,
        reviewer_name: form.name.trim(), reviewer_email: form.email.trim(),
        rating: form.rating, comment: form.comment.trim(), status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Review submitted!", description: "Your review will be visible once approved." });
      setForm({ name: "", email: "", rating: 5, comment: "" });
      setShowForm(false);
    },
    onError: () => toast({ title: "Error", description: "Failed to submit.", variant: "destructive" }),
  });

  const processed = useMemo(() => {
    let result = [...reviews];
    if (filterRating) result = result.filter((r: any) => r.rating === filterRating);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r: any) => r.reviewer_name?.toLowerCase().includes(q) || r.comment?.toLowerCase().includes(q));
    }
    switch (sortBy) {
      case "oldest": result.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break;
      case "highest": result.sort((a: any, b: any) => b.rating - a.rating); break;
      case "lowest": result.sort((a: any, b: any) => a.rating - b.rating); break;
      default: result.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [reviews, filterRating, sortBy, searchQuery]);

  const visibleReviews = processed.slice(0, visibleCount);
  const hasMore = visibleCount < processed.length;

  const avgRating = reviews.length > 0 ? (reviews.reduce((a: number, r: any) => a + r.rating, 0) / reviews.length).toFixed(1) : "0";
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviews.filter((rev: any) => rev.rating === r).length,
    pct: reviews.length > 0 ? (reviews.filter((rev: any) => rev.rating === r).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl font-bold">Reviews & Ratings</h2>
        <Button onClick={() => setShowForm(!showForm)} className="rounded-full gap-2">
          <Send className="w-4 h-4" /> Write a Review
        </Button>
      </div>

      {/* Submit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard hover={false} className="p-6 space-y-4">
              <h3 className="font-display font-semibold text-lg">Share Your Experience</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Your Rating:</span>
                <StarRating rating={form.rating} onChange={(r) => setForm({ ...form, rating: r })} size="w-7 h-7" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="Your Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="Your Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <Textarea placeholder="Write your review..." rows={4} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
              <div className="flex gap-3">
                <Button onClick={() => submitMutation.mutate()} disabled={!form.name.trim() || !form.email.trim() || !form.comment.trim() || submitMutation.isPending} className="rounded-full">
                  {submitMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats + Filter — Amazon/Flipkart style */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left sidebar: Rating breakdown + filters */}
          <div className="space-y-4">
            <GlassCard hover={false} className="p-5 text-center">
              <div className="text-5xl font-bold text-primary">{avgRating}</div>
              <StarRating rating={Math.round(Number(avgRating))} size="w-5 h-5" />
              <p className="text-sm text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
            </GlassCard>

            <GlassCard hover={false} className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-1.5"><Filter className="w-3.5 h-3.5" /> Filter by Rating</span>
                {filterRating && (
                  <Badge variant="secondary" className="cursor-pointer text-xs" onClick={() => { setFilterRating(null); setVisibleCount(REVIEWS_PER_PAGE); }}>Clear</Badge>
                )}
              </div>
              {ratingCounts.map(({ rating, count, pct }) => (
                <button
                  key={rating}
                  onClick={() => { setFilterRating(filterRating === rating ? null : rating); setVisibleCount(REVIEWS_PER_PAGE); }}
                  className={`flex items-center gap-2 w-full text-left text-sm transition-colors rounded-lg px-2 py-1.5 ${filterRating === rating ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/50"}`}
                >
                  <span className="w-4 text-right font-medium">{rating}</span>
                  <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                  <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                </button>
              ))}
            </GlassCard>

            {/* Sort */}
            <GlassCard hover={false} className="p-4">
              <label className="text-sm font-medium flex items-center gap-1.5 mb-2"><ArrowUpDown className="w-3.5 h-3.5" /> Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as any); setVisibleCount(REVIEWS_PER_PAGE); }}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground"
              >
                <option value="newest">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </GlassCard>
          </div>

          {/* Right: Search + scrollable review list */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search reviews..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(REVIEWS_PER_PAGE); }} className="pl-10 rounded-full" />
              {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>

            <p className="text-xs text-muted-foreground">{processed.length} review{processed.length !== 1 ? "s" : ""} {filterRating ? `with ${filterRating} star${filterRating !== 1 ? "s" : ""}` : ""}</p>

            <div className="max-h-[600px] overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              {visibleReviews.length === 0 ? (
                <GlassCard hover={false} className="p-8 text-center">
                  <p className="text-muted-foreground">{reviews.length === 0 ? "No reviews yet. Be the first!" : "No reviews match your filters."}</p>
                </GlassCard>
              ) : (
                visibleReviews.map((review: any) => (
                  <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <GlassCard hover={false} className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground flex-shrink-0">
                            {review.reviewer_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">{review.reviewer_name}</h4>
                            <StarRating rating={review.rating} size="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(new Date(review.created_at), "dd MMM yyyy")}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">{review.comment}</p>
                    </GlassCard>
                  </motion.div>
                ))
              )}
            </div>

            {hasMore && (
              <div className="text-center">
                <Button variant="outline" className="rounded-full" onClick={() => setVisibleCount(visibleCount + REVIEWS_PER_PAGE)}>
                  Load More Reviews ({processed.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state when no reviews at all */}
      {reviews.length === 0 && !isLoading && (
        <GlassCard hover={false} className="p-8 text-center">
          <Star className="w-12 h-12 text-primary/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
        </GlassCard>
      )}
    </div>
  );
};

export default ReviewSection;
