
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface JobImage {
  id: string;
  booking_id: string;
  image_type: 'before' | 'after';
  image_url: string;
  uploaded_by: string;
  created_at: string;
}

export const useJobImages = (bookingId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [images, setImages] = useState<JobImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    if (!bookingId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_images')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedImages = (data || []).map(img => ({
        ...img,
        image_type: img.image_type as 'before' | 'after'
      }));
      
      setImages(typedImages);
    } catch (err) {
      console.error('Error fetching job images:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File, imageType: 'before' | 'after') => {
    if (!user || !bookingId) return null;

    try {
      setUploading(true);
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${bookingId}/${imageType}/${Date.now()}.${fileExt}`;
      
      // For now, we'll simulate the upload and store a placeholder URL
      // In a real implementation, you would upload to Supabase Storage
      const placeholderUrl = `https://placeholder.co/400x300/e2e8f0/64748b?text=${imageType}+image`;
      
      const { data, error } = await supabase
        .from('job_images')
        .insert([{
          booking_id: bookingId,
          image_type: imageType,
          image_url: placeholderUrl,
          uploaded_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Bilde lastet opp',
        description: `${imageType === 'before' ? 'Før' : 'Etter'}-bilde ble lastet opp.`,
      });

      await fetchImages();
      return data;
    } catch (err) {
      console.error('Error uploading image:', err);
      toast({
        title: 'Feil',
        description: 'Kunne ikke laste opp bildet.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('job_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: 'Bilde slettet',
        description: 'Bildet ble slettet.',
      });

      await fetchImages();
    } catch (err) {
      console.error('Error deleting image:', err);
      toast({
        title: 'Feil',
        description: 'Kunne ikke slette bildet.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchImages();
  }, [bookingId]);

  return {
    images,
    loading,
    uploading,
    uploadImage,
    deleteImage,
    refetch: fetchImages
  };
};
