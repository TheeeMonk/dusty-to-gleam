
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ErrorHandler } from '@/utils/errorHandler';
import { InputSanitizer } from '@/utils/inputSanitizer';
import { RateLimiter } from '@/utils/rateLimiter';
import { logger } from '@/utils/logger';

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

      if (error) {
        const appError = ErrorHandler.handle(error, { bookingId });
        logger.error('Failed to fetch job messages', { bookingId });
        toast({
          title: 'Error',
          description: ErrorHandler.getDisplayMessage(appError),
          variant: 'destructive'
        });
        return;
      }
      
      // Type assertion to ensure proper typing
      const typedMessages = (data || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as 'text' | 'image' | 'status_update'
      }));
      
      setMessages(typedMessages);
      logger.info('Job messages fetched successfully', { count: typedMessages.length });
    } catch (err) {
      const appError = ErrorHandler.handle(err, { bookingId });
      toast({
        title: 'Error',
        description: ErrorHandler.getDisplayMessage(appError),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, messageType: 'text' | 'image' | 'status_update' = 'text') => {
    if (!user || !bookingId) return null;

    // Rate limiting check
    const rateLimitKey = `message_${user.id}_${Date.now().toString().slice(0, -3)}`; // Per minute
    if (!RateLimiter.check(rateLimitKey, 10, 60000)) {
      toast({
        title: 'Too Many Messages',
        description: 'Please wait before sending another message.',
        variant: 'destructive'
      });
      return null;
    }

    try {
      // Sanitize message content
      const sanitizedMessage = InputSanitizer.sanitizeNotes(message);
      
      if (!sanitizedMessage.trim()) {
        toast({
          title: 'Error',
          description: 'Message cannot be empty.',
          variant: 'destructive'
        });
        return null;
      }

      const { data, error } = await supabase
        .from('job_messages')
        .insert([{
          booking_id: bookingId,
          sender_id: user.id,
          message: sanitizedMessage,
          message_type: messageType,
          read_by_customer: false,
          read_by_employee: false
        }])
        .select()
        .single();

      if (error) {
        const appError = ErrorHandler.handle(error, { bookingId, messageType });
        toast({
          title: 'Error',
          description: ErrorHandler.getDisplayMessage(appError),
          variant: 'destructive'
        });
        return null;
      }

      await fetchMessages();
      logger.info('Message sent successfully', { messageType });
      return data;
    } catch (err) {
      const appError = ErrorHandler.handle(err, { bookingId, messageType });
      toast({
        title: 'Error',
        description: ErrorHandler.getDisplayMessage(appError),
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
