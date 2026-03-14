import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Car, Package, MapPin, CheckCircle, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import GlassCard from "@/components/GlassCard";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const db = (table: string) => (supabase as any).from(table);

const bookingTypes = [
  { value: "package", label: "Tour Package", icon: Package },
  { value: "vehicle", label: "Vehicle Rental", icon: Car },
  { value: "taxi", label: "Taxi Service", icon: MapPin },
  { value: "hotel", label: "Hotel Booking", icon: Package },
];

const rentalOptions = ["Self Drive", "With Driver", "Airport Pickup/Drop"];

const BookingPage = () => {
  const [params] = useSearchParams();
  const { settings: s } = useSiteSettings();
  const settings = s || { phone: "", whatsapp: "", contact_email: "", office_address: "", company_name: "", tagline: "", id: "" };
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [travelDate, setTravelDate] = useState<Date>();

  const preSelectedType = params.get("type") || "";
  const preSelectedName = params.get("name") || "";
  const hasPreSelection = !!preSelectedType && !!preSelectedName;

  const [form, setForm] = useState({
    booking_type: preSelectedType || "package",
    reference_name: preSelectedName,
    reference_id: params.get("ref") || "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    pickup_location: "",
    drop_location: "",
    travel_date: "",
    travel_time: "",
    num_travelers: 1,
    vehicle_type: "",
    rental_option: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.customer_email.trim() || !form.customer_phone.trim()) return;
    setLoading(true);
    const payload = {
      ...form,
      customer_name: form.customer_name.trim(),
      customer_email: form.customer_email.trim(),
      customer_phone: form.customer_phone.trim(),
      reference_id: form.reference_id || null,
      travel_date: travelDate ? format(travelDate, "yyyy-MM-dd") : null,
    };
    const { error } = await db("bookings").insert(payload);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: "Could not submit booking. Please try again.", variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  const whatsappMsg = encodeURIComponent(
    `Hello! I'd like to book:\nType: ${form.booking_type}\n${form.reference_name ? `Package/Vehicle: ${form.reference_name}\n` : ""}Name: ${form.customer_name}\nDate: ${travelDate ? format(travelDate, "dd MMM yyyy") : "Not set"}\nTravelers: ${form.num_travelers}${form.pickup_location ? `\nPickup: ${form.pickup_location}` : ""}${form.drop_location ? `\nDrop: ${form.drop_location}` : ""}`
  );
  const whatsappLink = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}?text=${whatsappMsg}`;

  const isVehicle = form.booking_type === "vehicle" || form.booking_type === "taxi";
  const isPackage = form.booking_type === "package";
  const isHotel = form.booking_type === "hotel";

  const heroTitles: Record<string, string> = {
    package: "Book Your Tour",
    vehicle: "Rent a Vehicle",
    taxi: "Book a Taxi",
    hotel: "Book a Hotel",
  };

  const heroSubtitles: Record<string, string> = {
    package: "Fill in the details below and we'll get back to you with the best options.",
    vehicle: "Select your vehicle preferences and we'll arrange the perfect ride.",
    taxi: "Tell us your route and we'll arrange comfortable taxi service.",
    hotel: "Tell us your stay preferences and we'll confirm availability.",
  };

  return (
    <Layout>
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="container-wide relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-6xl font-bold mb-4">
            {hasPreSelection ? (
              <>Book <span className="text-gradient">{form.reference_name}</span></>
            ) : (
              <>{heroTitles[form.booking_type] || "Book Your"} <span className="text-gradient">Journey</span></>
            )}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg max-w-xl mx-auto">
            {heroSubtitles[form.booking_type] || "Fill in the details below and we'll get back to you."}
          </motion.p>
        </div>
      </section>

      <section className="section-padding -mt-8">
        <div className="container-wide max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard hover={false} className="p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-2 text-foreground">Booking Submitted!</h3>
                  <p className="text-muted-foreground mb-6">We'll contact you within 2 hours to confirm your booking.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="rounded-full gap-2">
                        <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                      </Button>
                    </a>
                    <Button onClick={() => { setSubmitted(false); setForm({ ...form, customer_name: "", customer_email: "", customer_phone: "", notes: "" }); }} className="rounded-full">
                      New Booking
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {!hasPreSelection && (
                    <div>
                      <Label className="text-base font-semibold mb-3 block text-foreground">Booking Type</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {bookingTypes.map((t) => (
                          <button key={t.value} type="button"
                            onClick={() => setForm({ ...form, booking_type: t.value })}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${form.booking_type === t.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"}`}>
                            <t.icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasPreSelection && (
                    <div className="glass-card rounded-lg p-4 flex items-center gap-3">
                      {isPackage ? <Package className="w-5 h-5 text-primary" /> : <Car className="w-5 h-5 text-primary" />}
                      <div>
                        <span className="text-sm font-medium text-foreground">{form.reference_name}</span>
                        <p className="text-xs text-muted-foreground capitalize">{form.booking_type} Booking</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Full Name *</Label>
                      <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Email *</Label>
                      <Input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} required maxLength={255} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Phone *</Label>
                      <Input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} required maxLength={20} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Number of Travelers</Label>
                      <Input type="number" min={1} max={100} value={form.num_travelers} onChange={(e) => setForm({ ...form, num_travelers: Number(e.target.value) })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Travel Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !travelDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {travelDate ? format(travelDate, "dd MMM yyyy") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={travelDate}
                            onSelect={setTravelDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Preferred Time</Label>
                      <Input type="time" value={form.travel_time} onChange={(e) => setForm({ ...form, travel_time: e.target.value })} className="text-foreground" />
                    </div>
                  </div>

                  {isVehicle && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">Pickup Location</Label>
                          <Input value={form.pickup_location} onChange={(e) => setForm({ ...form, pickup_location: e.target.value })} placeholder="City or address" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Drop Location</Label>
                          <Input value={form.drop_location} onChange={(e) => setForm({ ...form, drop_location: e.target.value })} placeholder="City or address" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">Vehicle Type</Label>
                          <Input value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })} placeholder="Car / SUV / Tempo / Bus" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Rental Option</Label>
                          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" value={form.rental_option} onChange={(e) => setForm({ ...form, rental_option: e.target.value })}>
                            <option value="">Select option</option>
                            {rentalOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label className="text-foreground">Additional Notes</Label>
                    <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={1000} rows={3} placeholder="Any special requirements..." />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button type="submit" size="lg" className="flex-1 rounded-full" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Booking Request"}
                    </Button>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button type="button" size="lg" variant="outline" className="w-full rounded-full gap-2">
                        <MessageCircle className="w-4 h-4" /> Book via WhatsApp
                      </Button>
                    </a>
                  </div>
                </form>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default BookingPage;
