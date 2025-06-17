
-- First, drop all RLS policies that depend on the has_role function
DROP POLICY IF EXISTS "Employees can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Employees can update all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete any booking" ON public.bookings;
DROP POLICY IF EXISTS "Users can view images for their bookings" ON public.job_images;
DROP POLICY IF EXISTS "Employees can manage job images" ON public.job_images;
DROP POLICY IF EXISTS "Users can view relevant messages" ON public.job_messages;
DROP POLICY IF EXISTS "Authorized users can send messages" ON public.job_messages;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Now drop and recreate the has_role function with a secure, immutable search_path
DROP FUNCTION IF EXISTS public.has_role(_user_id uuid, _role app_role);
DROP FUNCTION IF EXISTS public.has_role();

-- Recreate the has_role function with a fixed search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add a comment to document the function
COMMENT ON FUNCTION public.has_role(_user_id UUID, _role app_role) IS 'Securely checks if a user has a specific role with fixed search_path';

-- Recreate all the RLS policies using the updated function

-- Bookings policies
CREATE POLICY "Employees can view all bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (
    public.has_role(auth.uid(), 'employee') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Employees can update all bookings" 
  ON public.bookings 
  FOR UPDATE 
  USING (
    public.has_role(auth.uid(), 'employee') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete any booking" 
  ON public.bookings 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Job images policies
CREATE POLICY "Users can view images for their bookings" 
  ON public.job_images 
  FOR SELECT 
  USING (
    -- Customer can see images for their bookings
    auth.uid() IN (
      SELECT user_id FROM public.bookings WHERE id = job_images.booking_id
    ) OR
    -- Employees can see all images
    public.has_role(auth.uid(), 'employee') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Employees can manage job images" 
  ON public.job_images 
  FOR ALL 
  USING (
    public.has_role(auth.uid(), 'employee') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Job messages policies
CREATE POLICY "Users can view relevant messages" 
  ON public.job_messages 
  FOR SELECT 
  USING (
    -- Message sender can view
    auth.uid() = sender_id OR
    -- Customer can view messages for their bookings
    auth.uid() IN (
      SELECT user_id FROM public.bookings WHERE id = job_messages.booking_id
    ) OR
    -- Assigned employee can view
    auth.uid() IN (
      SELECT assigned_employee_id FROM public.bookings 
      WHERE id = job_messages.booking_id AND assigned_employee_id IS NOT NULL
    ) OR
    -- Any employee/admin can view
    public.has_role(auth.uid(), 'employee') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authorized users can send messages" 
  ON public.job_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND (
      -- Customer can send messages for their bookings
      auth.uid() IN (
        SELECT user_id FROM public.bookings WHERE id = job_messages.booking_id
      ) OR
      -- Assigned employee can send messages
      auth.uid() IN (
        SELECT assigned_employee_id FROM public.bookings 
        WHERE id = job_messages.booking_id AND assigned_employee_id IS NOT NULL
      ) OR
      -- Any employee/admin can send messages
      public.has_role(auth.uid(), 'employee') OR 
      public.has_role(auth.uid(), 'admin')
    )
  );

-- User roles policies
CREATE POLICY "Admins can view all roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles" 
  ON public.user_roles 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));
