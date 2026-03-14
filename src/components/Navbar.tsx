import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Phone, MapPin, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { useTheme } from "@/hooks/useTheme";

const allNavLinks = [
  { to: "/", label: "Home", sectionKey: null, navKey: null },
  { to: "/packages", label: "Packages", sectionKey: "packages", navKey: "packages" },
  { to: "/vehicles", label: "Vehicles", sectionKey: "vehicles", navKey: "vehicles" },
  { to: "/destinations", label: "Destinations", sectionKey: "destinations", navKey: "destinations" },
  { to: "/hotels", label: "Hotels", sectionKey: null, navKey: "hotels" },
  { to: "/offers", label: "Offers", sectionKey: "offers", navKey: "offers" },
  { to: "/blogs", label: "Blogs", sectionKey: null, navKey: "blogs" },
  { to: "/gallery", label: "Gallery", sectionKey: "gallery", navKey: "gallery" },
  { to: "/contact", label: "Contact", sectionKey: null, navKey: "contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { settings, isLoading } = useSiteSettings();
  const { allSections: sections } = useHomepageSections();
  const { mode, toggleMode } = useTheme();

  // Filter nav links based on active homepage sections AND navbar_items setting
  const navLinks = allNavLinks.filter(link => {
    if (!link.navKey) return true;
    
    const navbarItems = settings ? (settings as any)?.navbar_items : null;
    if (navbarItems && navbarItems[link.navKey] === false) return false;
    
    if (link.sectionKey) {
      const section = sections.find((s: any) => s.section_key === link.sectionKey);
      if (section && !section.is_active) return false;
    }
    return true;
  });

  if (isLoading || !settings) {
    return (
      <>
        <div className="bg-muted/50 border-b border-border h-9" />
        <header className="sticky top-0 z-50 glass-strong border-b border-border h-16" />
      </>
    );
  }

  return (
    <>
      <div className="bg-muted/50 backdrop-blur-sm border-b border-border text-muted-foreground text-sm py-2 px-4">
        <div className="container-wide flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href={`tel:${settings.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
              <Phone className="w-3 h-3 text-primary" /> {settings.phone}
            </a>
            <span className="hidden sm:flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" /> {(settings.office_address || "").split(",")[0]}</span>
          </div>
          <div className="flex items-center gap-3">
            {settings.show_theme_toggle !== false && (
              <Button variant="ghost" size="icon" onClick={toggleMode} className="h-7 w-7">
                {mode === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </Button>
            )}
            <span className="hidden sm:block text-xs tracking-wider uppercase">{settings.tagline}</span>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="container-wide flex items-center justify-between h-16 px-4">
          <Link to="/" className="font-display text-2xl font-bold text-gradient">
            {settings.company_name}
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.to
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:block">
            <Link to="/booking">
              <Button className="rounded-full shadow-[var(--glow-primary)]">Book Now</Button>
            </Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden glass-strong border-t border-border"
            >
              <div className="flex flex-col p-4 gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                      location.pathname === link.to
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link to="/booking" onClick={() => setOpen(false)}>
                  <Button className="w-full mt-2 rounded-full">Book Now</Button>
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Navbar;
