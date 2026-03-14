import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Receipt, Users, ArrowRight, IndianRupee, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLandingSections } from "@/hooks/useLandingSections";

const iconMap: Record<string, any> = { Receipt, Users, IndianRupee };

const InvoiceLanding = () => {
  const { settings } = useSiteSettings();
  const { sections, getSection } = useLandingSections("invoice_landing");

  const hero = getSection("hero");
  const cta = getSection("cta");
  const featureSections = sections.filter((s: any) => s.section_key.startsWith("feature_"));

  return (
    <Layout>
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="container-wide relative z-10 text-center py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              {settings?.company_name || "Business"} <span className="text-gradient">{hero?.title || "Invoicing"}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {hero?.subtitle || settings?.tagline || "Professional invoicing and billing management"}
            </p>
            <Link to={hero?.cta_link || "/admin/login"}>
              <Button size="lg" className="rounded-full gap-2 px-8">
                {hero?.cta_text || "Go to Dashboard"} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {featureSections.length > 0 && (
        <section className="section-padding">
          <div className="container-wide">
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Features</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featureSections.map((f: any, i: number) => {
                const Icon = iconMap[f.icon] || Receipt;
                return (
                  <motion.div key={f.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                    <GlassCard className="p-8 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="font-display text-xl font-bold mb-2">{f.title}</h3>
                      <p className="text-muted-foreground text-sm">{f.subtitle || f.description}</p>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {cta && (
        <section className="section-padding bg-muted/30">
          <div className="container-wide text-center">
            <GlassCard className="p-12">
              <h2 className="font-display text-3xl font-bold mb-4">{cta.title || "Get Started"}</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">{cta.subtitle || "Login to your admin dashboard to manage invoices and customers"}</p>
              <Link to={cta.cta_link || "/admin/login"}>
                <Button size="lg" className="rounded-full gap-2 px-8">
                  <CheckCircle className="w-4 h-4" /> {cta.cta_text || "Admin Login"}
                </Button>
              </Link>
            </GlassCard>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default InvoiceLanding;
