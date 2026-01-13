import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (userId) {
      // derive socket URL from API base URL (removing /api/v1 if present)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
      const socketUrl = apiBaseUrl.replace('/api/v1', '');

      console.log('🔌 Attempting Socket connection:', { socketUrl, userId });

      // Initialize socket connection
      const newSocket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket'], // Force websocket only for debugging
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected successfully:', newSocket.id);
        // Join user specific room
        newSocket.emit('join', userId);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Listen for notifications
      newSocket.on('new_notification', (notification) => {
        console.log('Real-time notification received:', notification);
        
        // Show live toast
        toast.info(`${notification.title}: ${notification.message}`, {
            description: new Date(notification.createdAt).toLocaleTimeString(),
            action: {
                label: t('common.view'),
                onClick: () => console.log('Navigate to notification:', notification._id)
            }
        });
      });

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
