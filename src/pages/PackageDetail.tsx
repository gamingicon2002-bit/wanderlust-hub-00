import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, IndianRupee, Download, Check, X as XIcon, CalendarCheck, Star, Hotel, Images } from "lucide-react";
import Layout from "@/components/Layout";
import ImageSlider from "@/components/ImageSlider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReviewSection from "@/components/ReviewSection";

const db = (table: string) => (supabase as any).from(table);

const PackageDetail = () => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { id } = useParams();

  const { data: pkg, isLoading } = useQuery({
    queryKey: ["package", id],
    queryFn: async () => {
      const { data, error } = await db("packages").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  // Admin-assigned related hotels (with fallback to destination match)
  const { data: hotels = [] } = useQuery({
    queryKey: ["package-hotels", id, pkg?.destination],
    enabled: !!id && !!pkg,
    queryFn: async () => {
      // First try admin-assigned hotels
      const { data: assigned } = await db("related_hotels")
        .select("hotel_id")
        .eq("package_id", id!)
        .order("sort_order");
      
      if (assigned && assigned.length > 0) {
        const hotelIds = assigned.map((a: any) => a.hotel_id);
        const { data: hotels } = await db("hotels")
          .select("*")
          .in("id", hotelIds)
          .eq("is_active", true);
        // Preserve sort order
        return hotelIds.map((hid: string) => hotels?.find((h: any) => h.id === hid)).filter(Boolean);
      }
      
      // Fallback: match by destination
      const { data } = await db("hotels")
        .select("*")
        .eq("destination", pkg!.destination)
        .eq("is_active", true)
        .limit(4);
      return data || [];
    },
  });

  // Admin-assigned related packages (with fallback to destination match)
  const { data: relatedPkgs = [] } = useQuery({
    queryKey: ["package-related", id, pkg?.destination],
    enabled: !!id && !!pkg,
    queryFn: async () => {
      // First try admin-assigned related packages
      const { data: assigned } = await db("related_packages")
        .select("related_package_id")
        .eq("package_id", id!)
        .order("sort_order");
      
      if (assigned && assigned.length > 0) {
        const pkgIds = assigned.map((a: any) => a.related_package_id);
        const { data: pkgs } = await db("packages")
          .select("*")
          .in("id", pkgIds);
        return pkgIds.map((pid: string) => pkgs?.find((p: any) => p.id === pid)).filter(Boolean);
      }
      
      // Fallback: match by destination
      const { data } = await db("packages")
        .select("*")
        .eq("destination", pkg!.destination)
        .neq("id", id!)
        .limit(3);
      return data || [];
    },
  });

  if (isLoading) return <Layout><div className="section-padding text-center">Loading...</div></Layout>;
  if (!pkg) return <Layout><div className="section-padding text-center"><h1 className="font-display text-3xl font-bold mb-4">Package Not Found</h1><Link to="/packages"><Button>Back to Packages</Button></Link></div></Layout>;

  const allImages = [pkg.image, ...(pkg.images || [])].filter(Boolean);

  const itinerary = (pkg.itinerary || []).map((item: string) => {
    const sep = item.indexOf("|");
    if (sep > -1) return { title: item.slice(0, sep).trim(), description: item.slice(sep + 1).trim() };
    return { title: item, description: "" };
  });

  const bookingUrl = `/booking?type=package&name=${encodeURIComponent(pkg.name)}&ref=${pkg.id}`;

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-wide max-w-5xl">
          <Link to="/packages" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Packages
          </Link>

          <div className="relative">
            <ImageSlider images={allImages} alt={pkg.name} />
            {allImages.length > 0 && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-4 right-4 z-10 rounded-full shadow-lg gap-2"
                onClick={() => setGalleryOpen(true)}
              >
                <Images className="w-4 h-4" /> View All Photos ({allImages.length})
              </Button>
            )}
          </div>

          <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">{pkg.name} — All Photos</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {allImages.map((img: string, i: number) => (
                  <div key={i} className="rounded-lg overflow-hidden aspect-video">
                    <img src={img} alt={`${pkg.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <Badge className={`capitalize ${pkg.tour_type === "international" ? "bg-secondary text-secondary-foreground" : "bg-primary/80 text-primary-foreground"}`}>{pkg.tour_type}</Badge>
                  <span className="flex items-center gap-1 text-muted-foreground text-sm"><MapPin className="w-4 h-4" /> {pkg.destination}</span>
                  <span className="flex items-center gap-1 text-muted-foreground text-sm"><Clock className="w-4 h-4" /> {pkg.duration}</span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{pkg.name}</h1>
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:text-foreground" dangerouslySetInnerHTML={{ __html: pkg.description || '' }} />
              </div>

              {/* Itinerary */}
              {itinerary.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-6">Day-by-Day Itinerary</h2>
                  <div className="relative space-y-0">
                    <div className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent" />
                    {itinerary.map((day: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                        className="relative flex gap-5 pb-6">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 z-10 shadow-[var(--glow-primary)]">
                          {i + 1}
                        </div>
                        <GlassCard hover={false} className="flex-1 p-5">
                          <h3 className="font-display font-semibold text-lg mb-1">{day.title}</h3>
                          {day.description && <p className="text-muted-foreground text-sm leading-relaxed">{day.description}</p>}
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions / Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {pkg.inclusions && pkg.inclusions.filter(Boolean).length > 0 && (
                  <GlassCard hover={false} className="p-5">
                    <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Included</h3>
                    <ul className="space-y-2">
                      {pkg.inclusions.filter(Boolean).map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                )}
                {pkg.exclusions && pkg.exclusions.filter(Boolean).length > 0 && (
                  <GlassCard hover={false} className="p-5">
                    <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><XIcon className="w-5 h-5 text-destructive" /> Not Included</h3>
                    <ul className="space-y-2">
                      {pkg.exclusions.filter(Boolean).map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <XIcon className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
              )}
              </div>

              {/* Special Features */}
              {pkg.special_features && pkg.special_features.filter(Boolean).length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" /> Special Features
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pkg.special_features.filter(Boolean).map((f: string, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                        <GlassCard hover={false} className="p-4 flex items-start gap-3">
                          <div className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs flex-shrink-0">✦</div>
                          <span className="text-sm">{f}</span>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {pkg.additional_notes && pkg.additional_notes.trim() && (
                <GlassCard hover={false} className="p-5">
                  <h3 className="font-display font-semibold text-lg mb-3">📝 Additional Notes</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{pkg.additional_notes}</p>
                </GlassCard>
              )}

              {/* Hotels */}
              {hotels.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                    <Hotel className="w-6 h-6 text-primary" /> Recommended Hotels
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {hotels.map((hotel: any) => (
                      <Link key={hotel.id} to={`/hotels/${hotel.id}`}>
                        <GlassCard className="overflow-hidden group">
                          {hotel.image && (
                            <div className="aspect-video overflow-hidden">
                              <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                            </div>
                          )}
                          <div className="p-4 space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-display font-semibold text-sm">{hotel.name}</h4>
                              {hotel.rating > 0 && (
                                <div className="flex items-center gap-0.5 text-xs">
                                  <Star className="w-3 h-3 text-primary fill-primary" /> {hotel.rating}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{hotel.location}</p>
                            {hotel.short_description && <p className="text-xs text-muted-foreground line-clamp-2">{hotel.short_description}</p>}
                            {hotel.amenities && hotel.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {hotel.amenities.slice(0, 4).map((a: string) => (
                                  <span key={a} className="text-[10px] bg-muted/50 border border-border px-1.5 py-0.5 rounded text-muted-foreground">{a}</span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-sm font-bold text-primary">₹{hotel.price_per_night?.toLocaleString()}<span className="text-[10px] font-normal text-muted-foreground">/night</span></span>
                            </div>
                          </div>
                        </GlassCard>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Packages */}
              {relatedPkgs.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-6">Related Packages</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {relatedPkgs.map((rp: any) => (
                      <Link key={rp.id} to={`/packages/${rp.id}`}>
                        <GlassCard className="overflow-hidden">
                          <div className="aspect-[4/3] overflow-hidden">
                            <img src={rp.image || "/placeholder.svg"} alt={rp.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <div className="p-3">
                            <h4 className="font-display font-semibold text-sm line-clamp-1">{rp.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-muted-foreground">{rp.duration}</span>
                              <span className="text-sm font-bold text-primary">₹{rp.price?.toLocaleString()}</span>
                            </div>
                          </div>
                        </GlassCard>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <ReviewSection reviewableType="package" reviewableId={id!} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <GlassCard hover={false} className="p-6 space-y-5">
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="flex items-center text-3xl font-bold text-primary"><IndianRupee className="w-5 h-5" />{pkg.price?.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">/ person</span>
                    </div>
                    {pkg.original_price && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through text-sm">₹{pkg.original_price.toLocaleString()}</span>
                        <Badge className="bg-destructive text-destructive-foreground text-xs">
                          {Math.round(((pkg.original_price - pkg.price) / pkg.original_price) * 100)}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>
                  <Link to={bookingUrl}>
                    <Button size="lg" className="w-full rounded-full shadow-[var(--glow-primary)]">
                      <CalendarCheck className="w-4 h-4 mr-2" /> Book This Package
                    </Button>
                  </Link>
                  {pkg.brochure_url && (
                    <Button size="lg" variant="outline" className="w-full rounded-full" onClick={() => window.open(pkg.brochure_url, "_blank")}>
                      <Download className="w-4 h-4 mr-2" /> Download Brochure
                    </Button>
                  )}
                  <div className="text-xs text-muted-foreground text-center">No payment required now. We'll confirm availability first.</div>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PackageDetail;
