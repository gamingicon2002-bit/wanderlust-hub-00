import { useBusinessMode } from "@/hooks/useBusinessMode";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const db = (table: string) => (supabase as any).from(table);

/**
 * Unified module visibility check combining:
 * 1. Business mode (site_settings.business_mode)
 * 2. Role permissions (role_permissions table for moderators)
 * Super admins see everything regardless.
 */
export const useModuleAccess = () => {
  const { mode, isModuleVisible: businessModeVisible, getVisibleNavItems } = useBusinessMode();
  const { isAdmin, isSuperAdmin } = useAuth();
  const isModerator = isAdmin && !isSuperAdmin;

  const { data: rolePermissions = [] } = useQuery({
    queryKey: ["role-permissions-access"],
    queryFn: async () => {
      const { data } = await db("role_permissions").select("*");
      return data || [];
    },
    enabled: isAdmin,
  });

  const isModuleVisible = (moduleKey: string): boolean => {
    // Super admins see everything
    if (isSuperAdmin) return true;

    // Business mode check
    if (!businessModeVisible(moduleKey)) return false;

    // Role permission check for moderators
    if (isModerator) {
      const perm = rolePermissions.find(
        (p: any) => p.role === "moderator" && p.module === moduleKey
      );
      if (perm) {
        if (perm.is_hidden) return false;
        if (!perm.can_view) return false;
      }
    }

    return true;
  };

  return { mode, isModuleVisible, getVisibleNavItems, isSuperAdmin, isModerator };
};
