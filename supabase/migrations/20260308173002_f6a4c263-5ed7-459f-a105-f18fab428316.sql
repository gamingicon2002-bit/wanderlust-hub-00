
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'super_admin'::app_role 
FROM auth.users u 
WHERE u.email = 'admin@travel.com'
ON CONFLICT (user_id, role) DO NOTHING;
