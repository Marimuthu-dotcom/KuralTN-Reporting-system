// Frontend/src/layouts/PublicLayout.jsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { Sidebar } from '../components/navigation/Sidebar';
import { MobileNavigation } from '../components/navigation/MobileNavigation';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

export function PublicLayout() {
  const { isAuthenticated, user } = useAuth();
  const { t, isTamil } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // If user is on the marketing landing page ("/") and authenticated, they can still view it,
  // but on "/complaints", "/departments", "/help", etc., if logged in, provide the full portal sidebar!
  const isLandingRoot = location.pathname === '/';

  if (isAuthenticated && !isLandingRoot) {
    return (
      <div className="min-h-screen flex bg-[#FAF9F6]">
        {/* Desktop Left Sidebar */}
        <div className="hidden md:flex shrink-0 sticky top-0 h-screen z-30">
          <Sidebar className="h-full" />
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-64 bg-white h-full shadow-2xl flex flex-col">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <Navbar
            title={
              location.pathname.startsWith('/complaints')
                ? t('navPublicFeed')
                : location.pathname.startsWith('/departments')
                ? (isTamil ? 'அரசு துறைகள் வழிகாட்டி' : 'Civic Departments')
                : t('brandName')
            }
            onMobileMenuToggle={() => setMobileMenuOpen(true)}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Tab Bar */}
        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Navbar title={t('systemTitle')} />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

