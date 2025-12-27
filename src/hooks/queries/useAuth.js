// src/hooks/queries/useAuth.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../../services/api';
import { queryKeys } from '../../lib/react-query';
import { toast } from 'sonner';

// Get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authAPI.getCurrentUser().then(res => res.data.data),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onError: () => {
      // If fetching current user fails, clear auth
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials) => authAPI.login(credentials),
    onSuccess: (response) => {
      const token = response.data.token;
      const user = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set the user in cache
      queryClient.setQueryData(queryKeys.auth.me, user);
      
      toast.success('Login successful');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      toast.success('Logged out successfully');
    },
    onError: (error) => {
      // Even if API call fails, clear local data
      queryClient.clear();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      console.error('Logout error:', error);
      toast.info('Logged out');
    },
  });
};