
-- Fix RLS policies for bookings table to resolve conflicts and ensure proper employee access

-- First, drop all existing conflicting policies on bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Employees can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Employees can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Employees can update all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Employees can update assigned bookings" ON public.bookings;

-- Create comprehensive and non-conflicting RLS policies for bookings

-- Policy for customers to view their own bookings
CREATE POLICY "Customers can view own bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for employees and admins to view all bookings
CREATE POLICY "Employees can view all bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (
    public.has_role(auth.uid(), 'employee') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Policy for customers to create their own bookings
CREATE POLICY "Customers can create own bookings" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for customers to update their own pending bookings
CREATE POLICY "Customers can update own pending bookings" 
  ON public.bookings 
  FOR UPDATE 
  USING (
    auth.uid() = user_id AND 
    status IN ('pending', 'confirmed')
  );

-- Policy for employees and admins to update all bookings
CREATE POLICY "Employees can update all bookings" 
  ON public.bookings 
  FOR UPDATE 
  USING (
    public.has_role(auth.uid(), 'employee') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Policy for customers to delete their own pending bookings
CREATE POLICY "Customers can delete own pending bookings" 
  ON public.bookings 
  FOR DELETE 
  USING (
    auth.uid() = user_id AND 
    status = 'pending'
  );

-- Policy for admins to delete any booking
CREATE POLICY "Admins can delete any booking" 
  ON public.bookings 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix RLS policies for job_images table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Employees can manage job images" ON public.job_images;
DROP POLICY IF EXISTS "Customers can view images for their bookings" ON public.job_images;

-- Create comprehensive policies for job_images
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

-- Fix RLS policies for job_messages table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages for their bookings" ON public.job_messages;
DROP POLICY IF EXISTS "Users can send messages for their bookings" ON public.job_messages;

-- Create comprehensive policies for job_messages
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

-- Ensure user_roles table has proper policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Employees can insert user roles" ON public.user_roles;

-- Create proper policies for user_roles
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles" 
  ON public.user_roles 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Add indexes for better performance on security checks
CREATE INDEX IF NOT EXISTS idx_bookings_user_security ON public.bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_roles_security ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_job_images_booking_security ON public.job_images(booking_id);
CREATE INDEX IF NOT EXISTS idx_job_messages_booking_security ON public.job_messages(booking_id, sender_id);
