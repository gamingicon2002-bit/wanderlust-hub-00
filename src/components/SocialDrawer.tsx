import { useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { motion, AnimatePresence } from "framer-motion";

const SocialDrawer = () => {
  const [open, setOpen] = useState(false);
  const { links } = useSocialLinks();

  if (links.length === 0) return null;

  return (
    <>
      {/* Toggle tab on left edge */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-primary text-primary-foreground px-1.5 py-4 rounded-r-xl shadow-lg hover:px-2.5 transition-all"
        aria-label="Social links"
      >
        <div className="flex flex-col gap-2 items-center">
          {links.slice(0, 4).map((link) => (
            <span key={link.id} className="text-sm">{link.icon_name}</span>
          ))}
        </div>
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-card border-r border-border shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-display font-bold text-lg">Follow Us</h3>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                {links.map((link, i) => (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors group"
                  >
                    <span className="text-2xl">{link.icon_name}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{link.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SocialDrawer;
