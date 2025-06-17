
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorHandler } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (supabaseError) {
        const appError = ErrorHandler.handle(supabaseError, { userId: user.id });
        setError(ErrorHandler.getDisplayMessage(appError));
        logger.error('Failed to fetch user profile', { userId: user.id });
      } else {
        setProfile(data);
        logger.info('User profile fetched successfully');
      }
    } catch (err) {
      const appError = ErrorHandler.handle(err, { userId: user.id });
      setError(ErrorHandler.getDisplayMessage(appError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile
  };
};
