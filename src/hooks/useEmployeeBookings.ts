
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EmployeeBooking {
  id: string;
  user_id: string;
  property_id: string;
  service_type: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date?: string;
  scheduled_time?: string;
  estimated_duration?: number;
  estimated_price_min?: number;
  estimated_price_max?: number;
  special_instructions?: string;
  assigned_employee_id?: string;
  start_time?: string;
  end_time?: string;
  actual_duration?: number;
  notes?: string;
  employee_notes?: string;
  created_at: string;
  updated_at: string;
  // We'll need to join with other tables for customer info
  customer_email?: string;
  property_address?: string;
  property_name?: string;
  property_type?: string;
  property_rooms?: number;
  property_square_meters?: number;
  property_floors?: number;
  property_bathrooms?: number;
  property_bedrooms?: number;
}

export const useEmployeeBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<EmployeeBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching bookings for employee:', user.id);

      // First, fetch bookings with property info
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          properties(
            name, 
            address, 
            type, 
            rooms, 
            square_meters, 
            floors, 
            bathrooms, 
            bedrooms
          )
        `)
        .order('scheduled_date', { ascending: true, nullsFirst: false })
        .order('scheduled_time', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        throw bookingsError;
      }

      console.log('Raw bookings data:', bookingsData);

      // Then fetch user profiles separately to get customer names
      const userIds = bookingsData?.map(booking => booking.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create a map of user IDs to profile data
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Transform the data to include customer and property info
      const transformedBookings = (bookingsData || []).map(booking => ({
        ...booking,
        customer_email: profilesMap.get(booking.user_id)?.full_name || 'Ukjent kunde',
        property_address: booking.properties?.address || 'Ukjent adresse',
        property_name: booking.properties?.name || 'Ukjent eiendom',
        property_type: booking.properties?.type || '',
        property_rooms: booking.properties?.rooms || 0,
        property_square_meters: booking.properties?.square_meters || 0,
        property_floors: booking.properties?.floors || 0,
        property_bathrooms: booking.properties?.bathrooms || 0,
        property_bedrooms: booking.properties?.bedrooms || 0,
        status: booking.status as EmployeeBooking['status']
      }));

      console.log('Transformed bookings:', transformedBookings);
      console.log('Pending bookings:', transformedBookings.filter(b => b.status === 'pending'));
      setBookings(transformedBookings);
    } catch (err) {
      console.error('Error fetching employee bookings:', err);
      setError(err instanceof Error ? err.message : 'En feil oppstod');
      toast({
        title: 'Feil',
        description: 'Kunne ikke laste bookinger',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async (bookingId: string) => {
    console.log('confirmBooking called with ID:', bookingId);
    console.log('Current user:', user?.id);
    
    if (!user) {
      console.error('No user found for booking confirmation');
      throw new Error('Du må være logget inn for å bekrefte bookinger');
    }

    try {
      const now = new Date().toISOString();
      console.log('Updating booking with:', {
        bookingId,
        status: 'confirmed',
        assigned_employee_id: user.id,
        approved_at: now,
        approved_by: user.id,
        updated_at: now
      });
      
      // First check current booking status
      const { data: currentBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('status, assigned_employee_id')
        .eq('id', bookingId)
        .single();

      if (fetchError) {
        console.error('Error fetching current booking:', fetchError);
        throw fetchError;
      }

      console.log('Current booking status:', currentBooking);

      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          assigned_employee_id: user.id,
          approved_at: now,
          approved_by: user.id,
          updated_at: now
        })
        .eq('id', bookingId)
        .select();

      if (error) {
        console.error('Supabase error during update:', error);
        throw error;
      }

      console.log('Booking updated successfully:', data);

      // Refresh bookings list
      await fetchBookings();
    } catch (err) {
      console.error('Error confirming booking:', err);
      throw err;
    }
  };

  const startJob = async (bookingId: string) => {
    if (!user) {
      throw new Error('Du må være logget inn');
    }

    try {
      const now = new Date().toISOString();
      console.log('Starting job:', bookingId);
      
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'in_progress',
          start_time: now,
          assigned_employee_id: user.id,
          updated_at: now
        })
        .eq('id', bookingId);

      if (error) throw error;

      await fetchBookings();
    } catch (err) {
      console.error('Error starting job:', err);
      throw err;
    }
  };

  const completeJob = async (bookingId: string, employeeNotes?: string) => {
    try {
      const now = new Date().toISOString();
      console.log('Completing job:', bookingId);
      
      // Get the booking to calculate actual duration
      const booking = bookings.find(b => b.id === bookingId);
      let actualDuration = null;
      
      if (booking?.start_time) {
        const startTime = new Date(booking.start_time);
        const endTime = new Date(now);
        actualDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes
      }

      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          end_time: now,
          actual_duration: actualDuration,
          employee_notes: employeeNotes,
          updated_at: now
        })
        .eq('id', bookingId);

      if (error) throw error;

      await fetchBookings();
    } catch (err) {
      console.error('Error completing job:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  return {
    bookings,
    loading,
    error,
    confirmBooking,
    startJob,
    completeJob,
    refetch: fetchBookings
  };
};
