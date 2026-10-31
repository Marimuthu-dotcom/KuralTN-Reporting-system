// Frontend/src/components/navigation/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  Menu,
  LogOut,
  User,
  Shield,
  ChevronDown,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useLanguage } from '../../hooks/useLanguage';
import { Avatar } from '../common/Avatar';
import { Dropdown } from '../common/Dropdown';
import { LanguageToggle } from '../common/LanguageToggle';
import { AnimatedShield } from '../common/AnimatedIcons';
import { KuralLogo } from '../common/KuralLogo';
import { DEMO_ACCOUNTS } from '../../utils/constants';

export function Navbar({ onMobileMenuToggle, title }) {
  const { user, loginWithGoogle, logout, isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { t, isTamil } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const homePath = !isAuthenticated
    ? '/'
    : user?.role === 'WARD_COUNCILLOR'
    ? '/councillor'
    : user?.role === 'ACCOUNTABILITY_REVIEWER'
    ? '/reviewer'
    : user?.role === 'ADMIN'
    ? '/admin'
    : '/dashboard';

  const handleSwitchDemoAccount = async (account) => {
    try {
      const res = await loginWithGoogle(null, account.id || account.userId);
      setShowNotifications(false);
      if (res?.redirectTo) {
        navigate(res.redirectTo);
      } else if (account.role === 'WARD_COUNCILLOR') {
        navigate('/councillor');
      } else if (account.role === 'ADMIN') {
        navigate('/admin');
      } else if (account.role === 'DEPARTMENT_HANDLER') {
        navigate('/councillor/assignments');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to switch demo account:', err);
    }
  };

  const userMenuItems = [
    {
      label: t('navProfile'),
      icon: User,
      onClick: () => navigate('/profile'),
    },
    {
      label: t('navPublicFeed'),
      icon: Building2,
      onClick: () => navigate('/complaints'),
    },
    {
      label: isTamil ? 'அரசு துறைகள்' : 'Civic Departments',
      icon: Shield,
      onClick: () => navigate('/departments'),
    },
    {
      label: t('navHelp'),
      icon: ExternalLink,
      onClick: () => navigate('/help'),
    },
    {
      label: t('navSignOut'),
      icon: LogOut,
      danger: true,
      onClick: () => {
        logout();
        navigate('/');
      },
    },
  ];

  const location = useLocation();
  const isFeedActive = location.pathname.startsWith('/complaints');
  const isDeptActive = location.pathname.startsWith('/departments');
  const isDirActive = location.pathname.startsWith('/escalation-directory');

  return (
    <div className="sticky top-0 z-40">
      <header className="h-16 bg-white border-b border-[#E7E5E4] px-3 sm:px-6 flex items-center justify-between">
        {/* Left side: Mobile menu toggle + page heading */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onMobileMenuToggle && (
            <button
              type="button"
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 text-[#737373] hover:text-[#171717] rounded-lg hover:bg-neutral-100"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* When authenticated (sidebar already present with logo), show only clean page title. Otherwise show logo. */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {title && (
                <h1 className="text-sm sm:text-base font-bold text-[#171717] truncate">
                  {title}
                </h1>
              )}
            </div>
          ) : (
            <Link to={homePath} className="group flex items-center gap-2.5 shrink-0">
              <KuralLogo size="sm" showTagline={false} />
              {title && title !== t('brandName') && title !== 'KuralTN' && (
                <div className="hidden sm:flex items-center border-l border-[#E7E5E4] pl-2.5 ml-1">
                  <span className="text-xs font-bold text-[#171717] truncate max-w-[200px]">
                    {title}
                  </span>
                </div>
              )}
            </Link>
          )}
        </div>

      {/* Center Nav tabs: Only shown when user is NOT logged in. Logged-in users access these via the sidebar. */}
      {!isAuthenticated && location.pathname !== '/login' && (
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/complaints"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isFeedActive
                ? 'bg-[#F97316] text-white shadow-xs'
                : 'text-[#171717] hover:bg-orange-50 hover:text-[#F97316]'
            }`}
          >
            <Building2 className={`w-4 h-4 ${isFeedActive ? 'text-white' : 'text-[#F97316]'}`} />
            <span>{t('navPublicFeed')}</span>
          </Link>

          <Link
            to="/departments"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isDeptActive
                ? 'bg-[#F97316] text-white shadow-xs'
                : 'text-[#171717] hover:bg-orange-50 hover:text-[#F97316]'
            }`}
          >
            <Shield className={`w-4 h-4 ${isDeptActive ? 'text-white' : 'text-[#F97316]'}`} />
            <span>{isTamil ? 'அரசு துறைகள்' : 'Civic Departments'}</span>
          </Link>

          <Link
            to="/escalation-directory"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isDirActive
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-[#737373] hover:text-[#171717] hover:bg-neutral-100'
            }`}
          >
            <span>{t('navDirectory')}</span>
          </Link>
        </nav>
      )}

      {/* Right side: Language Switcher, Persona Switcher, Notification Bell, User profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Prominent Bilingual Language Toggle */}
        <LanguageToggle />

        {/* Demo Switcher Quick Menu */}
        <div className="relative">
          <Dropdown
            trigger={
              <button
                type="button"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-[#E7E5E4] text-xs font-semibold text-[#171717] hover:bg-neutral-50 transition-colors"
                title="Switch test persona"
              >
                <AnimatedShield className="w-4 h-4 text-[#F97316]" />
                <span className="hidden lg:inline">{t('roleSwitcher')}</span>
                <ChevronDown className="w-3 h-3 text-[#737373]" />
              </button>
            }
            items={DEMO_ACCOUNTS.map((acc) => ({
              label: `${acc.name} (${acc.role.replace(/_/g, " ")})`,
              onClick: () => handleSwitchDemoAccount(acc),
            }))}
          />
        </div>

        {isAuthenticated ? (
          <>
            {/* Notification Bell with Popup */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-[#737373] hover:text-[#171717] rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#B91C1C] text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#E7E5E4] z-50 overflow-hidden">
                  <div className="p-3 bg-[#FAF9F6] border-b border-[#E7E5E4] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                      {t('navNotifications')} ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[#F97316] font-semibold hover:underline cursor-pointer"
                      >
                        {t('save')}
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#E7E5E4]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#737373]">
                        {t('loading')}
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.is_read) markAsRead(n.id);
                            if (n.related_entity_id) {
                              setShowNotifications(false);
                              navigate(`/complaints/${n.related_entity_id}`);
                            }
                          }}
                          className={`p-3 text-xs cursor-pointer hover:bg-neutral-50 transition-colors ${
                            !n.is_read ? 'bg-orange-50/40 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[#171717] truncate">{n.title}</span>
                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0" />
                            )}
                          </div>
                          <p className="text-[#737373] line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-[#FAF9F6] border-t border-[#E7E5E4] text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-semibold text-[#F97316] hover:underline"
                    >
                      {t('viewAll')}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile dropdown */}
            <Dropdown
              trigger={
                <div className="flex items-center gap-1.5 sm:gap-2 pl-2 border-l border-[#E7E5E4]">
                  <Avatar src={user.avatar_url} name={user.full_name} size="md" />
                  <div className="hidden md:block text-left">
                    <span className="block text-xs font-bold text-[#171717] truncate max-w-[110px]">
                      {user.full_name}
                    </span>
                    <span className="block text-[10px] text-[#737373] truncate">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#737373] hidden sm:block" />
                </div>
              }
              items={userMenuItems}
            />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition-colors"
            >
              {t('navSignIn')}
            </Link>
          </div>
        )}
      </div>
    </header>
    </div>
  );
}
