
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
  estimated_duration?: number; // in minutes
  estimated_price_min?: number; // in øre
  estimated_price_max?: number; // in øre
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure status is properly typed
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

  const createBooking = async (bookingData: {
    property_id: string;
    service_type: string;
    scheduled_date?: string;
    estimated_duration?: number;
    estimated_price_min?: number;
    estimated_price_max?: number;
    special_instructions?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          ...bookingData,
          user_id: user.id,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      // Type assertion for the returned data
      const typedBooking = {
        ...data,
        status: data.status as Booking['status']
      };

      setBookings(prev => [typedBooking, ...prev]);
      return typedBooking;
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
        .select()
        .single();

      if (error) throw error;

      // Type assertion for the returned data
      const typedBooking = {
        ...data,
        status: data.status as Booking['status']
      };

      setBookings(prev => 
        prev.map(booking => 
          booking.id === id ? typedBooking : booking
        )
      );
      return typedBooking;
    } catch (err) {
      console.error('Error updating booking:', err);
      setError(err instanceof Error ? err.message : 'En feil oppstod');
      return null;
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBooking,
    refetch: fetchBookings
  };
};
