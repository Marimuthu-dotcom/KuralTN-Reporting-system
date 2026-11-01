// Frontend/src/layouts/AuthLayout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { KuralLogo } from '../components/common/KuralLogo';
import { LanguageToggle } from '../components/common/LanguageToggle';
import { useLanguage } from '../hooks/useLanguage';

export function AuthLayout() {
  const { t, isTamil } = useLanguage();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-between">
      {/* Top Navbar Row */}
      <header className="h-16 bg-white border-b border-[#E7E5E4] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        {/* Left: KuralTN Logo and Brand Name */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity">
          <KuralLogo size="md" showTagline={false} />
        </Link>

        {/* Right: Language Switcher and Sign In button (Public Feed & Official Directory removed from this row) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <Link
            to="/login"
            className={`px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-2xs ${
              isLoginPage
                ? 'bg-[#F97316] text-white hover:bg-[#EA580C]'
                : 'bg-white border border-[#E7E5E4] text-[#171717] hover:bg-neutral-50'
            }`}
          >
            {t('navSignIn')}
          </Link>
        </div>
      </header>

      {/* Main Form Center Area */}
      <main className="flex-1 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
          <h2 className="text-xs sm:text-sm font-semibold text-[#737373]">
            {isTamil
              ? 'தமிழ்நாடு மக்கள் குறைதீர்ப்பு மற்றும் வார்டு பொறுப்புடைமை தளம்'
              : 'Tamil Nadu Citizen Grievance & Ward Accountability Platform'}
          </h2>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 shadow-xs border border-[#E7E5E4] rounded-2xl">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-4 px-6 text-center text-[11px] text-[#737373] border-t border-[#E7E5E4] bg-white">
        &copy; {new Date().getFullYear()} KuralTN &bull; {isTamil ? 'தமிழ்நாடு நகராட்சி நிர்வாகம்' : 'Tamil Nadu Civic Governance'}
      </footer>
    </div>
  );
}
