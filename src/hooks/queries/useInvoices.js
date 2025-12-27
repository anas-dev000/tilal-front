// src/hooks/queries/useInvoices.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesAPI } from '../../services/api';
import { queryKeys } from '../../lib/react-query';
import { toast } from 'sonner';

// Get all invoices with filters
export const useInvoices = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.invoices.list(filters),
    queryFn: () => invoicesAPI.getInvoices(filters).then(res => res.data.data),
    select: (data) => data || [],
  });
};

// Get single invoice
export const useInvoice = (id) => {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id),
    queryFn: () => invoicesAPI.getInvoice(id).then(res => res.data.data),
    enabled: !!id,
  });
};

// Create invoice mutation
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => invoicesAPI.createInvoice(data),
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
    mutationFn: ({ id, data }) => invoicesAPI.updateInvoice(id, data),
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
    mutationFn: (id) => invoicesAPI.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      toast.success('Invoice deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete invoice');
    },
  });
};

// Update payment status mutation
export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => invoicesAPI.updatePaymentStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.id) });
      toast.success('Payment status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    },
  });
};

// Download invoice mutation (special case - returns blob)
export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: (id) => invoicesAPI.downloadInvoice(id),
    onSuccess: (response, id) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to download invoice');
    },
  });
};