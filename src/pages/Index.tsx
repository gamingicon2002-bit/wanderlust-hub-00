import { lazy, Suspense, useState } from "react";
import { stripHtml } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, Phone, ChevronDown, MapPin, Users, Shield, Clock, IndianRupee, Globe, Plane, Send, CheckCircle, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-travel.jpg";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { format } from "date-fns";

const HeroScene = lazy(() => import("@/components/HeroScene"));

const db = (table: string) => (supabase as any).from(table);

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } }),
};

const iconMap: Record<string, any> = { MapPin, Users, Shield, Clock };

const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="text-center mb-14">
    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display text-3xl md:text-5xl font-bold mb-4">
      {title}
    </motion.h2>
    <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="h-1 w-20 bg-gradient-to-r from-primary to-secondary mx-auto mb-4 rounded-full" />
    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-muted-foreground max-w-2xl mx-auto text-lg">
      {subtitle}
    </motion.p>
  </div>
);

const InquirySection = ({ section }: { section: any }) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return;
    setLoading(true);
    const { error } = await (supabase as any).from("contact_submissions").insert({
      name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), message: "Quick inquiry from homepage",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: "Could not submit. Please try again.", variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  return (
    <section className="section-padding">
      <div className="container-wide">
        <GlassCard hover={false} className="p-8 md:p-14 max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="relative z-10">
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2 text-foreground">Inquiry Submitted!</h3>
                <p className="text-muted-foreground mb-4">Our travel experts will contact you shortly.</p>
                <Button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "" }); }} variant="outline" className="rounded-full">Submit Another Inquiry</Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 text-foreground">{section?.title || "Ready to Start Your Journey?"}</h2>
                  <p className="text-muted-foreground max-w-lg mx-auto">{section?.subtitle || "Share your details and our travel experts will get back to you."}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-sm"><User className="w-3.5 h-3.5 text-muted-foreground" /> Full Name *</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-sm"><Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email *</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} placeholder="your@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-sm"><Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone *</Label>
                      <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required maxLength={20} placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                    <Button type="submit" size="lg" className="px-8 rounded-full shadow-[var(--glow-primary)] w-full sm:w-auto" disabled={loading}>
                      {loading ? "Submitting..." : <><Send className="w-4 h-4 mr-2" /> Send Inquiry</>}
                    </Button>
                    <Link to="/booking"><Button type="button" size="lg" variant="outline" className="px-8 rounded-full border-border w-full sm:w-auto">Book Now</Button></Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

