// Frontend/src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { DEMO_ACCOUNTS } from '../../utils/constants';
import { Button } from '../../components/common/Button';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  AtSign,
} from 'lucide-react';

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const { isTamil } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAccountChooser, setShowAccountChooser] = useState(false);
  const [showDevPersonas, setShowDevPersonas] = useState(false);

  // Preserve intended destination
  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/dashboard';

  const handlePostLoginRedirect = (res) => {
    if (res?.redirectTo) {
      if (res.user?.role === 'CITIZEN' && from !== '/dashboard') {
        navigate(from, { replace: true });
      } else {
        navigate(res.redirectTo, { replace: true });
      }
      return;
    }

    const role = res?.user?.role || res?.role;
    if (role === 'WARD_COUNCILLOR') navigate('/councillor', { replace: true });
    else if (role === 'ACCOUNTABILITY_REVIEWER') navigate('/reviewer', { replace: true });
    else if (role === 'ADMIN') navigate('/admin', { replace: true });
    else if (role === 'DEPARTMENT_HANDLER') navigate('/councillor/assignments', { replace: true });
    else navigate(from, { replace: true });
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      return setError(isTamil ? 'மின்னஞ்சல் அல்லது பயனர் பெயரை உள்ளிடவும்' : 'Please enter your email or username');
    }
    if (!password) {
      return setError(isTamil ? 'கடவுச்சொல்லை உள்ளிடவும்' : 'Please enter your password');
    }

    setIsLoading(true);
    try {
      const res = await login({
        identifier: identifier.trim(),
        password,
      });
      handlePostLoginRedirect(res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const executeGoogleAuth = async (googleAccountPayload) => {
    setIsLoading(true);
    setError('');
    setShowAccountChooser(false);
    try {
      const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
      const payload = btoa(
        JSON.stringify({
          sub: googleAccountPayload.sub,
          email: googleAccountPayload.email,
          name: googleAccountPayload.name,
          picture: googleAccountPayload.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          email_verified: true,
          iss: 'https://accounts.google.com',
          aud: 'tn-civic-applet',
        })
      );
      const signature = btoa('mock_secure_google_signature');
      const credential = `${header}.${payload}.${signature}`;

      // Mode is 'login' - rejects silent creation if unregistered
      const res = await loginWithGoogle(credential, null, 'login');
      handlePostLoginRedirect(res);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          (isTamil
            ? 'இந்த கணக்கு பதிவு செய்யப்படவில்லை. தயவுசெய்து முதலில் பதிவு செய்யவும்.'
            : 'No account found for this Google email. Please register as a Citizen first.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPersonaLogin = async (account) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await loginWithGoogle(null, account.id || account.userId);
      handlePostLoginRedirect(res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Test persona login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Top Bar with Language Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200 shadow-xs mb-1">
            <Shield className="w-8 h-8 text-[#F97316]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            {isTamil ? 'உள்நுழைக' : 'Sign In to KuralTN'}
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] max-w-sm mx-auto">
            {isTamil
              ? 'வார்டு புகார்கள், மக்கள் கலந்துரையாடல் மற்றும் தீர்வுகளை அணுக உங்கள் கணக்கில் நுழையவும்.'
              : 'Enter your credentials to access civic services and track issues.'}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 sm:px-8 shadow-sm rounded-3xl border border-[#E7E5E4] space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {error}
                {error.toLowerCase().includes('register') && (
                  <div className="mt-2">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1 font-bold text-[#F97316] underline hover:text-[#EA580C]"
                    >
                      {isTamil ? 'இப்போது பதிவு செய்க' : 'Go to Citizen Registration'} &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION A: Google OAuth Sign In */}
          <div>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setShowAccountChooser(true)}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#E7E5E4] rounded-xl shadow-xs bg-white text-xs sm:text-sm font-bold text-[#171717] hover:bg-neutral-50 hover:border-neutral-400 transition-all cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isTamil ? 'கூகிள் மூலம் உள்நுழைக' : 'Sign in with Google'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E7E5E4] w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-[#737373] uppercase tracking-wider shrink-0">
              {isTamil ? 'அல்லது கடவுச்சொல் மூலம் நுழைக' : 'or enter credentials'}
            </span>
            <div className="border-t border-[#E7E5E4] w-full" />
          </div>

          {/* SECTION B: Manual Login Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                {isTamil ? 'மின்னஞ்சல் அல்லது பயனர் பெயர்' : 'Email or Username'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or username"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                {isTamil ? 'கடவுச்சொல்' : 'Password'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center py-3 text-xs sm:text-sm font-bold shadow-xs mt-2"
              isLoading={isLoading}
            >
              <span>{isTamil ? 'உள்நுழைக' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* SECTION C: Link to Register */}
          <div className="pt-2 text-center border-t border-[#E7E5E4] text-xs text-[#737373]">
            <span>{isTamil ? 'புதிய குடிமக்களா?' : "Don't have an account?"} </span>
            <Link to="/register" className="font-bold text-[#F97316] hover:underline cursor-pointer">
              {isTamil ? 'குடிமக்கள் கணக்கு உருவாக்குக' : 'Register as Citizen'}
            </Link>
          </div>

          {/* TASK 5: Test Persona Selector */}
          <div className="pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setShowDevPersonas(!showDevPersonas)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-neutral-500 hover:text-neutral-800 py-1 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-orange-500" />
                <span>{isTamil ? 'சோதனை பயனர்கள் (Development Quick-Test)' : 'Demonstration Test Personas'}</span>
              </span>
              {showDevPersonas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDevPersonas && (
              <div className="mt-2.5 grid grid-cols-2 gap-2 p-2.5 bg-neutral-50 rounded-2xl border border-neutral-200">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleTestPersonaLogin(acc)}
                    className="p-2 rounded-xl bg-white border border-neutral-200 hover:border-orange-500 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-neutral-900 truncate">{acc.name}</div>
                    <div className="text-[10px] text-orange-600 font-mono uppercase">{acc.role.replace(/_/g, ' ')}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Account Chooser Modal */}
      {showAccountChooser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E7E5E4] space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">G</span>
                </div>
                <h3 className="text-sm font-bold text-[#171717]">
                  {isTamil ? 'கூகிள் கணக்கைத் தேர்வு செய்க' : 'Choose a Google Account'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountChooser(false)}
                className="text-[#737373] hover:text-[#171717] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => executeGoogleAuth(acc)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[#E7E5E4] hover:border-[#F97316] hover:bg-orange-50/50 text-left transition-all cursor-pointer group"
                >
                  <img
                    src={acc.picture}
                    alt={acc.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-neutral-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#171717] group-hover:text-[#F97316] truncate">
                      {acc.name}
                    </div>
                    <div className="text-[11px] text-[#737373] truncate">{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
