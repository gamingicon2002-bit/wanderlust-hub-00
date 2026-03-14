import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const db = (table: string) => (supabase as any).from(table);

export interface SiteSettings {
  id: string;
  contact_email: string;
  phone: string;
  whatsapp: string;
  office_address: string;
  company_name: string;
  tagline: string;
  business_mode?: string;
  show_theme_toggle?: boolean;
}

export const useSiteSettings = () => {
  const { data, isLoading, ...rest } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await db("site_settings").select("*").limit(1).single();
      return data as SiteSettings | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  return { settings: data, isLoading, ...rest };
};
