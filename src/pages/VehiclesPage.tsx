import Layout from "@/components/Layout";
import { stripHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, CalendarCheck, Fuel, Settings2, Car, ChevronRight, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import Pagination from "@/components/Pagination";

const db = (table: string) => (supabase as any).from(table);
const ITEMS_PER_PAGE = 10;

const VehiclesPage = () => {
  const [activeType, setActiveType] = useState("all");
  const [activeSubType, setActiveSubType] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { mainTypes, getSubTypes, getLabel, getIcon } = useVehicleTypes();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data } = await db("vehicles").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers-public"],
    queryFn: async () => {
      const { data } = await db("drivers").select("*").eq("is_active", true);
      return data || [];
    },
  });

  const typeTabs = useMemo(() => {
    const vehicleTypes = new Set(vehicles.map((v: any) => v.type).filter(Boolean));
    return mainTypes.filter((t) => vehicleTypes.has(t.name));
  }, [vehicles, mainTypes]);

  const subTypeTabs = useMemo(() => {
    if (activeType === "all") return [];
    const subs = getSubTypes(activeType);
    const vehicleSubs = new Set(vehicles.filter((v: any) => v.type === activeType && v.sub_type).map((v: any) => v.sub_type));
    const available = subs.filter((s) => vehicleSubs.has(s.name));
    return available.length > 1 ? available : [];
  }, [vehicles, activeType, mainTypes, getSubTypes]);

  const filtered = useMemo(() => {
    let result = vehicles;
    if (activeType !== "all") result = result.filter((v: any) => v.type === activeType);
    if (activeSubType !== "all" && subTypeTabs.length > 0) result = result.filter((v: any) => v.sub_type === activeSubType);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((v: any) => v.name?.toLowerCase().includes(q) || v.model?.toLowerCase().includes(q) || v.type?.toLowerCase().includes(q));
    }
    return result;
  }, [vehicles, activeType, activeSubType, subTypeTabs, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const getDriver = (vid: string) => drivers.find((d: any) => d.vehicle_id === vid);

  return (
    <Layout>
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="container-wide relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-block mb-4">
            <span className="glass-card px-4 py-2 rounded-full text-xs font-medium text-primary tracking-widest uppercase">✦ Premium Fleet</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-6xl font-bold mb-4">
            Our <span className="text-gradient">Fleet</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Premium vehicles for comfortable and safe travel across India.
          </motion.p>
        </div>
      </section>

      <section className="section-padding -mt-8">
        <div className="container-wide">
          {/* Search */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search vehicles..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10 rounded-full" />
              {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>
          </div>

          {/* Type tabs */}
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            <button onClick={() => { setActiveType("all"); setActiveSubType("all"); setPage(1); }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeType === "all" ? "bg-primary text-primary-foreground shadow-[var(--glow-primary)]" : "glass-card text-muted-foreground hover:text-foreground"}`}>
              All Vehicles
            </button>
            {typeTabs.map((t) => (
              <button key={t.name} onClick={() => { setActiveType(t.name); setActiveSubType("all"); setPage(1); }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeType === t.name ? "bg-primary text-primary-foreground shadow-[var(--glow-primary)]" : "glass-card text-muted-foreground hover:text-foreground"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {subTypeTabs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 mb-6 flex-wrap">
              <button onClick={() => { setActiveSubType("all"); setPage(1); }}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${activeSubType === "all" ? "bg-secondary text-secondary-foreground border-secondary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                All
              </button>
              {subTypeTabs.map((sub) => (
                <button key={sub.name} onClick={() => { setActiveSubType(sub.name); setPage(1); }}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${activeSubType === sub.name ? "bg-secondary text-secondary-foreground border-secondary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                  {sub.label}
                </button>
              ))}
            </motion.div>
          )}

          <p className="text-sm text-muted-foreground mb-6">{filtered.length} vehicle{filtered.length !== 1 ? "s" : ""} found</p>

          {isLoading ? <p className="text-center">Loading...</p> : paginated.length === 0 ? (
            <div className="text-center py-16">
              <Car className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No vehicles found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginated.map((v: any, i: number) => {
                  const driver = getDriver(v.id);
                  return (
                    <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <GlassCard className="group">
                        <div className="relative aspect-video overflow-hidden">
                          <img src={v.image || "/placeholder.svg"} alt={v.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <Badge variant="outline" className="capitalize backdrop-blur-sm bg-background/50 border-border">{getIcon(v.type)} {getLabel(v.type)}</Badge>
                            {v.sub_type && <Badge variant="secondary" className="capitalize backdrop-blur-sm">{getLabel(v.sub_type)}</Badge>}
                          </div>
                          {v.price_per_km && <div className="absolute top-3 right-3"><Badge className="bg-primary text-primary-foreground backdrop-blur-sm">₹{v.price_per_km}/km</Badge></div>}
                        </div>
                        <div className="p-5 space-y-3">
                          <div>
                            <h3 className="font-display text-lg font-semibold text-foreground">{v.name}</h3>
                            {v.model && <p className="text-xs text-muted-foreground">{v.model}</p>}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="glass-card rounded-lg p-2.5 text-center"><Users className="w-4 h-4 mx-auto text-primary mb-1" /><span className="text-xs text-muted-foreground">{v.capacity} Seats</span></div>
                            <div className="glass-card rounded-lg p-2.5 text-center"><Fuel className="w-4 h-4 mx-auto text-primary mb-1" /><span className="text-xs text-muted-foreground">{v.fuel_type || "Petrol"}</span></div>
                            <div className="glass-card rounded-lg p-2.5 text-center"><Settings2 className="w-4 h-4 mx-auto text-primary mb-1" /><span className="text-xs text-muted-foreground">{v.transmission || "Auto"}</span></div>
                          </div>
                          {v.features?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {v.features.slice(0, 3).map((f: string) => (
                                <span key={f} className="text-[10px] bg-muted/50 border border-border px-2 py-0.5 rounded-full text-muted-foreground">{f}</span>
                              ))}
                              {v.features.length > 3 && <span className="text-[10px] text-muted-foreground">+{v.features.length - 3} more</span>}
                            </div>
                          )}
                          <p className="text-muted-foreground text-sm line-clamp-2">{stripHtml(v.short_description || v.description)}</p>
                          {driver && (
                            <div className="flex items-center gap-2 glass-card rounded-lg p-2 relative">
                              <div className="blur-[4px] select-none pointer-events-none flex items-center gap-2 flex-1">
                                {driver.photo ? <img src={driver.photo} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{driver.name[0]}</div>}
                                <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{driver.name}</p><p className="text-[10px] text-muted-foreground">{driver.experience_years}+ yrs</p></div>
                              </div>
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-primary bg-background/30 backdrop-blur-[1px] rounded-lg">Driver Assigned ✓</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div>
                              {v.price_per_km && <span className="text-lg font-bold text-primary">₹{v.price_per_km}<span className="text-xs text-muted-foreground font-normal">/km</span></span>}
                              {v.price_per_day && <span className="text-xs text-muted-foreground ml-2">₹{v.price_per_day}/day</span>}
                            </div>
                            <div className="flex gap-2">
                              <Link to={`/vehicles/${v.id}`}><Button variant="outline" size="sm" className="rounded-full border-border text-xs gap-1">Details <ChevronRight className="w-3 h-3" /></Button></Link>
                              <Link to={`/booking?type=vehicle&name=${encodeURIComponent(v.name)}&ref=${v.id}`}><Button size="sm" className="rounded-full text-xs"><CalendarCheck className="w-3.5 h-3.5 mr-1" /> Book</Button></Link>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default VehiclesPage;
