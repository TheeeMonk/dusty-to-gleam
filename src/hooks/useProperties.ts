
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
      setProperties([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        const appError = ErrorHandler.handle(supabaseError, { userId: user.id });
        setError(ErrorHandler.getDisplayMessage(appError));
        logger.error('Error fetching properties', { userId: user.id, error: supabaseError });
      } else {
        setProperties(data || []);
        logger.info('Properties fetched successfully', { count: data?.length || 0 });
      }
    } catch (err) {
      const appError = ErrorHandler.handle(err, { userId: user.id });
      setError(ErrorHandler.getDisplayMessage(appError));
      logger.error('Unexpected error fetching properties', { userId: user.id, error: err });
    } finally {
      setLoading(false);
    }
  };

  const addProperty = async (propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      setError(null);
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
        logger.error('Error adding property', { userId: user.id, error: supabaseError });
        return null;
      }

      if (data) {
        setProperties(prev => [data, ...prev]);
        logger.info('Property added successfully', { propertyId: data.id });
      }
      return data;
    } catch (err) {
      const appError = ErrorHandler.handle(err, { userId: user.id });
      setError(ErrorHandler.getDisplayMessage(appError));
      logger.error('Unexpected error adding property', { userId: user.id, error: err });
      return null;
    }
  };

  const updateProperty = async (id: string, propertyData: Partial<Property>) => {
    if (!user) return null;

    try {
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('properties')
        .update({
          ...propertyData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (supabaseError) {
        const appError = ErrorHandler.handle(supabaseError, { userId: user.id });
        setError(ErrorHandler.getDisplayMessage(appError));
        logger.error('Error updating property', { userId: user.id, propertyId: id, error: supabaseError });
        return null;
      }

      if (data) {
        setProperties(prev => 
          prev.map(property => 
            property.id === id ? data : property
          )
        );
        logger.info('Property updated successfully', { propertyId: id });
      }
      return data;
    } catch (err) {
      const appError = ErrorHandler.handle(err, { userId: user.id });
      setError(ErrorHandler.getDisplayMessage(appError));
      logger.error('Unexpected error updating property', { userId: user.id, propertyId: id, error: err });
      return null;
    }
  };

  const deleteProperty = async (id: string) => {
    if (!user) return false;

    try {
      setError(null);
      const { error: supabaseError } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (supabaseError) {
        const appError = ErrorHandler.handle(supabaseError, { userId: user.id });
        setError(ErrorHandler.getDisplayMessage(appError));
        logger.error('Error deleting property', { userId: user.id, propertyId: id, error: supabaseError });
        return false;
      }

      setProperties(prev => prev.filter(property => property.id !== id));
      logger.info('Property deleted successfully', { propertyId: id });
      return true;
    } catch (err) {
      const appError = ErrorHandler.handle(err, { userId: user.id });
      setError(ErrorHandler.getDisplayMessage(appError));
      logger.error('Unexpected error deleting property', { userId: user.id, propertyId: id, error: err });
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
