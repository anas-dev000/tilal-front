// src/hooks/queries/useSites.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteImageAPI, sitesAPI } from '../../services/api';
import { queryKeys } from '../../lib/react-query';
import { toast } from 'sonner';

export const useSites = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.sites.list(filters),
    queryFn: () => sitesAPI.getAllSites(filters).then(res => res.data.data),
    select: (data) => data || [],
  });
};

export const useSite = (id) => {
  return useQuery({
    queryKey: queryKeys.sites.detail(id),
    queryFn: () => sitesAPI.getSite(id).then(res => res.data.data),
    enabled: !!id,
  });
};

export const useCreateSite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => sitesAPI.createSite(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.all });
      toast.success('Site created successfully');
    },
  });
};

export const useUpdateSite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => sitesAPI.updateSite(id, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.detail(variables.id) });
      toast.success('Site updated successfully');
    },
  });
};


export const useDeleteSite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => sitesAPI.deleteSite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.all });
      toast.success('Site deleted successfully');
    },
  });
};

export const useUpdateReferenceImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ siteId, sectionId, imageId, data }) =>
      sitesAPI.updateReferenceImage(siteId, sectionId, imageId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.detail(variables.siteId) });
    },
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ siteId, formData }) =>
      sitesAPI.addSection(siteId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sites.detail(variables.siteId),
      });
      toast.success("Section created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create section");
    },
  });
};


export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, siteId, formData }) =>
      sitesAPI.updateSection(siteId, id, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sites.detail(variables.siteId),
      });
      toast.success("Section updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update section");
    },
  });
};


export const useDeleteSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ siteId, sectionId }) =>
      sitesAPI.deleteSection(siteId, sectionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sites.detail(variables.siteId),
      });
      toast.success("Section deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete section");
    },
  });
};


// Add this to the end of useSites.js
export const useDeleteReferenceImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entityType, entityId, sectionId, imageId, cloudinaryId, resourceType, imageType }) =>
      deleteImageAPI.deleteImage({
        entityType,
        entityId,
        sectionId,
        imageId,
        cloudinaryId,
        resourceType,
        imageType,
      }),
    onSuccess: (_, variables) => {
      // Invalidate the site detail (since section belongs to site)
      queryClient.invalidateQueries({
        queryKey: queryKeys.sites.detail(variables.entityId),
        
      });
      toast.success("Reference media deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete reference media"
      );
    },
  });
};