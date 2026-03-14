import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { settings, isLoading } = useSiteSettings();

  if (isLoading || !settings) return null;

  const whatsappLink = `https://wa.me/${(settings.whatsapp || "").replace(/[^0-9]/g, "")}`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.office_address || "")}`;

  return (
    <footer className="relative overflow-hidden border-t border-border">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30" />
      <div className="container-wide section-padding relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-gradient">{settings.company_name}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {settings.tagline || "Your trusted travel partner for unforgettable journeys across India and the world. We craft experiences that create lifelong memories."}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/packages" className="hover:text-primary transition-colors">Tour Packages</Link></li>
              <li><Link to="/vehicles" className="hover:text-primary transition-colors">Vehicles</Link></li>
              <li><Link to="/destinations" className="hover:text-primary transition-colors">Destinations</Link></li>
              <li><Link to="/offers" className="hover:text-primary transition-colors">Special Offers</Link></li>
              <li><Link to="/gallery" className="hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link to="/blogs" className="hover:text-primary transition-colors">Blogs</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4 text-foreground">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/packages?type=domestic" className="hover:text-primary transition-colors">Domestic Tours</Link></li>
              <li><Link to="/packages?type=international" className="hover:text-primary transition-colors">International Tours</Link></li>
              <li><Link to="/vehicles" className="hover:text-primary transition-colors">Car Rental</Link></li>
              <li><Link to="/booking?type=taxi" className="hover:text-primary transition-colors">Taxi Services</Link></li>
              <li><Link to="/booking?type=vehicle" className="hover:text-primary transition-colors">Airport Transfers</Link></li>
              <li><Link to="/booking?type=vehicle" className="hover:text-primary transition-colors">Corporate Travel</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4 text-foreground">Contact Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href={`tel:${settings.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" /> {settings.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" /> {settings.contact_email}
                </a>
              </li>
              <li>
                <a href={mapLink} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-primary transition-colors">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> {settings.office_address}
                </a>
              </li>
              <li>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <MessageCircle className="w-4 h-4 text-primary flex-shrink-0" /> WhatsApp Chat
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {settings.company_name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/page/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/page/terms-and-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
