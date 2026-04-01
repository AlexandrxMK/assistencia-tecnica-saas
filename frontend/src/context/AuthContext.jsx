import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStoredSession, getStoredSession, saveStoredSession } from '../lib/authStorage';
import { extractApiError } from '../lib/api';
import { backendApi } from '../services/backendApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getStoredSession());
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    async function hydrateUser() {
      if (!session?.token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const response = await backendApi.auth.me();
        const nextSession = {
          token: session.token,
          user: response.data
        };

        setSession(nextSession);
        saveStoredSession(nextSession);
      } catch (error) {
        setAuthError(extractApiError(error));
        clearStoredSession();
        setSession(null);
      } finally {
        setIsBootstrapping(false);
      }
    }

    hydrateUser();
  }, []);

  const value = useMemo(() => {
    async function login(credentials) {
      const response = await backendApi.auth.login(credentials);
      const nextSession = {
        token: response.data.token,
        user: response.data.user
      };

      setSession(nextSession);
      saveStoredSession(nextSession);
      setAuthError('');
      navigate('/dashboard', { replace: true });
    }

    async function bootstrapAdmin(payload) {
      await backendApi.auth.bootstrap(payload);
    }

    function logout() {
      clearStoredSession();
      setSession(null);
      navigate('/login', { replace: true });
    }

    return {
      authError,
      bootstrapAdmin,
      isAuthenticated: Boolean(session?.token),
      isBootstrapping,
      login,
      logout,
      token: session?.token ?? null,
      user: session?.user ?? null
    };
  }, [authError, navigate, session, isBootstrapping]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider');
  }

  return context;
}
