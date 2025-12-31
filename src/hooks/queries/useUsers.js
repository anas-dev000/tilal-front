// src/hooks/queries/useUsers.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../../services/api';
import { queryKeys } from '../../lib/react-query';
import { toast } from 'sonner';

// Get all users with filters
export const useUsers = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersAPI.getUsers(filters).then(res => res.data),
  });
};

// Get single user
export const useUser = (id) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersAPI.getUser(id).then(res => res.data.data),
    enabled: !!id,
  });
};

// Get workers only
export const useWorkers = (filters = {}) => {
  return useQuery({
    queryKey: [...queryKeys.users.workers, filters],
    queryFn: () => usersAPI.getWorkers(filters).then(res => res.data),
  });
};

// Get employees (workers + accountants)
export const useEmployees = (filters = {}) => {
  return useQuery({
    queryKey: ['users', 'employees', filters],
    queryFn: async () => {
      // Fetch all users
      const response = await usersAPI.getUsers(filters);
      const allUsers = response.data.data || [];
      const total = response.data.total || 0;
      const totalPages = response.data.totalPages || 0;

      // Filter for workers and accountants client-side if API doesn't support multiple roles
      // Also strictly exclude 'admin' role as requested
      const filteredUsers = allUsers.filter(user => user.role !== 'admin');
      
      return { 
        data: filteredUsers, 
        total: filteredUsers.length, // Update total count to reflect filtered list
        totalPages: Math.ceil(filteredUsers.length / (filters.limit || 10)) 
      };
    },
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => usersAPI.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success('User created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => usersAPI.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => usersAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });
};

// Toggle user status mutation
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => usersAPI.toggleUserStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      toast.success('User status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
};
