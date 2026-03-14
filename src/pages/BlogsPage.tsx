import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Clock, User, Search, X, PenLine } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import Pagination from "@/components/Pagination";

const db = (table: string) => (supabase as any).from(table);
const ITEMS_PER_PAGE = 10;

const BlogsPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const { data } = await db("blogs").select("*").eq("status", "approved").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return blogs;
    const q = search.toLowerCase();
    return blogs.filter((b: any) => b.title?.toLowerCase().includes(q) || b.author_name?.toLowerCase().includes(q) || b.excerpt?.toLowerCase().includes(q));
  }, [blogs, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-wide max-w-5xl">
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold">Travel Stories & Experiences</h1>
            <p className="text-muted-foreground mt-2">Read travel experiences and stories from our community</p>
          </div>

          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search blogs..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10 rounded-full" />
              {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">{filtered.length} blog{filtered.length !== 1 ? "s" : ""} found</p>

          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : paginated.length === 0 ? (
            <GlassCard hover={false} className="p-12 text-center">
              <PenLine className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No blogs found.</p>
            </GlassCard>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginated.map((blog: any, i: number) => (
                  <motion.div key={blog.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Link to={`/blogs/${blog.id}`}>
                      <GlassCard className="overflow-hidden h-full">
                        {blog.image && (
                          <div className="aspect-video overflow-hidden">
                            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                          </div>
                        )}
                        <div className="p-5 space-y-3">
                          <h3 className="font-display font-bold text-lg line-clamp-2">{blog.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3">{blog.excerpt || blog.content.replace(/<[^>]*>/g, '').slice(0, 150)}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {blog.author_name}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(blog.created_at), "dd MMM yyyy")}</span>
                          </div>
                        </div>
                      </GlassCard>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogsPage;
