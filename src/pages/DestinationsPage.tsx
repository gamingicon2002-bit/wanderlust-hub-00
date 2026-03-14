import Layout from "@/components/Layout";
import { stripHtml } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, X, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Pagination from "@/components/Pagination";
import { useState, useMemo } from "react";

const db = (table: string) => (supabase as any).from(table);
const ITEMS_PER_PAGE = 10;

const DestinationsPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      const { data } = await db("destinations").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return destinations;
    const q = search.toLowerCase();
    return destinations.filter((d: any) => d.name?.toLowerCase().includes(q) || d.short_description?.toLowerCase().includes(q));
  }, [destinations, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Layout>
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="container-wide relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-6xl font-bold mb-4">
            Explore <span className="text-gradient">Destinations</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Discover the incredible diversity of the world's most beautiful places.
          </motion.p>
        </div>
      </section>

      <section className="section-padding -mt-8">
        <div className="container-wide">
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search destinations..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10 rounded-full" />
              {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">{filtered.length} destination{filtered.length !== 1 ? "s" : ""} found</p>

          {isLoading ? <p className="text-center">Loading...</p> : paginated.length === 0 ? (
            <div className="text-center py-16">
              <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No destinations found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginated.map((dest: any, i: number) => (
                  <motion.div key={dest.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Link to={`/destinations/${dest.id}`} className="block group">
                      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] glow-border">
                        <img src={dest.image || "/placeholder.svg"} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="font-display text-2xl font-bold text-foreground mb-1">{dest.name}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">{stripHtml(dest.short_description || dest.description)}</p>
                          {dest.best_time && <p className="text-xs text-primary mt-2">Best time: {dest.best_time}</p>}
                        </div>
                      </div>
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

export default DestinationsPage;
