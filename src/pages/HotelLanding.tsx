import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, Hotel, MapPin, Phone, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLandingSections } from "@/hooks/useLandingSections";
import { Badge } from "@/components/ui/badge";

const db = (table: string) => (supabase as any).from(table);

const HotelLanding = () => {
  const { settings } = useSiteSettings();
  const { getSection } = useLandingSections("hotel_landing");

  const hero = getSection("hero");
  const featured = getSection("featured_hotels");
  const reviewsSection = getSection("reviews");
  const cta = getSection("cta");

  const { data: hotels = [] } = useQuery({
    queryKey: ["landing-hotels"],
    queryFn: async () => {
      const { data } = await db("hotels").select("*").eq("is_active", true).order("rating", { ascending: false }).limit(6);
      return data || [];
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["landing-hotel-reviews"],
    queryFn: async () => {
      const { data } = await db("reviews").select("*").eq("reviewable_type", "hotel").eq("status", "approved").order("created_at", { ascending: false }).limit(6);
      return data || [];
    },
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="container-wide relative z-10 text-center py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              <Hotel className="w-3.5 h-3.5 mr-1.5" /> {hero?.icon || "Premium Hotels"}
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              {hero?.title ? (
                <>{hero.title.split(" ").slice(0, -1).join(" ")} <span className="text-gradient">{hero.title.split(" ").slice(-1)}</span></>
              ) : (
                <>Find Your Perfect <span className="text-gradient">Stay</span></>
              )}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {hero?.subtitle || settings?.tagline || "Discover handpicked hotels with exceptional comfort and service"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={hero?.cta_link || "/hotels"}>
                <Button size="lg" className="rounded-full gap-2 px-8">
                  {hero?.cta_text || "Browse Hotels"} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="rounded-full gap-2 px-8">
                  <Phone className="w-4 h-4" /> Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Hotels */}
      {hotels.length > 0 && (
        <section className="section-padding">
          <div className="container-wide">
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">{featured?.title || "Our Hotels"}</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary mx-auto mb-4 rounded-full" />
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{featured?.subtitle || "Carefully selected properties for an unforgettable experience"}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel: any, i: number) => (
                <motion.div key={hotel.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/hotels/${hotel.id}`}>
                    <GlassCard className="overflow-hidden group">
                      <div className="relative h-48 overflow-hidden">
                        <img src={hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {hotel.rating > 0 && (
                          <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-semibold">{hotel.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-display text-lg font-bold mb-1">{hotel.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                          <MapPin className="w-3.5 h-3.5" /> {hotel.location}
                        </p>
                        {hotel.price_per_night > 0 && (
                          <p className="text-primary font-bold">₹{Number(hotel.price_per_night).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">/ night</span></p>
                        )}
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to={featured?.cta_link || "/hotels"}><Button variant="outline" size="lg" className="rounded-full gap-2">{featured?.cta_text || "View All Hotels"} <ArrowRight className="w-4 h-4" /></Button></Link>
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews.length > 0 && reviewsSection && (
        <section className="section-padding bg-muted/30">
          <div className="container-wide">
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">{reviewsSection?.title || "Guest Reviews"}</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary mx-auto mb-4 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.slice(0, 3).map((r: any) => (
                <GlassCard key={r.id} className="p-6">
                  <div className="flex gap-1 mb-3">{[...Array(r.rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}</div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{r.comment}</p>
                  <p className="font-semibold text-sm">{r.reviewer_name}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {cta && (
        <section className="section-padding">
          <div className="container-wide">
            <GlassCard className="p-12 text-center">
              <h2 className="font-display text-3xl font-bold mb-4">{cta?.title || "Ready to Book?"}</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">{cta?.subtitle || "Get in touch with us for the best rates and personalized service"}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={cta?.cta_link || "/booking?type=hotel"}><Button size="lg" className="rounded-full gap-2 px-8">{cta?.cta_text || "Book Now"} <CheckCircle className="w-4 h-4" /></Button></Link>
                {settings?.whatsapp && (
                  <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="rounded-full gap-2 px-8"><Mail className="w-4 h-4" /> WhatsApp</Button>
                  </a>
                )}
              </div>
            </GlassCard>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default HotelLanding;
