
-- Legg til en kolonne for klokkeslett i bookings tabellen
ALTER TABLE public.bookings 
ADD COLUMN scheduled_time TIME;

-- Oppdater kommentar for scheduled_date for klarhet
COMMENT ON COLUMN public.bookings.scheduled_date IS 'Dato for rengjøringen';
COMMENT ON COLUMN public.bookings.scheduled_time IS 'Klokkeslett for rengjøringen';
