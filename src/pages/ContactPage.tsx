import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import GlassCard from "@/components/GlassCard";

const db = (table: string) => (supabase as any).from(table);

const ContactPage = () => {
  const { settings: s } = useSiteSettings();
  const settings = s || { phone: "", whatsapp: "", contact_email: "", office_address: "", company_name: "", tagline: "", id: "" };
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setLoading(true);
    const { error } = await db("contact_submissions").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: form.message.trim(),
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: "Could not send message. Please try again.", variant: "destructive" });
    } else {
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    }
  };

  const whatsappLink = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello! I'm interested in your travel services.")}`;
  const mapQuery = encodeURIComponent(settings.office_address);

  const contactCards = [
    {
      icon: Phone,
      title: "Call Us",
      value: settings.phone,
      href: `tel:${settings.phone}`,
      color: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      icon: Mail,
      title: "Email Us",
      value: settings.contact_email,
      href: `mailto:${settings.contact_email}`,
      color: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      value: settings.office_address,
      color: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      icon: Clock,
      title: "Working Hours",
      value: "Mon–Sat: 9AM–7PM | Sun: 10AM–4PM",
      color: "bg-primary/10",
      iconColor: "text-primary",
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="container-wide relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-block mb-5">
            <span className="glass-card px-5 py-2.5 rounded-full text-xs font-medium text-primary tracking-widest uppercase">
              ✦ We'd Love To Hear From You
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-7xl font-bold mb-5">
            Get in <span className="text-gradient">Touch</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Planning your dream trip? Have a question? Our travel experts are just a message away.
          </motion.p>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="relative -mt-12 z-20 px-4">
        <div className="container-wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactCards.map((card, i) => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                {card.href ? (
                  <a href={card.href}>
                    <GlassCard className="p-5 h-full group">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                          <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-display font-semibold text-sm mb-1">{card.title}</h3>
                          <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors truncate">{card.value}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </a>
                ) : (
                  <GlassCard hover={false} className="p-5 h-full">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center flex-shrink-0`}>
                        <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-semibold text-sm mb-1">{card.title}</h3>
                        <p className="text-sm text-muted-foreground">{card.value}</p>
                      </div>
                    </div>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content: Form + Map */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <GlassCard hover={false} className="p-8 h-full">
                {submitted ? (
                  <div className="text-center py-16">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                    </motion.div>
                    <h3 className="font-display text-3xl font-bold mb-3">Message Sent!</h3>
                    <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                    <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-full px-8">Send Another Message</Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Send us a Message</h2>
                      <p className="text-muted-foreground text-sm">Fill out the form and we'll be in touch shortly.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Full Name *</Label>
                          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} placeholder="Your name" className="h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Email *</Label>
                          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} placeholder="your@email.com" className="h-11" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Phone</Label>
                        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} placeholder="+91 XXXXX XXXXX" className="h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Message *</Label>
                        <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={1000} rows={5} placeholder="Tell us about your travel plans, preferred destinations, budget..." className="resize-none" />
                      </div>
                      <Button type="submit" size="lg" className="w-full rounded-full h-12 text-base" disabled={loading}>
                        {loading ? "Sending..." : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
                      </Button>
                    </form>
                  </>
                )}
              </GlassCard>
            </motion.div>

            {/* Map + WhatsApp */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
              {/* Map */}
              <GlassCard hover={false} className="overflow-hidden">
                <div className="p-5 pb-3">
                  <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Our Location
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{settings.office_address}</p>
                </div>
                <div className="aspect-[4/3] w-full">
                  <iframe
                    title="Office Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={
                      (settings as any).map_lat && (settings as any).map_lng
                        ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${(settings as any).map_lat},${(settings as any).map_lng}&zoom=15`
                        : `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${mapQuery}`
                    }
                    allowFullScreen
                  />
                </div>
              </GlassCard>

              {/* WhatsApp CTA */}
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
                <GlassCard className="p-6 group cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-7 h-7 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold mb-1">Chat on WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">Get instant replies from our travel experts. We're online now!</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </GlassCard>
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
