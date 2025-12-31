// src/hooks/queries/useClients.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsAPI } from '../../services/api';
import { queryKeys } from '../../lib/react-query';
import { toast } from 'sonner';

// Get all clients with filters
export const useClients = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.clients.list(filters),
    queryFn: () => clientsAPI.getClients(filters).then(res => res.data),
  });
};

// Get single client
export const useClient = (id) => {
  return useQuery({
    queryKey: queryKeys.clients.detail(id),
    queryFn: () => clientsAPI.getClient(id).then(res => res.data.data),
    enabled: !!id,
  });
};

// Get client tasks
export const useClientTasks = (id, filters = {}) => {
  return useQuery({
    queryKey: queryKeys.clients.tasks(id, filters),
    queryFn: () => clientsAPI.getClientTasks(id, filters).then(res => res.data),
    enabled: !!id,
  });
};

// Client login mutation
export const useClientLogin = () => {
  return useMutation({
    mutationFn: (credentials) => clientsAPI.clientLogin(credentials),
    onSuccess: (response) => {
      const token = response.data.token;
      const client = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(client));
      toast.success('Login successful');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

// Create client mutation
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => clientsAPI.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      toast.success('Client created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create client');
    },
  });
};

// Update client mutation
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => clientsAPI.updateClient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(variables.id) });
      toast.success('Client updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update client');
    },
  });
};

// Delete client mutation
export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => clientsAPI.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      toast.success('Client deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete client');
    },
  });
};

// Toggle client status mutation
export const useToggleClientStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => clientsAPI.toggleClientStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(id) });
      toast.success('Client status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
};