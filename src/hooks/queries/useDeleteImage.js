/* eslint-disable no-unused-vars */
// src/hooks/queries/useDeleteImage.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteImageAPI } from '../../services/api';
import { queryKeys } from '../../lib/react-query';
import { toast } from 'sonner';

/**
 * Universal image deletion hook
 * Handles images from sites, sections, tasks, and feedback
 */
export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params) => deleteImageAPI.deleteImage(params),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries based on entity type
      const { entityType, entityId, sectionId } = variables;
      
      if (entityType === 'site') {
        queryClient.invalidateQueries({ queryKey: queryKeys.sites.detail(entityId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.sites.all });
      } else if (entityType === 'section') {
        queryClient.invalidateQueries({ queryKey: queryKeys.sites.detail(entityId) });
      } else if (entityType === 'task') {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(entityId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      } else if (entityType === 'feedback') {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(entityId) });
      }
      
      toast.success('Image deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete image');
    },
  });
};