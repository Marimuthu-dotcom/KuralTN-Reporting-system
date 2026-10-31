// Frontend/src/routes/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { CitizenLayout } from '../layouts/CitizenLayout';
import { CouncillorLayout } from '../layouts/CouncillorLayout';
import { ReviewerLayout } from '../layouts/ReviewerLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Protectors
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { ComplaintFeedPage } from '../pages/public/ComplaintFeedPage';
import { ComplaintDetailPage } from '../pages/public/ComplaintDetailPage';
import { WardProfilePage } from '../pages/public/WardProfilePage';
import { DistrictPage } from '../pages/public/DistrictPage';
import { OfficialEscalationDirectoryPage } from '../pages/public/OfficialEscalationDirectoryPage';
import { DepartmentsPage } from '../pages/public/DepartmentsPage';
import { HelpPage } from '../pages/public/HelpPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { AcceptInvitationPage } from '../pages/auth/AcceptInvitationPage';
import { AuthCallbackPage } from '../pages/auth/AuthCallbackPage';
import { OnboardingPage } from '../pages/auth/OnboardingPage';
import { VerificationPendingPage } from '../pages/auth/VerificationPendingPage';
import { AccountPendingApprovalPage } from '../pages/auth/AccountPendingApprovalPage';
import { AccessDeniedPage } from '../pages/auth/AccessDeniedPage';


// Citizen Pages
import { CitizenDashboardPage } from '../pages/citizen/CitizenDashboardPage';
import { CreateComplaintPage } from '../pages/citizen/CreateComplaintPage';
import { MyComplaintsPage } from '../pages/citizen/MyComplaintsPage';
import { SupportedComplaintsPage } from '../pages/citizen/SupportedComplaintsPage';
import { WardCommunityPage } from '../pages/citizen/WardCommunityPage';
import { WardAnnouncementsPage } from '../pages/citizen/WardAnnouncementsPage';
import { MyEscalationsPage } from '../pages/citizen/MyEscalationsPage';
import { AccountabilityReportPage } from '../pages/citizen/AccountabilityReportPage';
import { MyAccountabilityReportsPage } from '../pages/citizen/MyAccountabilityReportsPage';
import { NotificationsPage } from '../pages/citizen/NotificationsPage';
import { ProfilePage } from '../pages/citizen/ProfilePage';
import { SettingsPage } from '../pages/citizen/SettingsPage';

// Councillor Pages
import { CouncillorDashboardPage } from '../pages/councillor/CouncillorDashboardPage';
import { WardComplaintsPage } from '../pages/councillor/WardComplaintsPage';
import { ManageComplaintPage } from '../pages/councillor/ManageComplaintPage';
import { DeadlineManagementPage } from '../pages/councillor/DeadlineManagementPage';
import { DepartmentAssignmentsPage } from '../pages/councillor/DepartmentAssignmentsPage';
import { ResolutionReviewPage } from '../pages/councillor/ResolutionReviewPage';
import { EscalationManagementPage } from '../pages/councillor/EscalationManagementPage';
import { AnnouncementsManagementPage } from '../pages/councillor/AnnouncementsManagementPage';
import { WardAnalyticsPage } from '../pages/councillor/WardAnalyticsPage';

// Reviewer Pages
import { ReviewerDashboardPage } from '../pages/reviewer/ReviewerDashboardPage';
import { AssignedCasesPage } from '../pages/reviewer/AssignedCasesPage';
import { AccountabilityCaseDetailPage } from '../pages/reviewer/AccountabilityCaseDetailPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { InvitationManagementPage } from '../pages/admin/InvitationManagementPage';
import { DistrictManagementPage } from '../pages/admin/DistrictManagementPage';
import { CategoryManagementPage } from '../pages/admin/CategoryManagementPage';
import { DeadlineRulesPage } from '../pages/admin/DeadlineRulesPage';
import { OfficialContactsPage } from '../pages/admin/OfficialContactsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

export function AppRouter() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/complaints" element={<ComplaintFeedPage />} />
        <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/wards/:id" element={<WardProfilePage />} />
        <Route path="/districts/:id" element={<DistrictPage />} />
        <Route path="/escalation-directory" element={<OfficialEscalationDirectoryPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Route>

      {/* Auth Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/invitation/accept" element={<AcceptInvitationPage />} />
        <Route path="/invitations/accept" element={<AcceptInvitationPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/verification-pending" element={<VerificationPendingPage />} />
        <Route path="/pending-approval" element={<AccountPendingApprovalPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
      </Route>

      {/* Citizen / Authenticated Resident Pages */}
      <Route
        element={
          <ProtectedRoute>
            <CitizenLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<CitizenDashboardPage />} />
        <Route path="/report" element={<CreateComplaintPage />} />
        <Route path="/my-complaints" element={<MyComplaintsPage />} />
        <Route path="/supported-complaints" element={<SupportedComplaintsPage />} />
        <Route path="/ward" element={<WardCommunityPage />} />
        <Route path="/ward/announcements" element={<WardAnnouncementsPage />} />
        <Route path="/my-escalations" element={<MyEscalationsPage />} />
        <Route path="/accountability/report" element={<AccountabilityReportPage />} />
        <Route path="/accountability/my-reports" element={<MyAccountabilityReportsPage />} />
        <Route path="/accountability/cases/:id" element={<AccountabilityCaseDetailPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Ward Councillor Chamber */}
      <Route
        element={
          <RoleProtectedRoute allowedRoles={['WARD_COUNCILLOR', 'DEPARTMENT_HANDLER', 'ADMIN']}>
            <CouncillorLayout />
          </RoleProtectedRoute>
        }
      >
        <Route path="/councillor" element={<CouncillorDashboardPage />} />
        <Route path="/councillor/complaints" element={<WardComplaintsPage />} />
        <Route path="/councillor/complaints/:id" element={<ManageComplaintPage />} />
        <Route path="/councillor/deadlines" element={<DeadlineManagementPage />} />
        <Route path="/councillor/assignments" element={<DepartmentAssignmentsPage />} />
        <Route path="/councillor/resolutions" element={<ResolutionReviewPage />} />
        <Route path="/councillor/escalations" element={<EscalationManagementPage />} />
        <Route path="/councillor/announcements" element={<AnnouncementsManagementPage />} />
        <Route path="/councillor/analytics" element={<WardAnalyticsPage />} />
      </Route>

      {/* Independent Reviewer Chamber */}
      <Route
        element={
          <RoleProtectedRoute allowedRoles={['ACCOUNTABILITY_REVIEWER', 'ADMIN']}>
            <ReviewerLayout />
          </RoleProtectedRoute>
        }
      >
        <Route path="/reviewer" element={<ReviewerDashboardPage />} />
        <Route path="/reviewer/cases" element={<AssignedCasesPage />} />
        <Route path="/reviewer/cases/:id" element={<AccountabilityCaseDetailPage />} />
      </Route>

      {/* Admin Governance */}
      <Route
        element={
          <RoleProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </RoleProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/invitations" element={<InvitationManagementPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/districts" element={<DistrictManagementPage />} />
        <Route path="/admin/categories" element={<CategoryManagementPage />} />
        <Route path="/admin/deadline-rules" element={<DeadlineRulesPage />} />
        <Route path="/admin/official-contacts" element={<OfficialContactsPage />} />
        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
