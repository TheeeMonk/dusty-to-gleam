
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface JobMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'status_update';
  read_by_customer: boolean;
  read_by_employee: boolean;
  created_at: string;
}

export const useJobMessages = (bookingId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
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
      
      // Type assertion to ensure proper typing
      const typedMessages = (data || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as 'text' | 'image' | 'status_update'
      }));
      
      setMessages(typedMessages);
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
          message: message,
          message_type: messageType,
          read_by_customer: false,
          read_by_employee: false
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchMessages();
      return data;
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: 'Feil',
        description: 'Kunne ikke sende meldingen.',
        variant: 'destructive'
      });
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
