import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, User, MessageCircle, Send } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import GlassCard from "@/components/GlassCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const db = (table: string) => (supabase as any).from(table);

const BlogDetail = () => {
  const { id } = useParams();
  const qc = useQueryClient();
  const [commentForm, setCommentForm] = useState({ commenter_name: "", commenter_email: "", comment: "" });

  const { data: blog, isLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const { data, error } = await db("blogs").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["blog-comments", id],
    queryFn: async () => {
      const { data } = await db("blog_comments").select("*").eq("blog_id", id!).eq("status", "approved").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  const submitComment = useMutation({
    mutationFn: async () => {
      const { error } = await db("blog_comments").insert({
        blog_id: id,
        commenter_name: commentForm.commenter_name.trim(),
        commenter_email: commentForm.commenter_email.trim(),
        comment: commentForm.comment.trim(),
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Comment submitted!", description: "Your comment will appear after admin approval." });
      setCommentForm({ commenter_name: "", commenter_email: "", comment: "" });
      qc.invalidateQueries({ queryKey: ["blog-comments", id] });
    },
    onError: () => toast({ title: "Error", description: "Failed to submit comment.", variant: "destructive" }),
  });

  if (isLoading) return <Layout><div className="section-padding text-center">Loading...</div></Layout>;
  if (!blog) return <Layout><div className="section-padding text-center"><h1 className="font-display text-3xl font-bold mb-4">Blog Not Found</h1><Link to="/blogs"><Button>Back to Blogs</Button></Link></div></Layout>;

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-wide max-w-3xl">
          <Link to="/blogs" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Blogs
          </Link>

          {blog.image && (
            <div className="rounded-xl overflow-hidden aspect-video mb-8">
              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {blog.author_name}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {format(new Date(blog.created_at), "dd MMM yyyy, hh:mm a")}</span>
              </div>
            </div>

            <GlassCard hover={false} className="p-6 md:p-8">
              <div
                className="prose prose-sm max-w-none text-foreground leading-relaxed [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:text-foreground [&_a]:text-primary"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </GlassCard>

            {/* Comments Section */}
            <div className="space-y-6 mt-10">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" /> Comments ({comments.length})
              </h2>

              {/* Comment Form */}
              <GlassCard hover={false} className="p-5 space-y-4">
                <h3 className="font-semibold text-sm">Leave a Comment</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Your Name *" value={commentForm.commenter_name} onChange={(e) => setCommentForm({ ...commentForm, commenter_name: e.target.value })} />
                  <Input placeholder="Your Email *" type="email" value={commentForm.commenter_email} onChange={(e) => setCommentForm({ ...commentForm, commenter_email: e.target.value })} />
                </div>
                <Textarea placeholder="Write your comment..." rows={3} value={commentForm.comment} onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })} />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Comments are reviewed before publishing.</p>
                  <Button
                    size="sm"
                    className="gap-1 rounded-full"
                    disabled={!commentForm.commenter_name.trim() || !commentForm.commenter_email.trim() || !commentForm.comment.trim() || submitComment.isPending}
                    onClick={() => submitComment.mutate()}
                  >
                    <Send className="w-3 h-3" /> {submitComment.isPending ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </GlassCard>

              {/* Comments List */}
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c: any) => (
                    <GlassCard key={c.id} hover={false} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{c.commenter_name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {format(new Date(c.created_at), "dd MMM yyyy, hh:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{c.comment}</p>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogDetail;
