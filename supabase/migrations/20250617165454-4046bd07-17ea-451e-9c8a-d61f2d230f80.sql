
-- Check if the RLS policies allow employees to update bookings
-- First, let's ensure the existing policies are working correctly

-- Drop existing policies if they exist and recreate them properly
DROP POLICY IF EXISTS "Employees can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Employees can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Employees can update assigned bookings" ON public.bookings;

-- Create updated policies for employees to view and update bookings
CREATE POLICY "Employees can view all bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
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

-- Drop and recreate the user roles policy for inserting roles
DROP POLICY IF EXISTS "Employees can insert user roles" ON public.user_roles;
CREATE POLICY "Employees can insert user roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
