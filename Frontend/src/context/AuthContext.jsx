// Frontend/src/context/AuthContext.jsx
import { createContext, useState, useCallback } from 'react';
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

function buildLocalUser(overrides = {}) {
  return normalizeUser({
    id: `user-${Date.now()}`,
    email: 'citizen@civic.local',
    role: 'CITIZEN',
    ...overrides,
  });
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

  const persistUser = (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem('civic_user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('civic_user');
    }
  };

  const handleLogout = useCallback(() => {
    persistUser(null);
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const result = {
        user: buildLocalUser({
          email: credentials?.email || 'citizen@civic.local',
          full_name: credentials?.name || 'Citizen User',
        }),
      };
      persistUser(result.user);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload) => {
    setIsLoading(true);
    try {
      const result = {
        user: buildLocalUser({
          email: payload?.email || 'citizen@civic.local',
          full_name: payload?.full_name || payload?.name || 'Citizen User',
        }),
      };
      persistUser(result.user);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credential, demoUserId = null, mode = 'register', invitationToken = null) => {
    setIsLoading(true);
    try {
      const demo = demoUserId
        ? DEMO_ACCOUNTS.find((a) => a.id === demoUserId || a.userId === demoUserId)
        : null;
      const result = {
        user: buildLocalUser(demo || {}),
      };
      persistUser(result.user);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvitation = async (payload) => {
    setIsLoading(true);
    try {
      const result = {
        user: buildLocalUser({
          email: payload?.email || 'invited@civic.local',
          full_name: payload?.full_name || payload?.name || 'Invited User',
        }),
      };
      persistUser(result.user);
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

    const result = { user: buildLocalUser(account) };
    persistUser(result.user);
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