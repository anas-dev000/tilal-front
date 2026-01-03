// src/pages/worker/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { Flower2, Lock, Mail } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";

const Login = () => {
  const { t } = useTranslation();
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user.role === "accountant") {
        navigate("/accountant", { replace: true });
      } else if (user.role === "worker") {
        navigate("/worker", { replace: true });
      } else if (user.role === "client") {
        navigate("/client/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(credentials, rememberMe);
      if (result.success) {
        const { user } = result;
        // Route based on role
        if (user.role === "admin") {
          navigate("/admin");
        } else if (user.role === "accountant") {
          navigate("/accountant");
        } else if (user.role === "worker") {
          navigate("/worker");
        } else {
          setError("Access Denied: Not a staff account");
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-200 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg mx-auto ring-4 ring-primary-50">
            <img src="/logo.png" alt="KTC" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Kingdom Telal Company
          </h1>
          <p className="text-gray-500 text-sm">Staff Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                placeholder={t("auth.email")} // "Enter your email"
                required
                autoComplete="email"
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                placeholder={t("auth.password")}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-600">
                {t("auth.rememberMe")}
              </span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full py-2.5 text-base font-semibold shadow-md hover:shadow-lg transition-all" disabled={loading}>
            {loading ? t("common.loading") : t("common.login")}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
                <Link to="/" className="font-medium text-primary-600 hover:text-primary-500">
                    Go to Home Page
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
