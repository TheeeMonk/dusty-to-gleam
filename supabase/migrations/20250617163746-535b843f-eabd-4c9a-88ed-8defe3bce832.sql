
-- Oppdater bookings tabellen for å støtte ansatt-funksjonalitet
ALTER TABLE public.bookings 
ADD COLUMN start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN actual_duration INTEGER, -- i minutter
ADD COLUMN notes TEXT,
ADD COLUMN employee_notes TEXT;

-- Opprett tabell for bilder (før og etter)
CREATE TABLE public.job_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  image_type TEXT NOT NULL CHECK (image_type IN ('before', 'after')),
  image_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Opprett tabell for kommunikasjon mellom kunder og ansatte
CREATE TABLE public.job_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'status_update')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_by_customer BOOLEAN DEFAULT false,
  read_by_employee BOOLEAN DEFAULT false
);

-- Aktiver RLS for nye tabeller
ALTER TABLE public.job_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_messages ENABLE ROW LEVEL SECURITY;

-- RLS policyer for job_images
CREATE POLICY "Employees can manage job images" 
  ON public.job_images 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'employee') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers can view images for their bookings" 
  ON public.job_images 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.bookings WHERE id = job_images.booking_id
    )
  );

-- RLS policyer for job_messages
CREATE POLICY "Users can view messages for their bookings" 
  ON public.job_messages 
  FOR SELECT 
  USING (
    auth.uid() = sender_id OR
    auth.uid() IN (
      SELECT user_id FROM public.bookings WHERE id = job_messages.booking_id
    ) OR
    auth.uid() IN (
      SELECT assigned_employee_id FROM public.bookings WHERE id = job_messages.booking_id
    )
  );

CREATE POLICY "Users can send messages for their bookings" 
  ON public.job_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND (
      auth.uid() IN (
        SELECT user_id FROM public.bookings WHERE id = job_messages.booking_id
      ) OR
      auth.uid() IN (
        SELECT assigned_employee_id FROM public.bookings WHERE id = job_messages.booking_id
      ) OR
      public.has_role(auth.uid(), 'employee') OR 
      public.has_role(auth.uid(), 'admin')
    )
  );

-- Oppdater RLS policyer for bookings for å la ansatte se alle bestillinger
DROP POLICY IF EXISTS "Employees can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Employees can update assigned bookings" ON public.bookings;

CREATE POLICY "Employees can view all bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'employee') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Employees can update bookings" 
  ON public.bookings 
  FOR UPDATE 
  USING (
    auth.uid() = user_id OR
    public.has_role(auth.uid(), 'employee') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Legg til indekser for bedre ytelse
CREATE INDEX idx_job_images_booking_id ON public.job_images(booking_id);
CREATE INDEX idx_job_images_type ON public.job_images(image_type);
CREATE INDEX idx_job_messages_booking_id ON public.job_messages(booking_id);
CREATE INDEX idx_job_messages_sender ON public.job_messages(sender_id);
CREATE INDEX idx_bookings_assigned_employee ON public.bookings(assigned_employee_id);
CREATE INDEX idx_bookings_status_date ON public.bookings(status, scheduled_date);
