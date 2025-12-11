// src/hooks/useWorkers.js

import { useState, useEffect } from "react";
import { usersAPI } from "../services/api";

const useWorkers = () => {
  const [allWorkers, setAllWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllWorkers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await usersAPI.getUsers({ role: "worker" });
        setAllWorkers(response.data.data || []);
      } catch (err) {
        console.error("Error fetching all workers:", err);
        setError("Failed to load workers");
        setAllWorkers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllWorkers();
  }, []);

  const refetch = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getUsers({ role: "worker" });
      setAllWorkers(response.data.data || []);
    } catch (err) {
      setError("Failed to refresh workers", err);
    } finally {
      setLoading(false);
    }
  };

  return { allWorkers, loading, error, refetch };
};

export default useWorkers;
