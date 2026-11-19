// Frontend/src/context/AuthContext.jsx
import { createContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { DEMO_ACCOUNTS } from '../utils/constants';

export const AuthContext = createContext(null);

function normalizeUser(raw) {
  if (!raw) return null;
  return {
    ...raw,
    full_name: raw.full_name || raw.name || 'Citizen User',
    avatar_url: raw.avatar_url || raw.avatar || raw.picture || null,
    ward_id: raw.ward_id || 'ward-43-thoothukudi',
    ward_name: raw.ward_name || 'Millerpuram - Ward 43',
    district_id: raw.district_id || 'dist-thoothukudi',
    district_name: raw.district_name || 'Thoothukudi',
    is_ward_verified: raw.is_ward_verified !== undefined ? raw.is_ward_verified : true,
    ward_verification_status: raw.ward_verification_status || 'APPROVED',
    approval_status: raw.approval_status || 'APPROVED',
    registration_status: raw.registration_status || 'COMPLETED',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('civic_user');
      return cached ? normalizeUser(JSON.parse(cached)) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      setUser(result.user);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload) => {
    setIsLoading(true);
    try {
      const result = await authService.register(payload);
      setUser(result.user);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credential, demoUserId = null, mode = 'register', invitationToken = null) => {
    setIsLoading(true);
    try {
      const result = await authService.loginWithGoogle(credential, demoUserId, mode, invitationToken);
      if (result?.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvitation = async (payload) => {
    setIsLoading(true);
    try {
      const result = await authService.acceptInvitation(payload);
      setUser(result.user);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoAccount = useCallback(async (accountOrId) => {
    const targetId =
      typeof accountOrId === 'object' && accountOrId !== null
        ? accountOrId.id || accountOrId.userId
        : accountOrId;

    const account = DEMO_ACCOUNTS.find((a) => a.id === targetId || a.userId === targetId);
    if (!account) return null;

    const result = await authService.switchDemoAccount(account.id);
    if (result?.user) {
      setUser(result.user);
    }
    return result;
  }, []);

  const updateUser = (updatedData) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = normalizeUser({ ...prev, ...updatedData });
      localStorage.setItem('civic_user', JSON.stringify(next));
      return next;
    });
  };

  const value = {
    user,
    accessToken: null,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    loginWithGoogle,
    acceptInvitation,
    logout: handleLogout,
    updateUser,
    switchDemoAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
