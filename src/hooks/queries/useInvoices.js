// src/hooks/queries/useInvoices.js - ACCOUNTANT ONLY
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountantAPI, invoicesAPI } from '../../services/api';
import { queryKeys } from '../../lib/react-query';
import { toast } from 'sonner';

// ... (existing code until usage of useAccountantSite) ...
// (I need to be careful with range)

// I will target the top for import and the bottom for restoration.

// Get all invoices with filters
export const useInvoices = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.invoices.list(filters),
    queryFn: () => accountantAPI.getInvoices(filters).then(res => res.data),
  });
};

// Get single invoice
export const useInvoice = (id) => {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id),
    queryFn: () => accountantAPI.getInvoice(id).then(res => res.data.data),
    enabled: !!id,
  });
};

// Create invoice mutation
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => accountantAPI.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      toast.success('Invoice created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    },
  });
};

// Update invoice mutation
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => accountantAPI.updateInvoice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.id) });
      toast.success('Invoice updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update invoice');
    },
  });
};

// Delete invoice mutation
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => accountantAPI.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      toast.success('Invoice deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete invoice');
    },
  });
};

// Get invoice statistics (for dashboard)
export const useInvoiceStats = () => {
  return useQuery({
    queryKey: ['invoices', 'stats'],
    queryFn: () => accountantAPI.getInvoiceStats().then(res => res.data.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get payment alerts (upcoming and overdue)
export const usePaymentAlerts = () => {
  return useQuery({
    queryKey: ['invoices', 'payment-alerts'],
    queryFn: () => accountantAPI.getPaymentAlerts().then(res => res.data.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// --- Dedicated Accountant Lookup Hooks (Avoid 403s) ---

// Get all sites (Accountant view)
export const useAccountantSites = (filters = {}) => {
  return useQuery({
    queryKey: ['accountant', 'sites', filters],
    queryFn: () => accountantAPI.getSites(filters).then(res => res.data),
  });
};

// Update site mutation (Accountant)
export const useAccountantUpdateSite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => accountantAPI.updateSite(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accountant', 'sites'] });
      queryClient.invalidateQueries({ queryKey: ['accountant', 'site', variables.id] });
      toast.success('Site updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update site');
    },
  });
};

// Get single site (Accountant view)
export const useAccountantSite = (id) => {
  return useQuery({
    queryKey: ['accountant', 'site', id],
    queryFn: () => accountantAPI.getSite(id).then(res => res.data),
    enabled: !!id,
  });
};

// Get all clients (Accountant view)
export const useAccountantClients = (filters = {}) => {
  return useQuery({
    queryKey: ['accountant', 'clients', filters],
    queryFn: () => accountantAPI.getClients(filters).then(res => res.data),
  });
};

// --- Admin Hooks ---

// Get all invoices (Admin view)
export const useAdminInvoices = (filters = {}) => {
  return useQuery({
    queryKey: ['admin', 'invoices', filters],
    queryFn: () => invoicesAPI.getInvoices(filters).then(res => res.data),
  });
};

// Update invoice mutation (Admin)
export const useAdminUpdateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => invoicesAPI.updateInvoice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.id) });
      toast.success('Invoice updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update invoice');
    },
  });
};
