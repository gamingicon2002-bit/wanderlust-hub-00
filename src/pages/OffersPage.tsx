import Layout from "@/components/Layout";
import { stripHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { Link } from "react-router-dom";

const db = (table: string) => (supabase as any).from(table);

const OffersPage = () => {
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const { data } = await db("special_offers").select("*").eq("is_active", true).order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <Layout>
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="container-wide relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-6xl font-bold mb-4">
            Special <span className="text-gradient">Offers</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Grab these limited-time deals before they're gone!
          </motion.p>
        </div>
      </section>

      <section className="section-padding -mt-8">
        <div className="container-wide max-w-4xl">
          {isLoading ? <p className="text-center">Loading...</p> : (
            <div className="space-y-6">
              {offers.map((offer: any, i: number) => (
                <motion.div key={offer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <GlassCard className="flex flex-col sm:flex-row overflow-hidden">
                    <div className="sm:w-2/5 aspect-video sm:aspect-auto overflow-hidden">
                      <img src={offer.image || "/placeholder.svg"} alt={offer.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center">
                      {offer.discount_percent && (
                        <Badge className="bg-destructive text-destructive-foreground w-fit mb-3">{offer.discount_percent}% OFF</Badge>
                      )}
                      <h3 className="font-display text-xl font-bold mb-2">{offer.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{stripHtml(offer.description)}</p>
                      {offer.discount_text && <p className="text-primary font-bold mb-2">{offer.discount_text}</p>}
                      {offer.valid_until && <p className="text-xs text-muted-foreground mb-4">Valid until {new Date(offer.valid_until).toLocaleDateString()}</p>}
                      <Link to="/booking"><Button size="sm" className="rounded-full w-fit">Grab This Deal</Button></Link>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
          {!isLoading && offers.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No active offers right now. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default OffersPage;
