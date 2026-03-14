import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const db = (table: string) => (supabase as any).from(table);

export const useHomepageSections = () => {
  const { data: allSections = [], isLoading } = useQuery({
    queryKey: ["homepage-sections"],
    queryFn: async () => {
      const { data } = await db("homepage_sections").select("*").order("sort_order");
      return data || [];
    },
  });

  // Active sections for rendering on homepage
  const sections = allSections.filter((s: any) => s.is_active);

  const getSection = (key: string) => sections.find((s: any) => s.section_key === key);

  // All sections including hidden ones (for nav filtering)
  return { sections, allSections, getSection, isLoading };
};
