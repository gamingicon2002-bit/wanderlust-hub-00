import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const db = (table: string) => (supabase as any).from(table);

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
}

export const useSocialLinks = () => {
  const { data = [], ...rest } = useQuery({
    queryKey: ["social-links"],
    queryFn: async () => {
      const { data } = await db("social_links").select("*").eq("is_active", true).order("sort_order");
      return (data || []) as SocialLink[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return { links: data, ...rest };
};
