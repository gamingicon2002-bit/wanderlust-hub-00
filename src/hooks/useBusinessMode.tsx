import { useSiteSettings } from "@/hooks/useSiteSettings";

export type BusinessMode = "full" | "package_only" | "hotel_only" | "invoice_only";

// Define which admin sidebar modules are visible per business mode
const MODE_MODULES: Record<BusinessMode, string[]> = {
  full: [], // empty means all visible
  package_only: [
    "dashboard", "homepage", "packages", "vehicles", "vehicle_types", "destinations",
    "offers", "gallery", "bookings", "drivers", "customers", "invoices", "invoice_brands",
    "itinerary", "itinerary_history", "contacts", "notifications", "reviews", "blogs",
    "blog_comments", "social_links", "users", "pages", "settings", "role_permissions",
  ],
  hotel_only: [
    "dashboard", "homepage", "hotels", "hotel_bookings", "hotel_reviews",
    "bookings", "customers", "invoices", "invoice_brands", "contacts", "notifications",
    "reviews", "blogs", "blog_comments", "social_links", "users", "pages", "settings",
    "role_permissions", "gallery", "offers",
  ],
  invoice_only: [
    "dashboard", "invoices", "invoice_brands", "customers", "contacts", "notifications",
    "users", "pages", "settings", "role_permissions",
  ],
};

// Frontend navbar items per mode
const MODE_NAV_ITEMS: Record<BusinessMode, string[]> = {
  full: ["packages", "vehicles", "destinations", "hotels", "offers", "blogs", "gallery", "contact"],
  package_only: ["packages", "vehicles", "destinations", "offers", "blogs", "gallery", "contact"],
  hotel_only: ["hotels", "offers", "blogs", "gallery", "contact"],
  invoice_only: ["contact"],
};

export const useBusinessMode = () => {
  const { settings } = useSiteSettings();
  const mode = ((settings as any)?.business_mode || "full") as BusinessMode;

  const isModuleVisible = (moduleKey: string): boolean => {
    if (mode === "full") return true;
    return MODE_MODULES[mode]?.includes(moduleKey) ?? false;
  };

  const getVisibleNavItems = () => MODE_NAV_ITEMS[mode] || MODE_NAV_ITEMS.full;

  return { mode, isModuleVisible, getVisibleNavItems };
};
