// Frontend/src/routes/routeConfig.js
export const ROUTES = {
  HOME: '/',
  FEED: '/complaints',
  COMPLAINT_DETAIL: '/complaints/:id',
  WARD_PROFILE: '/wards/:id',
  DISTRICT: '/districts/:id',
  ESCALATION_DIRECTORY: '/escalation-directory',
  HELP: '/help',

  // Auth
  LOGIN: '/login',
  ONBOARDING: '/onboarding',
  ACCESS_DENIED: '/access-denied',

  // Citizen
  CITIZEN_DASHBOARD: '/dashboard',
  REPORT_PROBLEM: '/report',
  MY_COMPLAINTS: '/my-complaints',
  SUPPORTED_COMPLAINTS: '/supported-complaints',
  WARD_COMMUNITY: '/ward',
  WARD_ANNOUNCEMENTS: '/ward/announcements',
  MY_ESCALATIONS: '/my-escalations',
  ACCOUNTABILITY_REPORT: '/accountability/report',
  MY_ACCOUNTABILITY_REPORTS: '/accountability/my-reports',
  ACCOUNTABILITY_CASE_DETAIL: '/accountability/cases/:id',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  SETTINGS: '/settings',

  // Councillor
  COUNCILLOR_DASHBOARD: '/councillor',
  COUNCILLOR_COMPLAINTS: '/councillor/complaints',
  COUNCILLOR_MANAGE_COMPLAINT: '/councillor/complaints/:id',
  COUNCILLOR_DEADLINES: '/councillor/deadlines',
  COUNCILLOR_ASSIGNMENTS: '/councillor/assignments',
  COUNCILLOR_RESOLUTIONS: '/councillor/resolutions',
  COUNCILLOR_ESCALATIONS: '/councillor/escalations',
  COUNCILLOR_ANNOUNCEMENTS: '/councillor/announcements',
  COUNCILLOR_ANALYTICS: '/councillor/analytics',

  // Reviewer
  REVIEWER_DASHBOARD: '/reviewer',
  REVIEWER_CASES: '/reviewer/cases',
  REVIEWER_CASE_DETAIL: '/reviewer/cases/:id',

  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_DISTRICTS: '/admin/districts',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_DEADLINE_RULES: '/admin/deadline-rules',
  ADMIN_OFFICIAL_CONTACTS: '/admin/official-contacts',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
};
