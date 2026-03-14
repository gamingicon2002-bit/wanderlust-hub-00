import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Users, IndianRupee, CalendarCheck, Fuel, Settings2, Shield, Star, Images } from "lucide-react";
import ReviewSection from "@/components/ReviewSection";
import Layout from "@/components/Layout";
import ImageSlider from "@/components/ImageSlider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const db = (table: string) => (supabase as any).from(table);

const VehicleDetail = () => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { id } = useParams();

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const { data, error } = await db("vehicles").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: driver } = useQuery({
    queryKey: ["driver-for-vehicle", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await db("drivers").select("*").eq("vehicle_id", id!).eq("is_active", true).limit(1);
      return data?.[0] || null;
    },
  });

  if (isLoading) return <Layout><div className="section-padding text-center">Loading...</div></Layout>;
  if (!vehicle) return <Layout><div className="section-padding text-center"><h1 className="font-display text-3xl font-bold mb-4">Vehicle Not Found</h1><Link to="/vehicles"><Button>Back to Vehicles</Button></Link></div></Layout>;

  const allImages = [vehicle.image, ...(vehicle.images || [])].filter(Boolean);
  const bookingUrl = `/booking?type=vehicle&name=${encodeURIComponent(vehicle.name)}&ref=${vehicle.id}`;

  const specs = [
    { icon: Users, label: "Seating", value: `${vehicle.capacity} Seats` },
    { icon: Fuel, label: "Fuel", value: vehicle.fuel_type || "Petrol" },
    { icon: Settings2, label: "Transmission", value: vehicle.transmission || "Automatic" },
  ];

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-wide max-w-5xl">
          <Link to="/vehicles" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Vehicles
          </Link>

          <div className="relative">
            <ImageSlider images={allImages} alt={vehicle.name} />
            {allImages.length > 0 && (
              <Button size="sm" variant="secondary" className="absolute bottom-4 right-4 z-10 rounded-full shadow-lg gap-2" onClick={() => setGalleryOpen(true)}>
                <Images className="w-4 h-4" /> View All Photos ({allImages.length})
              </Button>
            )}
          </div>

          <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display">{vehicle.name} — All Photos</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {allImages.map((img: string, i: number) => (
                  <div key={i} className="rounded-lg overflow-hidden aspect-video">
                    <img src={img} alt={`${vehicle.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <Badge variant="outline" className="capitalize">{vehicle.type}</Badge>
                  {vehicle.sub_type && <Badge variant="secondary" className="capitalize">{vehicle.sub_type}</Badge>}
                  {vehicle.model && <Badge variant="outline">{vehicle.model}</Badge>}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{vehicle.name}</h1>
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:text-foreground" dangerouslySetInnerHTML={{ __html: vehicle.description || '' }} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {specs.map((spec) => (
                  <motion.div key={spec.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <GlassCard hover={false} className="p-4 text-center">
                      <spec.icon className="w-6 h-6 mx-auto text-primary mb-2" />
                      <p className="text-xs text-muted-foreground mb-1">{spec.label}</p>
                      <p className="font-semibold text-sm">{spec.value}</p>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              {vehicle.features && vehicle.features.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">Features & Amenities</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {vehicle.features.map((f: string, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-2 text-sm bg-muted/50 border border-border px-4 py-2.5 rounded-xl text-muted-foreground">
                        <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" /> {f}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {vehicle.rental_options && vehicle.rental_options.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">Rental Options</h2>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.rental_options.map((opt: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-sm px-4 py-2">{opt}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {driver && (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">Your Driver</h2>
                  <GlassCard hover={false} className="p-5 relative overflow-hidden">
                    <div className="flex items-center gap-4 blur-[5px] select-none pointer-events-none">
                      {driver.photo ? (
                        <img src={driver.photo} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-primary/30" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">{driver.name[0]}</div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-lg">{driver.name}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-primary" /> {driver.experience_years}+ yrs experience</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px] rounded-xl">
                      <div className="text-center">
                        <Shield className="w-6 h-6 text-primary mx-auto mb-1" />
                        <p className="text-sm font-semibold text-foreground">Professional Driver Assigned</p>
                        <p className="text-xs text-muted-foreground">Details shared after booking confirmation</p>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              )}

              <ReviewSection reviewableType="vehicle" reviewableId={id!} />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <GlassCard hover={false} className="p-6 space-y-5">
                  {vehicle.price_per_km && (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="flex items-center text-3xl font-bold text-primary"><IndianRupee className="w-5 h-5" />{vehicle.price_per_km}</span>
                        <span className="text-sm text-muted-foreground">/ km</span>
                      </div>
                      {vehicle.price_per_day && <p className="text-sm text-muted-foreground mt-1">or ₹{vehicle.price_per_day}/day</p>}
                    </div>
                  )}
                  <Link to={bookingUrl}>
                    <Button size="lg" className="w-full rounded-full shadow-[var(--glow-primary)]">
                      <CalendarCheck className="w-4 h-4 mr-2" /> Book This Vehicle
                    </Button>
                  </Link>
                  {vehicle.brochure_url && (
                    <Button size="lg" variant="outline" className="w-full rounded-full" onClick={() => window.open(vehicle.brochure_url, "_blank")}>
                      <Download className="w-4 h-4 mr-2" /> Download Brochure
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground text-center">No advance payment required. Confirm availability first.</p>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default VehicleDetail;
