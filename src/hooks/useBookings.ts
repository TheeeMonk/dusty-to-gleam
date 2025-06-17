
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

export interface Booking {
  id: string;
  user_id: string;
  property_id: string;
  service_type: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date?: string;
  scheduled_time?: string;
  estimated_duration?: number; // in minutes
  estimated_price_min?: number; // in øre
  estimated_price_max?: number; // in øre
  special_instructions?: string;
  assigned_employee_id?: string;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export const useBookings = () => {
  const { user } = useAuth();
  const { sendBookingConfirmation, scheduleReminder } = useNotifications();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Fetching bookings for user:', user.id);
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched bookings:', data);
      
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
    scheduled_time?: string;
    estimated_duration?: number;
    estimated_price_min?: number;
    estimated_price_max?: number;
    special_instructions?: string;
  }) => {
    if (!user) return null;

    try {
      console.log('Creating booking with data:', bookingData);
      
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

      console.log('Created booking:', data);

      // Type assertion for the returned data
      const typedBooking = {
        ...data,
        status: data.status as Booking['status']
      };

      setBookings(prev => [typedBooking, ...prev]);
      
      // Refetch to ensure we have the latest data
      await fetchBookings();
      
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

      // Send notification if booking was confirmed
      if (updates.status === 'confirmed' && typedBooking.status === 'confirmed') {
        console.log('Booking confirmed, sending notification');
        
        // Send confirmation notification
        sendBookingConfirmation({
          customerName: user.email || 'Kunde',
          serviceType: typedBooking.service_type,
          scheduledDate: typedBooking.scheduled_date,
          scheduledTime: typedBooking.scheduled_time
        });

        // Schedule reminder if date and time are available
        if (typedBooking.scheduled_date && typedBooking.scheduled_time) {
          scheduleReminder({
            scheduledDate: typedBooking.scheduled_date,
            scheduledTime: typedBooking.scheduled_time,
            customerName: user.email || 'Kunde',
            serviceType: typedBooking.service_type,
            address: 'Din bolig' // This would need to be fetched from property data
          });
        }
      }

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
