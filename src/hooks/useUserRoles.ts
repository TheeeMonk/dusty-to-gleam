
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'customer' | 'employee' | 'admin';

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export const useUserRoles = () => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRoles = async () => {
    if (!user) {
      setUserRoles([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const roles = (data || []).map(item => item.role as UserRole);
      setUserRoles(roles);
    } catch (err) {
      console.error('Error fetching user roles:', err);
      setError(err instanceof Error ? err.message : 'En feil oppstod');
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  const isEmployee = (): boolean => {
    return hasRole('employee') || hasRole('admin');
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const addRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role: role
        }]);

      if (error) throw error;
      
      // Refetch user roles if it's for the current user
      if (userId === user?.id) {
        await fetchUserRoles();
      }
    } catch (err) {
      console.error('Error adding role:', err);
      throw err;
    }
  };

  const removeRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
      
      // Refetch user roles if it's for the current user
      if (userId === user?.id) {
        await fetchUserRoles();
      }
    } catch (err) {
      console.error('Error removing role:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, [user]);

  return {
    userRoles,
    loading,
    error,
    hasRole,
    isEmployee,
    isAdmin,
    addRole,
    removeRole,
    refetch: fetchUserRoles
  };
};
