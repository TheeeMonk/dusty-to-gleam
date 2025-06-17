
-- Legg til ansatt-rolle for brukeren tony@montana-digital.no
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'employee'::app_role
FROM auth.users 
WHERE email = 'tony@montana-digital.no'
ON CONFLICT (user_id, role) DO NOTHING;
