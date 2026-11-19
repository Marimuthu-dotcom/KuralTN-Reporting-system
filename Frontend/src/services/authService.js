// Frontend/src/services/authService.js
import { DEMO_ACCOUNTS } from '../utils/constants.js';

const STORAGE_USER_KEY = 'civic_user';
const STORAGE_REGISTERED_KEY = 'civic_registered_users';

function resolveRedirectPath(role) {
  switch (role) {
    case 'WARD_COUNCILLOR':
      return '/councillor';
    case 'ADMIN':
      return '/admin';
    case 'DEPARTMENT_HANDLER':
      return '/councillor/assignments';
    case 'ACCOUNTABILITY_REVIEWER':
      return '/reviewer';
    default:
      return '/dashboard';
  }
}

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

function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_REGISTERED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(list) {
  localStorage.setItem(STORAGE_REGISTERED_KEY, JSON.stringify(list));
}

function decodeJwtPayload(credential) {
  try {
    const parts = credential.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const authService = {
  async register({ full_name, email, username }) {
    const users = getRegisteredUsers();
    const existing = [...DEMO_ACCOUNTS, ...users].find(
      (u) => u.email?.toLowerCase() === email?.toLowerCase()
    );
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = normalizeUser({
      id: `user-${Date.now()}`,
      userId: `user-${Date.now()}`,
      full_name,
      name: full_name,
      email,
      username: username || email.split('@')[0],
      role: 'CITIZEN',
    });

    saveRegisteredUsers([...users, newUser]);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser));
    return {
      user: newUser,
      authStatus: 'AUTHENTICATED',
      redirectTo: resolveRedirectPath(newUser.role),
    };
  },

  async switchDemoAccount(userId) {
    const account = DEMO_ACCOUNTS.find((a) => a.id === userId || a.userId === userId);
    if (!account) return null;
    const user = normalizeUser(account);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    return {
      user,
      authStatus: 'AUTHENTICATED',
      redirectTo: resolveRedirectPath(user.role),
    };
  },

  async login({ identifier }) {
    const q = (identifier || '').trim().toLowerCase();
    const allUsers = [...DEMO_ACCOUNTS, ...getRegisteredUsers()];
    const matched =
      allUsers.find(
        (u) =>
          u.email?.toLowerCase() === q ||
          u.username?.toLowerCase() === q ||
          u.id?.toLowerCase() === q
      ) ||
      normalizeUser({
        id: `user-citizen-${Date.now()}`,
        full_name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
        email: identifier.includes('@') ? identifier : `${identifier}@civicmail.in`,
        role: 'CITIZEN',
      });

    const user = normalizeUser(matched);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    return {
      user,
      authStatus: 'AUTHENTICATED',
      redirectTo: resolveRedirectPath(user.role),
    };
  },

  async loginWithGoogle(credential, demoUserId = null) {
    if (demoUserId) {
      return this.switchDemoAccount(demoUserId);
    }

    const payload = credential ? decodeJwtPayload(credential) : null;
    const allUsers = [...DEMO_ACCOUNTS, ...getRegisteredUsers()];
    const matched = payload?.email
      ? allUsers.find((u) => u.email?.toLowerCase() === payload.email.toLowerCase())
      : null;

    const user = normalizeUser(
      matched || {
        id: `user-google-${Date.now()}`,
        full_name: payload?.name || 'Google Citizen',
        email: payload?.email || 'citizen@civicmail.in',
        avatar_url: payload?.picture || null,
        role: 'CITIZEN',
      }
    );

    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    return {
      user,
      authStatus: 'AUTHENTICATED',
      redirectTo: resolveRedirectPath(user.role),
    };
  },

  async getInvitation(token) {
    return {
      token,
      full_name: 'K. Sundaram',
      email: 'sundaram.ward43@thoothukudi.gov.in',
      role: 'WARD_COUNCILLOR',
      ward_number: 43,
      ward_id: 'ward-43-thoothukudi',
      district_id: 'Thoothukudi',
      department_name: 'Municipal Works',
      designation: 'Ward Representative',
    };
  },

  async acceptInvitation({ token, full_name, username }) {
    const inv = await this.getInvitation(token);
    const user = normalizeUser({
      id: `user-inv-${Date.now()}`,
      full_name: full_name || inv.full_name,
      username: username || 'official_member',
      email: inv.email,
      role: inv.role,
      ward_id: inv.ward_id,
    });
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    return {
      user,
      redirectTo: resolveRedirectPath(user.role),
    };
  },

  async logout() {
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem('civic_access_token');
    localStorage.removeItem('civic_refresh_token');
  },

  async getAccounts() {
    return DEMO_ACCOUNTS.map(normalizeUser);
  },

  async getMe() {
    try {
      const raw = localStorage.getItem(STORAGE_USER_KEY);
      return raw ? normalizeUser(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },
};
