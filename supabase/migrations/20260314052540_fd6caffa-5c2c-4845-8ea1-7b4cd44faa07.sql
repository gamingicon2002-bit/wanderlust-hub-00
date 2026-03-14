-- Add admin role to all moderators who are missing it (needed for RLS policies)
INSERT INTO public.user_roles (user_id, role)
SELECT ur.user_id, 'admin'::app_role
FROM public.user_roles ur
WHERE ur.role = 'moderator'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur2
  WHERE ur2.user_id = ur.user_id AND ur2.role = 'admin'
);