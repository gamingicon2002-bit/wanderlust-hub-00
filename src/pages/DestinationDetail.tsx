import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, MapPin, IndianRupee, CalendarCheck, Clock, Hotel, Star, Images } from "lucide-react";
import ReviewSection from "@/components/ReviewSection";
import Layout from "@/components/Layout";
import ImageSlider from "@/components/ImageSlider";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const db = (table: string) => (supabase as any).from(table);

const DestinationDetail = () => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { id } = useParams();

  const { data: dest, isLoading } = useQuery({
    queryKey: ["destination", id],
    queryFn: async () => {
      const { data, error } = await db("destinations").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: relatedPackages = [] } = useQuery({
    queryKey: ["packages-by-dest", dest?.name],
    enabled: !!dest?.name,
    queryFn: async () => {
      const { data } = await db("packages").select("*").eq("destination", dest!.name);
      return data || [];
    },
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ["hotels-by-dest", dest?.name],
    enabled: !!dest?.name,
    queryFn: async () => {
      const { data } = await db("hotels").select("*").eq("destination", dest!.name).eq("is_active", true);
      return data || [];
    },
  });

  if (isLoading) return <Layout><div className="section-padding text-center">Loading...</div></Layout>;
  if (!dest) return <Layout><div className="section-padding text-center"><h1 className="font-display text-3xl font-bold mb-4">Destination Not Found</h1><Link to="/destinations"><Button>Back to Destinations</Button></Link></div></Layout>;

  const allImages = [dest.image, ...(dest.images || [])].filter(Boolean);

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-wide max-w-5xl">
          <Link to="/destinations" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Destinations
          </Link>

          <div className="relative">
            <ImageSlider images={allImages} alt={dest.name} />
            {allImages.length > 0 && (
              <Button size="sm" variant="secondary" className="absolute bottom-4 right-4 z-10 rounded-full shadow-lg gap-2" onClick={() => setGalleryOpen(true)}>
                <Images className="w-4 h-4" /> View All Photos ({allImages.length})
              </Button>
            )}
          </div>

          <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display">{dest.name} — All Photos</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {allImages.map((img: string, i: number) => (
                  <div key={i} className="rounded-lg overflow-hidden aspect-video">
                    <img src={img} alt={`${dest.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                {dest.best_time && <span className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3"><Clock className="w-4 h-4" /> Best time: {dest.best_time}</span>}
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{dest.name}</h1>
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:text-foreground" dangerouslySetInnerHTML={{ __html: dest.description || '' }} />
              </div>

              {dest.highlights && dest.highlights.filter(Boolean).length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">Highlights</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dest.highlights.filter(Boolean).map((h: string, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                        <GlassCard hover={false} className="p-4 flex items-start gap-3">
                          <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                          <span className="text-sm">{h}</span>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {hotels.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2"><Hotel className="w-6 h-6 text-primary" /> Hotels in {dest.name}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {hotels.map((hotel: any) => (
                      <Link key={hotel.id} to={`/hotels/${hotel.id}`}>
                        <GlassCard className="overflow-hidden">
                          {hotel.image && <div className="aspect-video overflow-hidden"><img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" /></div>}
                          <div className="p-4 space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-display font-semibold text-sm">{hotel.name}</h4>
                              {hotel.rating > 0 && <div className="flex items-center gap-0.5 text-xs"><Star className="w-3 h-3 text-primary fill-primary" /> {hotel.rating}</div>}
                            </div>
                            <p className="text-xs text-muted-foreground">{hotel.location}</p>
                            {hotel.price_per_night > 0 && <span className="text-sm font-bold text-primary">₹{hotel.price_per_night?.toLocaleString()}<span className="text-[10px] font-normal text-muted-foreground">/night</span></span>}
                          </div>
                        </GlassCard>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedPackages.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">Available Packages</h2>
                  <div className="space-y-3">
                    {relatedPackages.map((p: any) => (
                      <Link key={p.id} to={`/packages/${p.id}`}>
                        <GlassCard className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {p.image && <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />}
                            <div>
                              <span className="font-medium text-sm">{p.name}</span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="w-3 h-3" /> {p.duration}</div>
                            </div>
                          </div>
                          <span className="flex items-center text-primary font-bold"><IndianRupee className="w-3.5 h-3.5" />{p.price?.toLocaleString()}</span>
                        </GlassCard>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <ReviewSection reviewableType="destination" reviewableId={id!} />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <GlassCard hover={false} className="p-6 space-y-5">
                  <h3 className="font-display text-lg font-semibold">Interested in {dest.name}?</h3>
                  <p className="text-sm text-muted-foreground">Get in touch for customized packages.</p>
                  <Link to={`/booking?type=package&name=${encodeURIComponent(dest.name + ' Tour')}`}>
                    <Button size="lg" className="w-full rounded-full shadow-[var(--glow-primary)]">
                      <CalendarCheck className="w-4 h-4 mr-2" /> Enquire Now
                    </Button>
                  </Link>
                  {dest.brochure_url && (
                    <Button size="lg" variant="outline" className="w-full rounded-full" onClick={() => window.open(dest.brochure_url, "_blank")}>
                      <Download className="w-4 h-4 mr-2" /> Download Brochure
                    </Button>
                  )}
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DestinationDetail;
