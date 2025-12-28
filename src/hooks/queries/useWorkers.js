// src/hooks/useWorkers.js - REFACTORED WITH REACT QUERY
import { useUsers } from "./queries/useUsers";

const useWorkers = () => {
  const {
    data: allWorkers = [],
    isLoading: loading,
    error,
    refetch,
  } = useUsers({ role: "worker" });

  return {
    allWorkers,
    loading,
    error: error ? "Failed to load workers" : null,
    refetch,
  };
};

export default useWorkers;
