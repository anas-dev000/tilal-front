import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);

        //  Ensure role is set (for backward compatibility)
        if (!parsedUser.role) {
          // If no role, try to infer from other fields
          if (parsedUser.username && !parsedUser.email?.includes("@")) {
            parsedUser.role = "client";
          } else {
            parsedUser.role = "worker"; // Default fallback
          }
        }

        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  /**
   *  UNIFIED LOGIN: Works for Admin, Worker, AND Client
   */
  const login = async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);

      if (response.data.success) {
        const { token, user: userData } = response.data.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, user: userData };
      } else {
        return {
          success: false,
          error: response.data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Invalid email or password",
      };
    }
  };

  /**
   *  NEW: Client Login (uses same token system)
   */
  const clientLogin = async (credentials) => {
    try {
      const response = await api.post("/clients/login", credentials);

      if (response.data.success) {
        const { token, user, client, isPasswordTemporary } = response.data.data;

        //  Use 'user' object if provided, otherwise construct from 'client'
        const userData = user || { ...client, role: "client" };

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        return {
          success: true,
          user: userData,
          isPasswordTemporary,
        };
      } else {
        return {
          success: false,
          error: response.data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Client login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Invalid credentials",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    clientLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
