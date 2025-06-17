
-- Legg til en user_roles tabell for å håndtere roller
CREATE TYPE public.app_role AS ENUM ('customer', 'employee', 'admin');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Aktiver Row Level Security for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Opprett en sikker funksjon for å sjekke brukerroller
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policyer for user_roles
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
  ON public.user_roles 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Oppdater bookings tabellen for å støtte godkjenningsprosessen
ALTER TABLE public.bookings 
ADD COLUMN assigned_employee_id UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN approved_by UUID REFERENCES auth.users(id);

-- Oppdater status enum for å inkludere flere statuser
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Legg til kommentarer for klarhet
COMMENT ON COLUMN public.bookings.assigned_employee_id IS 'Ansatt som er tildelt oppdraget';
COMMENT ON COLUMN public.bookings.approved_at IS 'Tidspunkt når oppdraget ble godkjent';
COMMENT ON COLUMN public.bookings.approved_by IS 'Ansatt som godkjente oppdraget';

-- Oppdater RLS policyer for bookings
CREATE POLICY "Employees can view all bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'employee') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can update assigned bookings" 
  ON public.bookings 
  FOR UPDATE 
  USING (
    (public.has_role(auth.uid(), 'employee') OR public.has_role(auth.uid(), 'admin'))
    AND (assigned_employee_id = auth.uid() OR assigned_employee_id IS NULL)
  );
