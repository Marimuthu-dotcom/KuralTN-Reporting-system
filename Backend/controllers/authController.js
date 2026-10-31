// Backend/controllers/authController.js
import { authService } from '../services/authService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { JWT_CONFIG } from '../config/jwt.js';

export const authController = {
  loginWithGoogle: asyncHandler(async (req, res) => {
    const { credential, demo_user_id } = req.body;
    const { user, accessToken, refreshToken, authStatus, redirectTo } = await authService.authenticateGoogle(
      credential,
      demo_user_id
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
