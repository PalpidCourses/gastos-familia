import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario desde localStorage al iniciar
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      const userData = JSON.parse(storedUser);
      // Extraer idioma del token JWT
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userData.preferredLanguage = payload.preferredLanguage || null;
        setUser(userData);
      } catch (e) {
        setUser(userData);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, tenantSlug) => {
    try {
      const response = await authAPI.login(email, password, tenantSlug);
      const { user: userData, token, tenant } = response.data;
      
      // Extraer preferredLanguage del token
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userData.preferredLanguage = payload.preferredLanguage || null;
        } catch (e) {}
      }
      
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Error al iniciar sesión';
      return { success: false, error: message };
    }
  };

  const register = async (email, password, tenantId) => {
    try {
      const response = await authAPI.register(email, password, tenantId);
      const { user: userData, token } = response.data;
      
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Error al registrar';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateLanguage = async (language) => {
    try {
      await authAPI.updateLanguage(language);
      // Actualizar idioma en el usuario actual
      setUser(prev => ({ ...prev, preferredLanguage: language }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Error al actualizar idioma';
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateLanguage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
