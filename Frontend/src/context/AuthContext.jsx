// Frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { setTokenRefreshFailedCallback } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('civic_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessTokenState] = useState(() => {
    return localStorage.getItem('civic_access_token') || null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setAccessTokenState(null);
    }
  }, []);

  // Handle token refresh failure from axios interceptor
  useEffect(() => {
    setTokenRefreshFailedCallback(() => {
      localStorage.removeItem('civic_refresh_token');
      localStorage.removeItem('civic_access_token');
      localStorage.removeItem('civic_user');
      setUser(null);
      setAccessTokenState(null);
    });
  }, []);

  // On mount, try silent refresh from stored refresh token or HTTP-only cookie
  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      const storedRefreshToken = localStorage.getItem('civic_refresh_token');
      if (!storedRefreshToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const { user: refreshedUser, accessToken: newAccessToken } =
          await authService.refreshToken(storedRefreshToken);
        if (isMounted) {
          setUser(refreshedUser);
          setAccessTokenState(newAccessToken);
        }
      } catch (err) {
        // Clear stale credentials if refresh token was invalid/expired
        localStorage.removeItem('civic_refresh_token');
        localStorage.removeItem('civic_access_token');
        localStorage.removeItem('civic_user');
        if (isMounted) {
          setUser(null);
          setAccessTokenState(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const loginWithGoogle = async (credential, demoUserId = null) => {
    setIsLoading(true);
    try {
      const result = await authService.loginWithGoogle(
        credential,
        demoUserId
      );
      setUser(result.user);
      setAccessTokenState(result.accessToken);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  const value = {
    user,
    accessToken,
    isAuthenticated: !!user,
    isLoading,
    loginWithGoogle,
    logout: handleLogout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
