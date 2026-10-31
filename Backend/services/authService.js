// Backend/services/authService.js
import { userRepository } from '../repositories/userRepository.js';
import { verifyGoogleToken } from '../config/googleOAuth.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } from '../utils/tokenUtils.js';
import { getDB, persistDB } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export const authService = {
  async authenticateGoogle(credential, demoUserId = null) {
    let user = null;
    let authStatus = 'AUTHENTICATED';
    let redirectTo = '/dashboard';

    if (demoUserId) {
      user = userRepository.findById(demoUserId);
      if (!user) {
        throw new AppError('Specified demo user account not found', 404);
      }
      if (!user.is_active || user.approval_status === 'SUSPENDED') {
        throw new AppError('This user account has been suspended or restricted by municipal administration.', 403);
      }
      if (user.approval_status === 'REJECTED') {
        throw new AppError('This account registration was declined by the system administrator.', 403);
      }

      // Check approval status first
      if (user.approval_status === 'PENDING_APPROVAL' || user.role === 'PENDING') {
        authStatus = 'PENDING_APPROVAL';
        redirectTo = '/pending-approval';
      }
      // Check registration status for demo user
      else if (!user.address_line || !user.ward_id || user.registration_status === 'PENDING_DETAILS') {
        authStatus = 'INCOMPLETE_REGISTRATION';
        redirectTo = '/onboarding';
      } else if (user.role === 'CITIZEN' && (!user.is_ward_verified || user.ward_verification_status === 'PENDING')) {
        authStatus = 'PENDING_WARD_VERIFICATION';
        redirectTo = '/verification-pending';
      } else {
        authStatus = 'AUTHENTICATED';
        if (user.role === 'WARD_COUNCILLOR') redirectTo = '/councillor';
        else if (user.role === 'ADMIN') redirectTo = '/admin';
        else if (user.role === 'DEPARTMENT_HANDLER') redirectTo = '/councillor/assignments';
        else if (user.role === 'ACCOUNTABILITY_REVIEWER') redirectTo = '/reviewer';
        else redirectTo = '/dashboard';
      }
    } else {
      const googlePayload = await verifyGoogleToken(credential);

      // Primary Lookup: Stable Google Account Identifier (`sub`)
      user = userRepository.findByGoogleId(googlePayload.sub);

      // Fallback Lookup: Verified Google Email (links existing record to google_id)
      if (!user && googlePayload.email) {
        user = userRepository.findByEmail(googlePayload.email);
        if (user) {
          user = userRepository.update(user.id, {
            google_id: googlePayload.sub,
            avatar_url: googlePayload.picture || user.avatar_url,
          });
        }
      }

      if (!user) {
        // Step 1: User Registration
        // Every newly registered user must initially have:
        // - Account status: PENDING_APPROVAL
        // - Application access: Denied
        // - Assigned role: PENDING (unprivileged pending state)
        user = userRepository.create(
          {
            google_id: googlePayload.sub,
            email: googlePayload.email,
            full_name: googlePayload.name || '',
            avatar_url: googlePayload.picture || null,
            phone: null,
            role: 'PENDING', // Unprivileged pending state; cannot access app features until approved
            approval_status: 'PENDING_APPROVAL',
            ward_id: null,
            claimed_ward_id: null,
            verified_ward_id: null,
            registration_status: 'PENDING_APPROVAL',
            ward_verification_status: 'UNREGISTERED',
            is_active: true,
          },
          {
            address_line: null,
            pincode: null,
            is_ward_verified: false,
            ward_verification_status: 'UNREGISTERED',
          }
        );

        // Step 2: Notify the System Administrator
        // Create a persistent account-approval request
        const approvalReq = userRepository.createApprovalRequest({
          user_id: user.id,
          user_name: user.full_name,
          user_email: user.email,
          avatar_url: user.avatar_url,
          requested_role: 'CITIZEN', // Requested role only, not assigned
          status: 'PENDING',
          notes: 'New account registered via Google OAuth awaiting administrator verification and role assignment',
        });

        // Persistent notification for all System Administrators
        const db = getDB();
        const adminUsers = db.users.filter((u) => u.role === 'ADMIN');
        adminUsers.forEach((admin) => {
          db.notifications.push({
            id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            user_id: admin.id,
            title: 'New Account Approval Request',
            message: `${user.full_name} (${user.email}) registered and is awaiting administrator verification and role assignment.`,
            type: 'ACCOUNT_APPROVAL_REQUEST',
            related_entity_type: 'APPROVAL_REQUEST',
            related_entity_id: approvalReq.id,
            is_read: false,
            created_at: new Date().toISOString(),
          });
        });
        persistDB();

        authStatus = 'PENDING_APPROVAL';
        redirectTo = '/pending-approval';
      } else {
        // Account existence confirmed
        if (!user.is_active || user.approval_status === 'SUSPENDED') {
          throw new AppError('Your account has been suspended or restricted by municipal administration. Please contact the civic cell.', 403);
        }

        if (user.approval_status === 'REJECTED') {
          throw new AppError('Your account registration application was declined by the administrator.', 403);
        }

        // If approval is pending or role is PENDING, deny application access and show pending approval page
        if (user.approval_status === 'PENDING_APPROVAL' || user.role === 'PENDING') {
          authStatus = 'PENDING_APPROVAL';
          redirectTo = '/pending-approval';
        }
        // Case B: Existing account with incomplete personal information
        else if (!user.address_line || !user.ward_id || user.registration_status === 'PENDING_DETAILS') {
          authStatus = 'INCOMPLETE_REGISTRATION';
          redirectTo = '/onboarding';
        }
        // Case B (sub-case): Pending ward verification
        else if (user.role === 'CITIZEN' && (!user.is_ward_verified || user.ward_verification_status === 'PENDING')) {
          authStatus = 'PENDING_WARD_VERIFICATION';
          redirectTo = '/verification-pending';
        }
        // Case B (sub-case): Rejected ward verification
        else if (user.role === 'CITIZEN' && user.ward_verification_status === 'REJECTED') {
          authStatus = 'WARD_VERIFICATION_REJECTED';
          redirectTo = '/verification-pending';
        }
        // Case A: Existing and fully approved account
        else {
          authStatus = 'AUTHENTICATED';
          if (user.role === 'WARD_COUNCILLOR') {
            redirectTo = '/councillor';
          } else if (user.role === 'ADMIN') {
            redirectTo = '/admin';
          } else if (user.role === 'DEPARTMENT_HANDLER') {
            redirectTo = '/councillor/assignments';
          } else if (user.role === 'ACCOUNTABILITY_REVIEWER') {
            redirectTo = '/reviewer';
          } else {
            redirectTo = '/dashboard';
          }
        }
      }
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      ward_id: user.ward_id,
      is_ward_verified: Boolean(user.is_ward_verified),
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save refresh token session
    const db = getDB();
    const tokenHash = hashToken(refreshToken);
    db.refresh_tokens.push({
      id: `rt-${Date.now()}`,
      user_id: user.id,
      token_hash: tokenHash,
      family_id: `fam-${Date.now()}`,
      is_revoked: false,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    });
    persistDB();

    return { user, accessToken, refreshToken, authStatus, redirectTo };
  },

  async refreshSession(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token required', 401);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const db = getDB();
    const tokenHash = hashToken(refreshToken);
    let session = db.refresh_tokens.find((t) => t.token_hash === tokenHash && !t.is_revoked);

    // If not found active, check if this token was rotated very recently (grace window for concurrent requests)
    if (!session) {
      const recentlyRevoked = db.refresh_tokens.find(
        (t) =>
          t.token_hash === tokenHash &&
          t.is_revoked &&
          t.revoked_at &&
          Date.now() - new Date(t.revoked_at).getTime() < 60000
      );
      if (recentlyRevoked) {
        // Return latest active token for this family if already issued
        const currentActive = db.refresh_tokens.find(
          (t) => t.family_id === recentlyRevoked.family_id && !t.is_revoked
        );
        if (currentActive) {
          session = currentActive;
        }
      }
    }

    const user = userRepository.findById(decoded.userId);
    if (!user || !user.is_active || user.approval_status === 'SUSPENDED' || user.approval_status === 'REJECTED') {
      throw new AppError('User account is suspended, declined, or not found', 401);
    }

    // If session was not found in array (e.g. storage reload or fresh instance),
    // but the token is cryptographically verified and user is valid, bootstrap the session
    const familyId = session?.family_id || `fam-${Date.now()}`;
    if (session) {
      session.is_revoked = true;
      session.revoked_at = new Date().toISOString();
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      ward_id: user.ward_id,
      is_ward_verified: Boolean(user.is_ward_verified),
    };

    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    db.refresh_tokens.push({
      id: `rt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: user.id,
      token_hash: hashToken(newRefreshToken),
      family_id: familyId,
      is_revoked: false,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    });

    persistDB();
    return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async revokeSession(refreshToken) {
    if (!refreshToken) return;
    const db = getDB();
    const tokenHash = hashToken(refreshToken);
    const session = db.refresh_tokens.find((t) => t.token_hash === tokenHash);
    if (session) {
      session.is_revoked = true;
      persistDB();
    }
  },
};
