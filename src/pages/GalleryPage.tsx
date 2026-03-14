import { useState } from "react";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const db = (table: string) => (supabase as any).from(table);

const GalleryPage = () => {
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data } = await db("gallery").select("*").order("sort_order");
      return data || [];
    },
  });

  const categories = ["all", ...new Set(images.map((img: any) => img.category))];
  const filtered = filter === "all" ? images : images.filter((img: any) => img.category === filter);

  return (
    <Layout>
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="container-wide relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-6xl font-bold mb-4">
            Travel <span className="text-gradient">Gallery</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Browse stunning moments from our tours and journeys.
          </motion.p>
        </div>
      </section>

      <section className="section-padding -mt-8">
        <div className="container-wide">
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {categories.map((cat: string) => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${filter === cat ? "bg-primary text-primary-foreground shadow-[var(--glow-primary)]" : "glass-card text-muted-foreground hover:text-foreground"}`}>
                {cat}
              </button>
            ))}
          </div>
          {isLoading ? <p className="text-center">Loading...</p> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((img: any) => (
                <motion.div key={img.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer group glow-border" onClick={() => setSelected(img.image_url)}>
                  <img src={img.image_url} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                </motion.div>
              ))}
            </div>
          )}
          {!isLoading && filtered.length === 0 && <p className="text-center text-muted-foreground py-16">No images yet.</p>}
        </div>
      </section>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <button className="absolute top-4 right-4 text-foreground" onClick={() => setSelected(null)}><X className="w-8 h-8" /></button>
            <img src={selected} alt="Gallery" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default GalleryPage;
