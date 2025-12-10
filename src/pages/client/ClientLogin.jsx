// frontend/src/pages/client/ClientLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flower2 } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { clientsAPI } from '../../services/api';

const ClientLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ 
    email: '',  // Changed from username to email
    password: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    // ✅ استخدام API الصحيح
    const response = await clientsAPI.clientLogin({
      email: credentials.email,
      password: credentials.password
    });
    
    if (response.data.success) {
      const { token, client, isPasswordTemporary } = response.data.data;
      
      // Store token and client data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ ...client, role: 'client' }));
      
      // Redirect
      if (isPasswordTemporary) {
        navigate('/client/change-password');
      } else {
        navigate('/client/dashboard');
      }
    }
  } catch (err) {
    console.error('Login error:', err);
    setError(err.response?.data?.message || 'Invalid email or password');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Flower2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('client.title')}
          </h1>
          <p className="text-gray-600">
            Access your garden service portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            placeholder="Enter your email"
            required
          />
          
          <Input
            label={t('auth.password')}
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            placeholder="Enter your password"
            required
          />

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('common.loading') : t('common.login')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Contact administrator for assistance</p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <a 
            href="/login" 
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Staff Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;