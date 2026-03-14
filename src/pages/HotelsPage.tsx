import Layout from "@/components/Layout";
import { stripHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { MapPin, IndianRupee, Star, Search, X, Hotel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import Pagination from "@/components/Pagination";
import { useState, useMemo } from "react";

const db = (table: string) => (supabase as any).from(table);
const ITEMS_PER_PAGE = 12;

const HotelsPage = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [destFilter, setDestFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ["hotels-public"],
    queryFn: async () => {
      const { data } = await db("hotels").select("*").eq("is_active", true).order("created_at", { ascending: false });
      return data || [];
    },
  });

  const destinations = useMemo(() => {
    const dests = [...new Set(hotels.map((h: any) => h.destination).filter(Boolean))];
    return dests.sort();
  }, [hotels]);

  const filtered = useMemo(() => {
    let result = hotels;
    if (destFilter !== "all") result = result.filter((h: any) => h.destination === destFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((h: any) =>
        h.name?.toLowerCase().includes(q) || h.location?.toLowerCase().includes(q) || h.destination?.toLowerCase().includes(q)
      );
    }
    if (sortBy === "price_low") result = [...result].sort((a: any, b: any) => (a.price_per_night || 0) - (b.price_per_night || 0));
    else if (sortBy === "price_high") result = [...result].sort((a: any, b: any) => (b.price_per_night || 0) - (a.price_per_night || 0));
    else if (sortBy === "rating") result = [...result].sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === "name") result = [...result].sort((a: any, b: any) => a.name.localeCompare(b.name));
    return result;
  }, [hotels, destFilter, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Layout>
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="container-wide relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-6xl font-bold mb-4">
            Our <span className="text-gradient">Hotels</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Discover handpicked hotels and resorts for a comfortable stay during your travels.
          </motion.p>
        </div>
      </section>

      <section className="section-padding -mt-8">
        <div className="container-wide">
          <div className="space-y-4 mb-10">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search hotels by name, location..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10 rounded-full" />
                {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>}
              </div>
              <select value={destFilter} onChange={(e) => { setDestFilter(e.target.value); setPage(1); }} className="h-10 px-4 rounded-full border border-input bg-background text-sm text-foreground">
                <option value="all">All Destinations</option>
                {destinations.map((d: string) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="h-10 px-4 rounded-full border border-input bg-background text-sm text-foreground">
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">{filtered.length} hotel{filtered.length !== 1 ? "s" : ""} found</p>

          {isLoading ? <p className="text-center">Loading...</p> : paginated.length === 0 ? (
            <div className="text-center py-16">
              <Hotel className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No hotels found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginated.map((hotel: any, i: number) => (
                  <motion.div key={hotel.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Link to={`/hotels/${hotel.id}`}>
                      <GlassCard className="group">
                        <div className="relative overflow-hidden aspect-[4/3]">
                          <img src={hotel.image || "/placeholder.svg"} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          {hotel.rating > 0 && (
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm gap-1">
                                <Star className="w-3 h-3 fill-current" /> {hotel.rating}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                            <MapPin className="w-3 h-3" /> {hotel.location} {hotel.destination && <><span className="mx-1">|</span> {hotel.destination}</>}
                          </div>
                          <h3 className="font-display text-lg font-semibold mb-2 line-clamp-1 text-foreground">{hotel.name}</h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{stripHtml(hotel.short_description || hotel.description)}</p>
                          {hotel.amenities && hotel.amenities.filter(Boolean).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {hotel.amenities.filter(Boolean).slice(0, 4).map((a: string) => (
                                <span key={a} className="text-[10px] bg-muted/50 border border-border px-2 py-0.5 rounded-full text-muted-foreground">{a}</span>
                              ))}
                              {hotel.amenities.filter(Boolean).length > 4 && <span className="text-[10px] text-muted-foreground">+{hotel.amenities.filter(Boolean).length - 4} more</span>}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="flex items-center text-xl font-bold text-primary"><IndianRupee className="w-4 h-4" />{hotel.price_per_night?.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground">/night</span>
                            </div>
                            <Button size="sm" variant="outline" className="rounded-full border-border text-xs">View Details</Button>
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

export default HotelsPage;
