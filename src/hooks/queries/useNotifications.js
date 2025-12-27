// src/hooks/queries/useNotifications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '../../services/api';
import { queryKeys } from '../../lib/react-query';
import { toast } from 'sonner';

// Get all notifications with filters
export const useNotifications = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationsAPI.getNotifications(params).then(res => res.data.data),
    select: (data) => data || [],
    refetchInterval: 30000, // Auto-refetch every 30 seconds
    refetchOnWindowFocus: true,
  });
};

// Mark notification as read mutation
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => notificationsAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    },
    onError: (error) => {
      console.error('Failed to mark as read:', error);
    },
  });
};

// Mark all notifications as read mutation
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark all as read');
    },
  });
};

// Delete notification mutation
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => notificationsAPI.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      toast.success('Notification deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete notification');
    },
  });
};