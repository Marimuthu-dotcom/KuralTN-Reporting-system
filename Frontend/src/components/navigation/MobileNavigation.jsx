// Frontend/src/components/navigation/MobileNavigation.jsx
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, FileText, Users, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useLanguage } from '../../hooks/useLanguage';

export function MobileNavigation() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { t, isTamil } = useLanguage();

  if (!user) return null;

  const isCitizen = user.role === 'CITIZEN';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E7E5E4] z-40 px-1 py-1.5 flex items-center justify-around shadow-lg">
      <NavLink
        to={isCitizen ? '/dashboard' : user.role === 'WARD_COUNCILLOR' ? '/councillor' : '/admin'}
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2.5 text-[10px] font-semibold transition-colors ${
            isActive ? 'text-[#F97316]' : 'text-[#737373] hover:text-[#171717]'
          }`
        }
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>{t('navHome')}</span>
      </NavLink>

      <NavLink
        to="/complaints"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2.5 text-[10px] font-semibold transition-colors ${
            isActive ? 'text-[#F97316]' : 'text-[#737373] hover:text-[#171717]'
          }`
        }
      >
        <FileText className="w-5 h-5 mb-0.5" />
        <span className="truncate max-w-[65px]">{t('navPublicFeed')}</span>
      </NavLink>

      {isCitizen && (
        <NavLink
          to="/report"
          className="flex flex-col items-center -mt-5 bg-[#F97316] text-white p-3 rounded-full shadow-lg hover:bg-[#EA580C] transition-transform active:scale-95"
          aria-label={t('navReport')}
        >
          <PlusCircle className="w-6 h-6" />
        </NavLink>
      )}

      <NavLink
        to="/ward"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2.5 text-[10px] font-semibold transition-colors ${
            isActive ? 'text-[#F97316]' : 'text-[#737373] hover:text-[#171717]'
          }`
        }
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span>{isTamil ? 'வார்டு' : 'Ward'}</span>
      </NavLink>

      <NavLink
        to="/notifications"
        className={({ isActive }) =>
          `relative flex flex-col items-center py-1 px-2.5 text-[10px] font-semibold transition-colors ${
            isActive ? 'text-[#F97316]' : 'text-[#737373] hover:text-[#171717]'
          }`
        }
      >
        <Bell className="w-5 h-5 mb-0.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-2 w-3.5 h-3.5 rounded-full bg-[#B91C1C] text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
        <span>{isTamil ? 'செய்தி' : 'Alerts'}</span>
      </NavLink>
    </nav>
  );
}
