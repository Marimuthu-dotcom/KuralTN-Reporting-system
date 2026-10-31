// Frontend/src/components/navigation/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  FileText,
  ThumbsUp,
  Users,
  Bell,
  Settings,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Clock,
  Briefcase,
  CheckCircle,
  BarChart3,
  Building,
  UserCheck,
  Megaphone,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useLanguage } from '../../hooks/useLanguage';
import { AnimatedShield } from '../common/AnimatedIcons';
import { KuralLogo } from '../common/KuralLogo';

export function Sidebar({ className = '' }) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { t, isTamil } = useLanguage();

  if (!user) return null;

  const role = user.role;
  const homePath =
    role === 'WARD_COUNCILLOR'
      ? '/councillor'
      : role === 'ACCOUNTABILITY_REVIEWER'
      ? '/reviewer'
      : role === 'ADMIN'
      ? '/admin'
      : '/dashboard';

  const isWardPending = user?.role === 'CITIZEN' && (!user?.is_ward_verified || user?.ward_verification_status === 'PENDING');

  // Role-appropriate navigation items with full bilingual translation
  const citizenLinks = [
    { to: '/dashboard', label: t('navDashboard'), icon: Home },
    ...(isWardPending
      ? [{ to: '/verification-pending', label: isTamil ? 'சரிபார்ப்பு நிலை' : 'Verification Status', icon: Clock, badge: 'Pending' }]
      : []),
    { to: '/report', label: t('navReport'), icon: PlusCircle, highlight: true },
    { to: '/complaints', label: t('navPublicFeed'), icon: Building },
    { to: '/departments', label: isTamil ? 'அரசு துறைகள்' : 'Civic Departments', icon: Briefcase },
    { to: '/my-complaints', label: t('navMyComplaints'), icon: FileText },
    { to: '/supported-complaints', label: t('navSupported'), icon: ThumbsUp },
    { to: '/ward', label: t('navWardCommunity'), icon: Users },
    { to: '/ward/announcements', label: t('navAnnouncements'), icon: Megaphone },
    { to: '/my-escalations', label: t('navEscalations'), icon: AlertTriangle },
    { to: '/accountability/my-reports', label: t('navAccountability'), icon: Lock },
    { to: '/notifications', label: t('navNotifications'), icon: Bell, badge: unreadCount },
    { to: '/profile', label: t('navProfile'), icon: UserCheck },
    { to: '/settings', label: t('navSettings'), icon: Settings },
  ];

  const councillorLinks = [
    { to: '/councillor', label: isTamil ? 'வார்டு மேலோட்டம்' : 'Ward Overview', icon: Home },
    { to: '/complaints', label: t('navPublicFeed'), icon: Building },
    { to: '/departments', label: isTamil ? 'அரசு துறைகள்' : 'Civic Departments', icon: Briefcase },
    { to: '/councillor/complaints', label: isTamil ? 'வார்டு புகார்கள்' : 'Ward Complaints', icon: FileText },
    { to: '/councillor/deadlines', label: isTamil ? 'காலக்கெடு & தாமதங்கள்' : 'Deadlines & Delays', icon: Clock },
    { to: '/councillor/assignments', label: isTamil ? 'துறை வாரியாகப் பிரித்தல்' : 'Department Triage', icon: Briefcase },
    { to: '/councillor/resolutions', label: isTamil ? 'தீர்வு சரிபார்ப்பு' : 'Resolution Reviews', icon: CheckCircle },
    { to: '/councillor/escalations', label: isTamil ? 'மேல்முறையீடுகள்' : 'Escalations Queue', icon: AlertTriangle },
    { to: '/councillor/announcements', label: isTamil ? 'வார்டு அறிவிப்பு வெளியிடுக' : 'Post Announcements', icon: Megaphone },
    { to: '/ward', label: isTamil ? 'வார்டு மக்கள் உரையாடல்' : 'Ward Community Chat', icon: Users },
    { to: '/councillor/analytics', label: isTamil ? 'வார்டு புள்ளிவிவரம்' : 'Ward Analytics', icon: BarChart3 },
    { to: '/notifications', label: t('navNotifications'), icon: Bell, badge: unreadCount },
    { to: '/profile', label: t('navProfile'), icon: UserCheck },
  ];

  const reviewerLinks = [
    { to: '/reviewer', label: isTamil ? 'வழக்குகள் மேலோட்டம்' : 'Cases Overview', icon: Home },
    { to: '/reviewer/cases', label: isTamil ? 'ஒதுக்கப்பட்ட வழக்குகள்' : 'Assigned Cases', icon: Lock },
    { to: '/complaints', label: t('navPublicFeed'), icon: Building },
    { to: '/departments', label: isTamil ? 'அரசு துறைகள்' : 'Civic Departments', icon: Briefcase },
    { to: '/notifications', label: t('navNotifications'), icon: Bell, badge: unreadCount },
    { to: '/profile', label: t('navProfile'), icon: UserCheck },
  ];

  const adminLinks = [
    { to: '/admin', label: isTamil ? 'நிர்வாக அறை' : 'Admin Dashboard', icon: BarChart3 },
    { to: '/complaints', label: t('navPublicFeed'), icon: Building },
    { to: '/departments', label: isTamil ? 'அரசு துறைகள்' : 'Civic Departments', icon: Briefcase },
    { to: '/admin/invitations', label: isTamil ? 'அழைப்பு மேலாண்மை' : 'Staff Invitations', icon: Mail },
    { to: '/admin/users', label: isTamil ? 'பயனர் & பொறுப்புகள்' : 'User Directory', icon: Users },
    { to: '/admin/districts', label: isTamil ? 'மாவட்டங்கள் & வார்டுகள்' : 'Districts & Geography', icon: Building },
    { to: '/admin/categories', label: isTamil ? 'புகார் வகைகள்' : 'Complaint Categories', icon: FileText },
    { to: '/admin/deadline-rules', label: isTamil ? 'காலக்கெடு விதிகள்' : 'SLA Target Rules', icon: Clock },
    { to: '/admin/official-contacts', label: isTamil ? 'அரசு எண்கள்' : 'Escalation Directory', icon: ShieldAlert },
    { to: '/admin/audit-logs', label: isTamil ? 'பாதுகாப்பு பதிவுகள்' : 'System Audit Logs', icon: Lock },
    { to: '/profile', label: t('navProfile'), icon: UserCheck },
  ];

  let links = citizenLinks;
  if (role === 'WARD_COUNCILLOR') links = councillorLinks;
  else if (role === 'ACCOUNTABILITY_REVIEWER') links = reviewerLinks;
  else if (role === 'ADMIN') links = adminLinks;

  return (
    <aside
      className={`w-64 h-screen sticky top-0 bg-white border-r border-[#E7E5E4] flex flex-col justify-between shrink-0 select-none z-30 ${className}`}
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Brand Header linked to role home */}
        <NavLink to={homePath} className="h-16 px-4 flex items-center border-b border-[#E7E5E4] hover:bg-neutral-50 transition-colors shrink-0">
          <KuralLogo size="md" showTagline={true} />
        </NavLink>

        {/* User Role Badge Banner */}
        <div className="px-4 py-2.5 bg-[#FAF9F6] border-b border-[#E7E5E4] flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">
            {t('activeRole')}
          </span>
          <span className="text-[11px] font-semibold text-[#F97316] px-2 py-0.5 bg-orange-100/60 rounded">
            {role.replace('_', ' ')}
          </span>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1 min-h-0">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard' || item.to === '/councillor' || item.to === '/reviewer' || item.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-orange-50 text-[#F97316] font-bold shadow-2xs'
                      : 'text-[#171717] hover:bg-neutral-100 hover:text-[#171717]'
                  } ${item.highlight ? 'bg-orange-500/10 text-[#F97316]' : ''}`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#B91C1C] text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Ward Info Footer */}
      <div className="p-4 border-t border-[#E7E5E4] bg-[#FAF9F6] shrink-0">
        <div className="text-[11px] text-[#737373]">{t('registeredWard')}:</div>
        <div className="text-xs font-bold text-[#171717] truncate mt-0.5">
          {user.ward_name || (user.ward_id ? `Ward ID: ${user.ward_id}` : 'Ward Pending')}
        </div>
      </div>
    </aside>
  );
}
