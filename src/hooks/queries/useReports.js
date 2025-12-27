// src/hooks/queries/useReports.js
import { useQuery } from "@tanstack/react-query";
import { reportsAPI } from "../../services/api";
import { queryKeys } from "../../lib/react-query";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.reports.dashboard(),
    queryFn: () => reportsAPI.getDashboardStats().then((res) => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};