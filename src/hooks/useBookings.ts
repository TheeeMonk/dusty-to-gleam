import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Booking {
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
  approved_at?: string;
  approved_by?: string;
}

export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched bookings for user:', user.id, data);
      // Ensure status is properly typed
      const typedBookings = (data || []).map(booking => ({
        ...booking,
        status: booking.status as Booking['status']
      }));
      setBookings(typedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'En feil oppstod');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          ...bookingData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Refresh bookings to get the latest state
      await fetchBookings();
      return data;
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'En feil oppstod');
      return null;
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Refresh bookings to get the latest state
      await fetchBookings();
      return data;
    } catch (err) {
      console.error('Error updating booking:', err);
      setError(err instanceof Error ? err.message : 'En feil oppstod');
      return null;
    }
  };

  const deleteBooking = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh bookings to get the latest state
      await fetchBookings();
      return true;
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError(err instanceof Error ? err.message : 'En feil oppstod');
      return false;
    }
  };

  // Set up real-time subscription for booking updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time booking update:', payload);
          // Refresh bookings when any change occurs
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBooking,
    deleteBooking,
    refetch: fetchBookings
  };
};
