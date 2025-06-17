
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface JobMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'status_update';
  created_at: string;
  read_by_customer: boolean;
  read_by_employee: boolean;
}

export const useJobMessages = (bookingId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<JobMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    if (!bookingId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching job messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, messageType: 'text' | 'image' | 'status_update' = 'text') => {
    if (!user || !bookingId) return null;

    try {
      const { data, error } = await supabase
        .from('job_messages')
        .insert([{
          booking_id: bookingId,
          sender_id: user.id,
          message,
          message_type: messageType
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchMessages();
      return data;
    } catch (err) {
      console.error('Error sending message:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [bookingId]);

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages
  };
};
