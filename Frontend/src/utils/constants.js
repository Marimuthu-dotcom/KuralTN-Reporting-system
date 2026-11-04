// Frontend/src/utils/constants.js
export const COMPLAINT_STATUSES = {
  PENDING_COUNCILLOR: 'Pending Councillor Verification',
  SUBMITTED: 'Submitted',
  FORWARDED_TO_DEPT: 'Forwarded to Department',
  ACKNOWLEDGED: 'Acknowledged',
  UNDER_REVIEW: 'Under Review',
  IN_PROGRESS: 'In Progress',
  RESOLUTION_PROPOSED: 'Resolution Proposed',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

export const DEADLINE_CONDITIONS = {
  ON_TRACK: 'ON_TRACK',
  APPROACHING: 'APPROACHING',
  OVERDUE: 'OVERDUE',
  EXTENDED: 'EXTENDED',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
};

export const USER_ROLES = {
  CITIZEN: 'CITIZEN',
  WARD_COUNCILLOR: 'WARD_COUNCILLOR',
  DEPARTMENT_HANDLER: 'DEPARTMENT_HANDLER',
  ACCOUNTABILITY_REVIEWER: 'ACCOUNTABILITY_REVIEWER',
  ADMIN: 'ADMIN',
};

export const DEADLINE_TYPES = {
  VERIFIED_OFFICIAL_TIMELINE: 'Verified official service timeline',
  DEPARTMENT_PROVIDED_TARGET: 'Department-provided target',
  ADMINISTRATOR_CONFIGURED_TARGET: 'Administrator-configured target',
  ESTIMATED_TARGET: 'Estimated target',
  DEADLINE_NOT_CONFIRMED: 'Deadline not confirmed',
};

export const ACCOUNTABILITY_CONCERN_TYPES = [
  { value: 'REPEATED_FAILURE_TO_RESPOND', label: 'Repeated failure to respond or acknowledge' },
  { value: 'REPEATED_MISSED_DEADLINES_WITHOUT_EXPLANATION', label: 'Repeated missed deadlines without explanation' },
  { value: 'FALSE_CLAIM_OF_RESOLUTION', label: 'Complaint marked resolved while problem remains' },
  { value: 'IMPROPER_HANDLING', label: 'Alleged improper grievance handling' },
  { value: 'OTHER_EVIDENCE_BASED_CONCERN', label: 'Other evidence-based administrative concern' },
];

export const DEMO_ACCOUNTS = [
  {
    id: 'user-citizen-anand',
    userId: 'user-citizen-anand',
    name: 'Anand Kumar',
    email: 'anand.kumar@civicmail.in',
    role: 'CITIZEN',
    sub: 'demo-google-anand-01',
    desc: 'Registered Citizen (Millerpuram - Ward 43)',
    picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  },
  {
    id: 'user-councillor-senthil',
    userId: 'user-councillor-senthil',
    name: 'Councillor M. Senthil Nathan',
    email: 'councillor.ward43@thoothukudi.gov.in',
    role: 'WARD_COUNCILLOR',
    sub: 'demo-google-senthil-04',
    desc: 'Elected Ward Councillor (Millerpuram - Ward 43)',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'user-department-murugan',
    userId: 'user-department-murugan',
    name: 'Er. K. Murugan (Asst. Exec. Engineer)',
    email: 'eng.murugan@thoothukudicorporation.tn.gov.in',
    role: 'DEPARTMENT_HANDLER',
    sub: 'demo-google-murugan-07',
    desc: 'Department Staff (Public Works & SWM)',
    picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  },
  {
    id: 'user-reviewer-ganesan',
    userId: 'user-reviewer-ganesan',
    name: 'R. Ganesan (Accountability Reviewer)',
    full_name: 'R. Ganesan (Accountability Reviewer)',
    email: 'reviewer.ganesan@civicgrievance.tn.gov.in',
    role: 'ACCOUNTABILITY_REVIEWER',
    sub: 'demo-google-reviewer-05',
    desc: 'Independent Accountability Reviewer',
    picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    approval_status: 'APPROVED',
  },
  {
    id: 'user-admin-ramanathan',
    userId: 'user-admin-ramanathan',
    name: 'K. Ramanathan (System Administrator)',
    email: 'admin.ramanathan@civicgrievance.tn.gov.in',
    role: 'ADMIN',
    sub: 'demo-google-admin-09',
    desc: 'System Administrator (Municipal Corporation)',
    picture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
  },
];