const Index = () => {
  const { getSection } = useHomepageSections();
  const hero = getSection("hero");
  const statsSection = getSection("stats");
  const featPkgSection = getSection("featured_packages");
  const intlSection = getSection("international_packages");
  const destSection = getSection("destinations");
  const vehSection = getSection("vehicles");
  const offersSection = getSection("offers");
  const testSection = getSection("testimonials");
  const gallerySection = getSection("gallery");
  const inquirySection = getSection("inquiry");

  const statsItems = statsSection?.extra_data?.items || [
    { icon: "MapPin", label: "Destinations", value: "50+" },
    { icon: "Users", label: "Happy Travelers", value: "10,000+" },
    { icon: "Shield", label: "Years Experience", value: "15+" },
    { icon: "Clock", label: "24/7 Support", value: "Always" },
  ];

  const { data: packages = [] } = useQuery({
    queryKey: ["featured-packages"],
    queryFn: async () => { const { data } = await db("packages").select("*").eq("is_featured", true).eq("tour_type", "domestic").limit(4); return data || []; },
  });

  const { data: internationalPackages = [] } = useQuery({
    queryKey: ["international-packages"],
    queryFn: async () => { const { data } = await db("packages").select("*").eq("tour_type", "international").limit(4); return data || []; },
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ["destinations-home"],
    queryFn: async () => { const { data } = await db("destinations").select("*").limit(4); return data || []; },
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles-home"],
    queryFn: async () => { const { data } = await db("vehicles").select("*").limit(3); return data || []; },
  });

  const { data: offers = [] } = useQuery({
    queryKey: ["offers-home"],
    queryFn: async () => { const { data } = await db("special_offers").select("*").eq("is_active", true).limit(2); return data || []; },
  });

  const { data: gallery = [] } = useQuery({
    queryKey: ["gallery-home"],
    queryFn: async () => { const { data } = await db("gallery").select("*").order("sort_order").limit(4); return data || []; },
  });

  // Dynamic testimonials from approved reviews
  const { data: testimonials = [] } = useQuery({
    queryKey: ["homepage-reviews"],
    queryFn: async () => {
      const { data } = await db("reviews").select("*").eq("status", "approved").order("created_at", { ascending: false }).limit(6);
      return data || [];
    },
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[100vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        <img src={hero?.image_url || heroImage} alt="Travel destination" className="absolute inset-0 w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />
        <Suspense fallback={null}><HeroScene /></Suspense>
        <div className="relative z-10 text-center px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="inline-block mb-6">
            <span className="glass-card px-5 py-2.5 rounded-full text-sm font-medium text-primary tracking-widest uppercase">
              {hero?.badge_text || "✦ Premium Travel Experiences"}
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="font-display text-5xl md:text-8xl font-bold text-foreground mb-6 leading-[1.1]">
            {(hero?.title || "Explore Beyond Boundaries").split("\n").map((line: string, i: number) => (
              <span key={i}>{i > 0 && <br />}{i === 1 ? <span className="text-gradient">{line}</span> : line}</span>
            ))}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            {hero?.subtitle || "Handcrafted tours, premium vehicles, and unforgettable experiences across India and the world."}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={hero?.cta_link || "/packages"}>
              <Button size="lg" className="text-base px-8 h-12 rounded-full shadow-[var(--glow-primary)]">
                {hero?.cta_text || "Explore Packages"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/booking">
              <Button size="lg" variant="outline" className="text-base px-8 h-12 rounded-full border-border hover:bg-muted bg-transparent">Book Now</Button>
            </Link>
          </motion.div>
        </div>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative -mt-20 z-20 px-4">
        <div className="container-wide">
          <div className="glass-strong rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-6 py-10 px-8">
            {statsItems.map((stat: any, i: number) => {
              const Icon = iconMap[stat.icon] || MapPin;
              return (
                <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-muted-foreground text-sm">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      {packages.length > 0 && (
        <section className="section-padding mesh-gradient">
          <div className="container-wide">
            <SectionHeading title={featPkgSection?.title || "Featured Tour Packages"} subtitle={featPkgSection?.subtitle || "Curated domestic experiences"} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg: any, i: number) => (
                <motion.div key={pkg.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
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
                        <Badge className="bg-primary/80 text-primary-foreground backdrop-blur-sm capitalize">Domestic</Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                        <MapPin className="w-3 h-3" /> {pkg.destination} <span className="mx-1">•</span> <Clock className="w-3 h-3" /> {pkg.duration}
                      </div>
                      <h3 className="font-display text-lg font-semibold mb-2 line-clamp-1 text-foreground">{pkg.name}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{stripHtml(pkg.short_description || pkg.description)}</p>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-xl font-bold text-primary"><IndianRupee className="w-4 h-4" />{pkg.price?.toLocaleString()}</span>
                        <Link to={`/packages/${pkg.id}`}><Button size="sm" variant="outline" className="rounded-full border-border text-xs">View Details</Button></Link>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to={featPkgSection?.cta_link || "/packages"}>
                <Button variant="outline" size="lg" className="rounded-full border-border">{featPkgSection?.cta_text || "View All Packages"} <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* International Tours */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/5" />
        <div className="container-wide relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-secondary" />
            <Plane className="w-5 h-5 text-secondary" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-secondary" />
          </div>
          <SectionHeading title={intlSection?.title || "International Tours"} subtitle={intlSection?.subtitle || "Explore the world"} />
          {internationalPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {internationalPackages.map((pkg: any, i: number) => (
                <motion.div key={pkg.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                  <GlassCard className="group glow-border">
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img src={pkg.image || "/placeholder.svg"} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                      <div className="absolute top-3 left-3"><Badge className="bg-secondary text-secondary-foreground backdrop-blur-sm"><Globe className="w-3 h-3 mr-1" /> International</Badge></div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2"><MapPin className="w-3 h-3" /> {pkg.destination} <span className="mx-1">•</span> <Clock className="w-3 h-3" /> {pkg.duration}</div>
                      <h3 className="font-display text-lg font-semibold mb-2 line-clamp-1 text-foreground">{pkg.name}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{stripHtml(pkg.short_description || pkg.description)}</p>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-xl font-bold text-secondary"><IndianRupee className="w-4 h-4" />{pkg.price?.toLocaleString()}</span>
                        <Link to={`/packages/${pkg.id}`}><Button size="sm" variant="outline" className="rounded-full border-border text-xs">View Details</Button></Link>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center max-w-2xl mx-auto">
              <Globe className="w-16 h-16 text-secondary/40 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">Coming Soon</h3>
              <p className="text-muted-foreground">Our international tour packages are being curated.</p>
            </div>
          )}
        </div>
      </section>

      {/* Destinations */}
      {destinations.length > 0 && (
        <section className="section-padding">
          <div className="container-wide">
            <SectionHeading title={destSection?.title || "Popular Destinations"} subtitle={destSection?.subtitle || "Explore the diverse beauty"} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.map((dest: any, i: number) => (
                <motion.div key={dest.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                  <Link to={`/destinations/${dest.id}`} className="block group">
                    <div className="relative rounded-2xl overflow-hidden aspect-[3/4] glow-border">
                      <img src={dest.image || "/placeholder.svg"} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="font-display text-2xl font-bold text-foreground mb-1">{dest.name}</h3>
                        <p className="text-muted-foreground text-sm">{stripHtml(dest.short_description)}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vehicles */}
      {vehicles.length > 0 && (
        <section className="section-padding mesh-gradient">
          <div className="container-wide">
            <SectionHeading title={vehSection?.title || "Our Fleet"} subtitle={vehSection?.subtitle || "Premium vehicles"} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vehicles.map((v: any, i: number) => (
                <motion.div key={v.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                  <GlassCard className="group">
                    <div className="aspect-video overflow-hidden">
                      <img src={v.image || "/placeholder.svg"} alt={v.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold mb-1 text-foreground">{v.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{v.capacity} Seater {v.price_per_km ? `• ₹${v.price_per_km}/km` : ""}</p>
                      {v.features && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {v.features.slice(0, 3).map((f: string) => (
                            <span key={f} className="text-xs bg-muted/50 backdrop-blur-sm border border-border px-2.5 py-1 rounded-full text-muted-foreground">{f}</span>
                          ))}
                        </div>
                      )}
                      <Link to={`/vehicles/${v.id}`}><Button variant="outline" size="sm" className="w-full rounded-full border-border">View Details</Button></Link>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to={vehSection?.cta_link || "/vehicles"}>
                <Button variant="outline" size="lg" className="rounded-full border-border">{vehSection?.cta_text || "View All Vehicles"} <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Special Offers */}
      {offers.length > 0 && (
        <section className="section-padding relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
          <div className="container-wide relative z-10">
            <SectionHeading title={offersSection?.title || "Special Offers"} subtitle={offersSection?.subtitle || "Limited time deals"} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {offers.map((offer: any, i: number) => (
                <motion.div key={offer.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                  <GlassCard className="flex flex-col sm:flex-row overflow-hidden">
                    <div className="sm:w-2/5 aspect-video sm:aspect-auto overflow-hidden">
                      <img src={offer.image || "/placeholder.svg"} alt={offer.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center">
                      <h3 className="font-display text-xl font-bold mb-2 text-foreground">{offer.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{offer.description}</p>
                      {offer.discount_text && <p className="text-primary font-bold mb-2">{offer.discount_text}</p>}
                      {offer.valid_until && <p className="text-xs text-muted-foreground mb-4">Valid until {new Date(offer.valid_until).toLocaleDateString()}</p>}
                      <Link to="/offers"><Button size="sm" className="rounded-full w-fit">Grab This Deal</Button></Link>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials - Dynamic from approved reviews */}
      <section className="section-padding">
        <div className="container-wide">
          <SectionHeading title={testSection?.title || "What Our Travelers Say"} subtitle={testSection?.subtitle || "Real experiences from real travelers"} />
          {testimonials.length > 0 ? (
            <div className="relative">
              <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {testimonials.map((t: any, i: number) => (
                  <motion.div key={t.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="min-w-[320px] max-w-[380px] snap-start flex-shrink-0">
                    <GlassCard className="p-6 h-full">
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-muted-foreground text-sm mb-5 italic leading-relaxed">"{t.comment}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground">
                          {t.reviewer_name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-foreground">{t.reviewer_name}</div>
                          <div className="text-xs text-muted-foreground">{format(new Date(t.created_at), "MMM yyyy")}</div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center max-w-2xl mx-auto">
              <Star className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Preview */}
      {gallery.length > 0 && (
        <section className="section-padding mesh-gradient">
          <div className="container-wide">
            <SectionHeading title={gallerySection?.title || "Travel Gallery"} subtitle={gallerySection?.subtitle || "Moments captured from our tours"} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {gallery.map((img: any) => (
                <div key={img.id} className="aspect-square rounded-xl overflow-hidden group cursor-pointer glow-border">
                  <img src={img.image_url} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to={gallerySection?.cta_link || "/gallery"}>
                <Button variant="outline" size="lg" className="rounded-full border-border">{gallerySection?.cta_text || "View Full Gallery"} <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <InquirySection section={inquirySection} />
    </Layout>
  );
};

export default Index;
