import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const db = (table: string) => (supabase as any).from(table);

export const useLandingSections = (pageKey: string) => {
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["landing-sections", pageKey],
    queryFn: async () => {
      const { data } = await db("landing_page_sections")
        .select("*")
        .eq("page_key", pageKey)
        .eq("is_active", true)
        .order("sort_order");
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const getSection = (key: string) => sections.find((s: any) => s.section_key === key);

  return { sections, getSection, isLoading };
};
