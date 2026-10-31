// Frontend/src/pages/auth/AuthCallbackPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    async function processCallback() {
      try {
        const searchParams = new URLSearchParams(location.search);
        const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));

        const credential =
          searchParams.get('credential') ||
          searchParams.get('id_token') ||
          hashParams.get('id_token') ||
          searchParams.get('code');

        if (credential) {
          const res = await loginWithGoogle(credential);
          if (res?.redirectTo) {
            navigate(res.redirectTo, { replace: true });
          } else if (res?.user?.role === 'WARD_COUNCILLOR') {
            navigate('/councillor', { replace: true });
          } else if (res?.user?.role === 'ADMIN') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          // If already authenticated or default redirect
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to complete Google authentication session');
      }
    }

    processCallback();
  }, [location, loginWithGoogle, navigate]);

  if (error) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4 max-w-md mx-auto text-center p-6">
        <div className="p-3 bg-red-100 text-red-600 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-[#171717]">Authentication Error</h2>
        <p className="text-xs text-[#737373]">{error}</p>
        <Link
          to="/login"
          className="px-4 py-2 bg-[#F97316] text-white text-xs font-bold rounded-xl hover:bg-[#EA580C] transition-all"
        >
          Return to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="py-20 flex flex-col items-center justify-center space-y-3">
      <LoadingSpinner size="lg" />
      <p className="text-xs text-[#737373]">Finalizing secure authentication session...</p>
    </div>
  );
}
