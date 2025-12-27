// src/lib/react-query.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
    },
  },
});

// Query Keys - Centralized for consistency
export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'],
  },
  
  // Users
  users: {
    all: ['users'],
    list: (filters) => ['users', 'list', filters],
    detail: (id) => ['users', 'detail', id],
    workers: ['users', 'workers'],
  },
  
  // Clients
  clients: {
    all: ['clients'],
    list: (filters) => ['clients', 'list', filters],
    detail: (id) => ['clients', 'detail', id],
    tasks: (id) => ['clients', id, 'tasks'],
  },
  
  // Sites
  sites: {
    all: ['sites'],
    list: (filters) => ['sites', 'list', filters],
    detail: (id) => ['sites', 'detail', id],
  },
  
  // Tasks
  tasks: {
    all: ['tasks'],
    list: (filters) => ['tasks', 'list', filters],
    detail: (id) => ['tasks', 'detail', id],
    worker: (workerId) => ['tasks', 'worker', workerId],
  },
  
  // Inventory
  inventory: {
    all: ['inventory'],
    list: (filters) => ['inventory', 'list', filters],
    detail: (id) => ['inventory', 'detail', id],
    lowStock: ['inventory', 'low-stock'],
  },
  
  // Reports
  reports: {
    dashboard: (params) => ['reports', 'dashboard', params],
    weekly: ['reports', 'weekly'],
    monthly: ['reports', 'monthly'],
    workerPerformance: (params) => ['reports', 'workers', params],
  },
  
  // Notifications
  notifications: {
    list: (params) => ['notifications', params],
  },
  
  // Invoices
  invoices: {
    all: ['invoices'],
    list: (filters) => ['invoices', 'list', filters],
    detail: (id) => ['invoices', 'detail', id],
  },
  
  // Plants
  plants: {
    all: ['plants'],
    list: (filters) => ['plants', 'list', filters],
    detail: (id) => ['plants', 'detail', id],
    categories: ['plants', 'categories'],
  },
};