// src/hooks/queries/useReports.js
import { useQuery } from "@tanstack/react-query";
import { reportsAPI } from "../../services/api";
import { queryKeys } from "../../lib/react-query";

export const useDashboardStats = (params = {}) => {
  return useQuery({
    queryKey: [...queryKeys.reports.dashboard(), params],
    queryFn: () => reportsAPI.getDashboardStats(params).then((res) => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useWorkerPerformance = (params = {}) => {
  return useQuery({
    queryKey: ['reports', 'workers', params],
    queryFn: () => reportsAPI.getWorkerPerformance(params).then((res) => res.data),
  });
};