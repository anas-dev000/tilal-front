// src/hooks/queries/useTasks.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../../services/api';
import { queryKeys } from '../../lib/react-query';
import { toast } from 'sonner';

// Get all tasks with filters
export const useTasks = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.tasks.list(filters),
    queryFn: () => tasksAPI.getTasks(filters).then(res => res.data.data),
    select: (data) => data || [],
  });
};

// Get single task
export const useTask = (id) => {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => tasksAPI.getTask(id).then(res => res.data.data),
    enabled: !!id,
  });
};

// Create task mutation
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => tasksAPI.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      toast.success('Task created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create task');
    },
  });
};

// Update task mutation
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => tasksAPI.updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.id) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update task');
    },
  });
};

// Start task mutation
export const useStartTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => tasksAPI.startTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.id) });
      toast.success('Task started successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to start task');
    },
  });
};

// Complete task mutation
export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => tasksAPI.completeTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.id) });
      toast.success('Task completed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete task');
    },
  });
};

// Upload task images mutation
export const useUploadTaskImages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, formData }) => tasksAPI.uploadTaskImages(id, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.id) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload images');
    },
  });
};

// Submit feedback mutation
export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, formData }) => tasksAPI.submitFeedback(id, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      toast.success('Feedback submitted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    },
  });
};

// Mark task as satisfied mutation
export const useMarkSatisfied = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => tasksAPI.markSatisfied(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      toast.success('Task marked as satisfied');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark as satisfied');
    },
  });
};