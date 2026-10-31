// Backend/controllers/authController.js
import { authService } from '../services/authService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { JWT_CONFIG } from '../config/jwt.js';

export const authController = {
  register: asyncHandler(async (req, res) => {
    const { full_name, email, username, password, confirm_password } = req.body;
    const { user, accessToken, refreshToken, authStatus, redirectTo } = await authService.registerCitizen({
      full_name,
      email,
      username,
      password,
      confirm_password,
    });

    res.cookie(JWT_CONFIG.cookieName, refreshToken, JWT_CONFIG.cookieOptions);

    return successResponse(
      res,
      {
        user,
        accessToken,
        refreshToken,
        authStatus,
        redirectTo,
      },
      'Citizen registered successfully',
      201
    );
  }),

  login: asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    const { user, accessToken, refreshToken, authStatus, redirectTo } = await authService.loginUser({
      identifier,
      password,
    });

    res.cookie(JWT_CONFIG.cookieName, refreshToken, JWT_CONFIG.cookieOptions);

    return successResponse(
      res,
      {
        user,
        accessToken,
        refreshToken,
        authStatus,
        redirectTo,
      },
      'Signed in successfully'
    );
  }),

  loginWithGoogle: asyncHandler(async (req, res) => {
    const { credential, demo_user_id, mode, invitation_token } = req.body;
    const { user, accessToken, refreshToken, authStatus, redirectTo } = await authService.authenticateGoogle(
      credential,
      demo_user_id,
      mode,
      invitation_token
    );

    // Set refresh token in HTTP-only cookie
    res.cookie(JWT_CONFIG.cookieName, refreshToken, JWT_CONFIG.cookieOptions);

    return successResponse(
      res,
      {
        user,
        accessToken,
        refreshToken,
        authStatus,
        redirectTo,
      },
      'Authentication successful'
    );
  }),

  getInvitation: asyncHandler(async (req, res) => {
    const { token } = req.params;
    const invitation = await authService.validateInvitation(token);
    return successResponse(
      res,
      {
        id: invitation.id,
        full_name: invitation.full_name,
        email: invitation.email,
        role: invitation.role,
        assigned_district_id: invitation.assigned_district_id,
        assigned_ward_id: invitation.assigned_ward_id,
        assigned_ward_name: invitation.assigned_ward_name,
        department_id: invitation.department_id,
        department_name: invitation.department_name,
        designation: invitation.designation,
        status: invitation.status,
        expires_at: invitation.expires_at,
      },
      'Invitation verified'
    );
  }),

  acceptInvitation: asyncHandler(async (req, res) => {
    const { token, password, full_name, username } = req.body;
    const { user, accessToken, refreshToken, redirectTo } = await authService.acceptInvitation({
      token,
      password,
      full_name,
      username,
    });

    res.cookie(JWT_CONFIG.cookieName, refreshToken, JWT_CONFIG.cookieOptions);

    return successResponse(
      res,
      {
        user,
        accessToken,
        refreshToken,
        redirectTo,
      },
      'Invitation accepted and account activated successfully'
    );
  }),

  refreshToken: asyncHandler(async (req, res) => {
    const refreshToken =
      req.cookies?.[JWT_CONFIG.cookieName] ||
      req.body?.refreshToken ||
      req.headers['x-refresh-token'];
    const { user, accessToken, refreshToken: newRefreshToken } = await authService.refreshSession(
      refreshToken
    );

    res.cookie(JWT_CONFIG.cookieName, newRefreshToken, JWT_CONFIG.cookieOptions);

    return successResponse(
      res,
      {
        user,
        accessToken,
        refreshToken: newRefreshToken,
      },
      'Session token refreshed successfully'
    );
  }),

  logout: asyncHandler(async (req, res) => {
    const refreshToken = req.cookies[JWT_CONFIG.cookieName] || req.body.refreshToken;
    if (refreshToken) {
      await authService.revokeSession(refreshToken);
    }

    res.clearCookie(JWT_CONFIG.cookieName, JWT_CONFIG.cookieOptions);

    return successResponse(res, null, 'Signed out successfully');
  }),

  getPublicAccounts: asyncHandler(async (req, res) => {
    const { getDB } = await import("../config/db.js");
    const { userRepository } = await import("../repositories/userRepository.js");
    const { wardRepository } = await import("../repositories/wardRepository.js");

    const db = getDB();
    const allUsers = userRepository.findAll() || [];
    const wards = wardRepository.findAllWards() || [];
    const depts = db.departments || [];

    // Return sanitized database users with live ward and department metadata
    const accounts = allUsers.map((u) => {
      const ward = wards.find((w) => w.id === (u.verified_ward_id || u.ward_id || u.claimed_ward_id));
      const dept = depts.find((d) => d.id === u.department_id);

      let desc = "";
      if (u.role === "CITIZEN") {
        desc = ward ? `Registered Citizen (${ward.ward_name})` : "Registered Citizen";
      } else if (u.role === "WARD_COUNCILLOR") {
        desc = ward ? `Elected Councillor (${ward.ward_name})` : "Elected Ward Councillor";
      } else if (u.role === "DEPARTMENT_HANDLER") {
        desc = dept ? `Department Staff (${dept.name})` : (u.designation || "Municipal Department Staff");
      } else if (u.role === "ADMIN") {
        desc = "System Administrator";
      } else if (u.role === "ACCOUNTABILITY_REVIEWER") {
        desc = "Independent Accountability Reviewer";
      } else {
        desc = `Pending Account (${u.approval_status || "Pending"})`;
      }

      return {
        id: u.id,
        userId: u.id,
        sub: u.google_id || `google_sub_${Buffer.from(u.email || u.id).toString("hex").slice(0, 24)}`,
        email: u.email,
        name: u.full_name || "User",
        full_name: u.full_name || "User",
        picture: u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        avatar_url: u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        role: u.role || "CITIZEN",
        type: u.role || "CITIZEN",
        approval_status: u.approval_status || "APPROVED",
        ward_id: u.ward_id,
        ward_name: ward?.ward_name || null,
        department_id: u.department_id,
        department_name: dept?.name || null,
        is_active: u.is_active !== false,
        desc,
      };
    });

    return successResponse(res, accounts, "Database user accounts retrieved successfully");
  }),

  getMe: asyncHandler(async (req, res) => {
    return successResponse(res, req.user, 'Current authenticated user profile');
  }),
};
