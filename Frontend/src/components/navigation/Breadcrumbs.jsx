// Frontend/src/components/navigation/Breadcrumbs.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';

export function Breadcrumbs({ items = [] }) {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();

  if (!items || items.length === 0) return null;

  const homePath = !isAuthenticated
    ? '/'
    : user?.role === 'WARD_COUNCILLOR'
    ? '/councillor'
    : user?.role === 'ACCOUNTABILITY_REVIEWER'
    ? '/reviewer'
    : user?.role === 'ADMIN'
    ? '/admin'
    : '/dashboard';

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[#737373] mb-4 overflow-x-auto whitespace-nowrap py-1">
      <Link to={homePath} className="hover:text-[#F97316] flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
        <span>{t('navHome')}</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
            {isLast || !item.to ? (
              <span className="font-semibold text-[#171717]">{item.label}</span>
            ) : (
              <Link to={item.to} className="hover:text-[#F97316] transition-colors">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
