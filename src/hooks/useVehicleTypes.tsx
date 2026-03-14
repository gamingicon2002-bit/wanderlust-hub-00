import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const db = (table: string) => (supabase as any).from(table);

export interface VehicleType {
  id: string;
  name: string;
  label: string;
  icon: string;
  parent_id: string | null;
  sort_order: number;
}

export const useVehicleTypes = () => {
  const { data: allTypes = [], isLoading } = useQuery({
    queryKey: ["vehicle-types"],
    queryFn: async () => {
      const { data } = await db("vehicle_types").select("*").order("sort_order");
      return (data || []) as VehicleType[];
    },
  });

  const mainTypes = allTypes.filter((t) => !t.parent_id);
  const getSubTypes = (parentName: string) => {
    const parent = mainTypes.find((t) => t.name === parentName);
    if (!parent) return [];
    return allTypes.filter((t) => t.parent_id === parent.id);
  };

  const getLabel = (name: string) => {
    const t = allTypes.find((t) => t.name === name);
    return t?.label || name;
  };

  const getIcon = (name: string) => {
    const t = mainTypes.find((t) => t.name === name);
    return t?.icon || "";
  };

  return { allTypes, mainTypes, getSubTypes, getLabel, getIcon, isLoading };
};
