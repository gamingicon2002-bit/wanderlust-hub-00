import { Phone, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { motion } from "framer-motion";

const FloatingButtons = () => {
  const { settings, isLoading } = useSiteSettings();

  if (isLoading || !settings) return null;

  const whatsappLink = `https://wa.me/${(settings.whatsapp || "").replace(/[^0-9]/g, "")}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <motion.a
        href={`tel:${settings.phone}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Call us"
      >
        <Phone className="w-6 h-6" />
      </motion.a>
      <motion.a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: "spring" }}
        className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.a>
    </div>
  );
};

export default FloatingButtons;
