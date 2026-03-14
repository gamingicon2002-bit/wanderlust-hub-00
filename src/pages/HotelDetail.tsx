import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, IndianRupee, Star, Phone, Mail, CalendarCheck, Images, Wifi, Car, UtensilsCrossed, Check } from "lucide-react";
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

const HotelDetail = () => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { id } = useParams();

  const { data: hotel, isLoading } = useQuery({
    queryKey: ["hotel", id],
    queryFn: async () => {
      const { data, error } = await db("hotels").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  // Related hotels in same destination
  const { data: relatedHotels = [] } = useQuery({
    queryKey: ["related-hotels-dest", id, hotel?.destination],
    enabled: !!hotel?.destination,
    queryFn: async () => {
      const { data } = await db("hotels").select("*").eq("destination", hotel!.destination).neq("id", id!).eq("is_active", true).limit(3);
      return data || [];
    },
  });

  if (isLoading) return <Layout><div className="section-padding text-center">Loading...</div></Layout>;
  if (!hotel) return <Layout><div className="section-padding text-center"><h1 className="font-display text-3xl font-bold mb-4">Hotel Not Found</h1><Link to="/hotels"><Button>Back to Hotels</Button></Link></div></Layout>;

  const allImages = [hotel.image, ...(hotel.images || [])].filter(Boolean);
  const bookingUrl = `/booking?type=hotel&name=${encodeURIComponent(hotel.name)}&ref=${hotel.id}`;

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-wide max-w-5xl">
          <Link to="/hotels" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Hotels
          </Link>

          <div className="relative">
            <ImageSlider images={allImages} alt={hotel.name} />
            {allImages.length > 0 && (
              <Button size="sm" variant="secondary" className="absolute bottom-4 right-4 z-10 rounded-full shadow-lg gap-2" onClick={() => setGalleryOpen(true)}>
                <Images className="w-4 h-4" /> View All Photos ({allImages.length})
              </Button>
            )}
          </div>

          <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display">{hotel.name} - All Photos</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {allImages.map((img: string, i: number) => (
                  <div key={i} className="rounded-lg overflow-hidden aspect-video">
                    <img src={img} alt={`${hotel.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {hotel.rating > 0 && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                      <Star className="w-3 h-3 fill-primary" /> {hotel.rating} / 5
                    </Badge>
                  )}
                  <span className="flex items-center gap-1 text-muted-foreground text-sm"><MapPin className="w-4 h-4" /> {hotel.location}</span>
                  {hotel.destination && <Badge variant="outline" className="capitalize">{hotel.destination}</Badge>}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{hotel.name}</h1>
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:text-foreground" dangerouslySetInnerHTML={{ __html: hotel.description || '' }} />
              </div>

              {/* Amenities */}
              {hotel.amenities && hotel.amenities.filter(Boolean).length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">Amenities & Facilities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {hotel.amenities.filter(Boolean).map((amenity: string, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                        <GlassCard hover={false} className="p-3 flex items-center gap-3">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{amenity}</span>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              {(hotel.contact_phone || hotel.contact_email) && (
                <GlassCard hover={false} className="p-5">
                  <h3 className="font-display font-semibold text-lg mb-4">Contact Information</h3>
                  <div className="space-y-2">
                    {hotel.contact_phone && (
                      <a href={`tel:${hotel.contact_phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Phone className="w-4 h-4" /> {hotel.contact_phone}
                      </a>
                    )}
                    {hotel.contact_email && (
                      <a href={`mailto:${hotel.contact_email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="w-4 h-4" /> {hotel.contact_email}
                      </a>
                    )}
                  </div>
                </GlassCard>
              )}

              {/* Related Hotels */}
              {relatedHotels.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-6">More Hotels in {hotel.destination}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {relatedHotels.map((rh: any) => (
                      <Link key={rh.id} to={`/hotels/${rh.id}`}>
                        <GlassCard className="overflow-hidden">
                          <div className="aspect-[4/3] overflow-hidden">
                            <img src={rh.image || "/placeholder.svg"} alt={rh.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <div className="p-3">
                            <h4 className="font-display font-semibold text-sm line-clamp-1">{rh.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-muted-foreground">{rh.location}</span>
                              <span className="text-sm font-bold text-primary">₹{rh.price_per_night?.toLocaleString()}</span>
                            </div>
                          </div>
                        </GlassCard>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <ReviewSection reviewableType="hotel" reviewableId={id!} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <GlassCard hover={false} className="p-6 space-y-5">
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="flex items-center text-3xl font-bold text-primary"><IndianRupee className="w-5 h-5" />{hotel.price_per_night?.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">/ night</span>
                    </div>
                  </div>
                  <Link to={bookingUrl}>
                    <Button size="lg" className="w-full rounded-full shadow-[var(--glow-primary)]">
                      <CalendarCheck className="w-4 h-4 mr-2" /> Book This Hotel
                    </Button>
                  </Link>
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

export default HotelDetail;
