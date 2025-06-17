
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorHandler } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';

export interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  rooms?: number;
  square_meters?: number;
  windows?: number;
  floors?: number;
  bathrooms?: number;
  bedrooms?: number;
  has_pets?: boolean;
  balcony?: boolean;
  garden?: boolean;
  parking?: boolean;
  elevator?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        const appError = ErrorHandler.handle(supabaseError, { userId: user.id });
        setError(ErrorHandler.getDisplayMessage(appError));
        logger.error('Error fetching properties', { userId: user.id });
      } else {
        setProperties(data || []);
        logger.info('Properties fetched successfully');
      }
    } catch (err) {
      const appError = ErrorHandler.handle(err, { userId: user.id });
      setError(ErrorHandler.getDisplayMessage(appError));
    } finally {
      setLoading(false);
    }
  };

  const addProperty = async (propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('properties')
        .insert([{
          ...propertyData,
          user_id: user.id
        }])
        .select()
        .single();

      if (supabaseError) {
        const appError = ErrorHandler.handle(supabaseError, { userId: user.id });
        setError(ErrorHandler.getDisplayMessage(appError));
        return null;
      }

      setProperties(prev => [data, ...prev]);
      logger.info('Property added successfully');
      return data;
    } catch (err) {
      const appError = ErrorHandler.handle(err, { userId: user.id });
      setError(ErrorHandler.getDisplayMessage(appError));
      return null;
    }
  };

  const updateProperty = async (id: string, propertyData: Partial<Property>) => {
    if (!user) return null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('properties')
        .update({
          ...propertyData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) {
        const appError = ErrorHandler.handle(supabaseError, { userId: user.id });
        setError(ErrorHandler.getDisplayMessage(appError));
        return null;
      }

      setProperties(prev => 
        prev.map(property => 
          property.id === id ? data : property
        )
      );
      logger.info('Property updated successfully');
      return data;
    } catch (err) {
      const appError = ErrorHandler.handle(err, { userId: user.id });
      setError(ErrorHandler.getDisplayMessage(appError));
      return null;
    }
  };

  const deleteProperty = async (id: string) => {
    if (!user) return false;

    try {
      const { error: supabaseError } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        const appError = ErrorHandler.handle(supabaseError, { userId: user.id });
        setError(ErrorHandler.getDisplayMessage(appError));
        return false;
      }

      setProperties(prev => prev.filter(property => property.id !== id));
      logger.info('Property deleted successfully');
      return true;
    } catch (err) {
      const appError = ErrorHandler.handle(err, { userId: user.id });
      setError(ErrorHandler.getDisplayMessage(appError));
      return false;
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [user]);

  return {
    properties,
    loading,
    error,
    addProperty,
    updateProperty,
    deleteProperty,
    refetch: fetchProperties
  };
};
