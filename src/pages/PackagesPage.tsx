import Layout from "@/components/Layout";
import { stripHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useSearchParams } from "react-router-dom";
import { Clock, MapPin, IndianRupee, Globe, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import Pagination from "@/components/Pagination";
import { useState, useMemo } from "react";

const db = (table: string) => (supabase as any).from(table);
const ITEMS_PER_PAGE = 10;

const PackagesPage = () => {
  const [params] = useSearchParams();
  const initialType = params.get("type") || "all";
  const [filter, setFilter] = useState(initialType);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data } = await db("packages").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    let result = filter === "all" ? packages : packages.filter((p: any) => p.tour_type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p: any) =>
        p.name?.toLowerCase().includes(q) || p.destination?.toLowerCase().includes(q) || p.short_description?.toLowerCase().includes(q)
      );
    }
    if (sortBy === "price_low") result = [...result].sort((a: any, b: any) => a.price - b.price);
    else if (sortBy === "price_high") result = [...result].sort((a: any, b: any) => b.price - a.price);
    else if (sortBy === "name") result = [...result].sort((a: any, b: any) => a.name.localeCompare(b.name));
    return result;
  }, [packages, filter, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (v: string) => { setFilter(v); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  return (
    <Layout>
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="container-wide relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-6xl font-bold mb-4">
            Tour <span className="text-gradient">Packages</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Explore our handcrafted tour packages designed for every kind of traveler.
          </motion.p>
        </div>
      </section>

      <section className="section-padding -mt-8">
        <div className="container-wide">
          {/* Search & Filters */}
          <div className="space-y-4 mb-10">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search packages by name, destination..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 rounded-full"
                />
                {search && (
                  <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="h-10 px-4 rounded-full border border-input bg-background text-sm text-foreground"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[
                { value: "all", label: "All Packages" },
                { value: "domestic", label: "🇮🇳 Domestic" },
                { value: "international", label: "🌍 International" },
              ].map((t) => (
                <button key={t.value} onClick={() => handleFilterChange(t.value)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${filter === t.value ? "bg-primary text-primary-foreground shadow-[var(--glow-primary)]" : "glass-card text-muted-foreground hover:text-foreground"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-6">{filtered.length} package{filtered.length !== 1 ? "s" : ""} found</p>

          {isLoading ? <p className="text-center">Loading...</p> : paginated.length === 0 ? (
            <div className="text-center py-16">
              <Globe className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No packages found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginated.map((pkg: any, i: number) => (
                  <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <GlassCard className="group">
                      <div className="relative overflow-hidden aspect-[4/3]">
                        <img src={pkg.image || "/placeholder.svg"} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          {pkg.original_price && (
                            <Badge className="bg-destructive text-destructive-foreground backdrop-blur-sm">
                              {Math.round(((pkg.original_price - pkg.price) / pkg.original_price) * 100)}% OFF
                            </Badge>
                          )}
                          <Badge className={`capitalize backdrop-blur-sm ${pkg.tour_type === "international" ? "bg-secondary text-secondary-foreground" : "bg-primary/80 text-primary-foreground"}`}>{pkg.tour_type}</Badge>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                          <MapPin className="w-3 h-3" /> {pkg.destination} <span className="mx-1">•</span> <Clock className="w-3 h-3" /> {pkg.duration}
                        </div>
                        <h3 className="font-display text-lg font-semibold mb-2 line-clamp-1 text-foreground">{pkg.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{stripHtml(pkg.short_description || pkg.description)}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center text-xl font-bold text-primary"><IndianRupee className="w-4 h-4" />{pkg.price?.toLocaleString()}</span>
                            {pkg.original_price && <span className="text-sm text-muted-foreground line-through">₹{pkg.original_price.toLocaleString()}</span>}
                          </div>
                          <Link to={`/packages/${pkg.id}`}><Button size="sm" variant="outline" className="rounded-full border-border text-xs">View Details</Button></Link>
                        </div>
                      </div>
                    </GlassCard>
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

export default PackagesPage;
