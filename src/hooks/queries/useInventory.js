// src/hooks/queries/useInventory.js - COMPLETE VERSION
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryAPI } from '../../services/api';
import { queryKeys } from '../../lib/react-query';
import { toast } from 'sonner';

export const useInventory = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.inventory.list(filters),
    queryFn: () => inventoryAPI.getInventory(filters).then(res => res.data.data),
    select: (data) => data || [],
  });
};

export const useInventoryItem = (id) => {
  return useQuery({
    queryKey: queryKeys.inventory.detail(id),
    queryFn: () => inventoryAPI.getInventoryItem(id).then(res => res.data.data),
    enabled: !!id,
  });
};

export const useLowStockItems = () => {
  return useQuery({
    queryKey: queryKeys.inventory.lowStock,
    queryFn: () =>
      inventoryAPI.getInventory().then((res) => {
        const items = res.data?.data || [];
        return items.filter(
          (item) => item.quantity?.current < item.quantity?.minimum
        );
      }),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => inventoryAPI.createInventoryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      toast.success('Inventory item created');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create item');
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => inventoryAPI.updateInventoryItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.detail(variables.id) });
      toast.success('Inventory updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update item');
    },
  });
};

// DELETE was missing
export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => inventoryAPI.deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      toast.success('Inventory item deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    },
  });
};

// WITHDRAW was missing
export const useWithdrawInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => inventoryAPI.withdrawInventory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.lowStock });
      toast.success('Inventory withdrawn');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to withdraw inventory');
    },
  });
};

// RESTOCK was missing
export const useRestockInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => inventoryAPI.restockInventory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.lowStock });
      toast.success('Inventory restocked');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to restock inventory');
    },
  });
};