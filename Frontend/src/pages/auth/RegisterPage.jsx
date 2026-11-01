// Frontend/src/pages/auth/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { Button } from '../../components/common/Button';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const { isTamil } = useLanguage();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePostAuthRedirect = (res) => {
    if (res?.redirectTo) {
      navigate(res.redirectTo, { replace: true });
      return;
    }
    const role = res?.user?.role || res?.role;
    if (role === 'WARD_COUNCILLOR') navigate('/councillor', { replace: true });
    else if (role === 'ADMIN') navigate('/admin', { replace: true });
    else if (role === 'DEPARTMENT_HANDLER') navigate('/councillor/assignments', { replace: true });
    else navigate('/dashboard', { replace: true });
  };

  const handleManualRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Client-side validations
    if (!fullName.trim()) {
      return setError(isTamil ? 'முழுப் பெயரை உள்ளிடவும்' : 'Please enter your full name');
    }
    if (!email.trim()) {
      return setError(isTamil ? 'மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'Please enter your email address');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return setError(isTamil ? 'சரியான மின்னஞ்சல் வடிவத்தை உள்ளிடவும்' : 'Please enter a valid email format');
    }
    if (!password) {
      return setError(isTamil ? 'கடவுச்சொல்லை உள்ளிடவும்' : 'Please enter a password');
    }
    if (password.length < 6) {
      return setError(isTamil ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்' : 'Password must be at least 6 characters long');
    }
    if (password !== confirmPassword) {
      return setError(isTamil ? 'கடவுச்சொற்கள் பொருந்தவில்லை' : 'Passwords do not match');
    }

    setIsLoading(true);
    try {
      // Username is derived from the email (portion before '@')
      // so we don't need a separate input field for it.
      const derivedUsername = email.trim().split('@')[0].toLowerCase();

      const res = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        username: derivedUsername,
        password,
        confirm_password: confirmPassword,
      });
      handlePostAuthRedirect(res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Real Google OAuth: receives a genuine Google ID token (JWT)
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) 
    {
      setError(isTamil ? 'கூகிள் சான்று கிடைக்கவில்லை' : 'Google credential was not received. Please try again.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      // Mode is 'register' - creates a new Citizen if not existing
      const res = await loginWithGoogle(credentialResponse.credential, null, 'register');
      handlePostAuthRedirect(res);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          (isTamil ? 'கூகிள் மூலம் பதிவு தோல்வியடைந்தது' : 'Google registration failed. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError(isTamil ? 'கூகிள் பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.' : 'Google sign-up failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Emblem / Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200 shadow-xs mb-1">
            <Shield className="w-8 h-8 text-[#F97316]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            {isTamil ? 'குடிமக்கள் கணக்கு பதிவு' : 'Citizen Registration'}
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] max-w-sm mx-auto">
            {isTamil
              ? 'தமிழ்நாடு உள்ளாட்சி குறைதீர்ப்பு தளத்தில் குடிமக்களாக இணைந்து புகாரளிக்கவும்.'
              : 'Create your Citizen account to report civic issues and track resolutions.'}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 sm:px-8 shadow-sm rounded-3xl border border-[#E7E5E4] space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* SECTION A: Real Google OAuth Registration */}
          <div className="flex justify-center">
            {isLoading ? (
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#E7E5E4] rounded-xl bg-white text-xs sm:text-sm font-bold text-[#171717] opacity-60 cursor-not-allowed"
              >
                <svg className="w-4 h-4 shrink-0 animate-pulse" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isTamil ? 'கூகிள் மூலம் பதிவு செய்கிறது…' : 'Signing up with Google…'}</span>
              </button>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                shape="pill"
                text="signup_with"
                width="360"
              />
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E7E5E4] w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-[#737373] uppercase tracking-wider shrink-0">
              {isTamil ? 'அல்லது சுயவிவரம் மூலம் பதிவு செய்க' : 'or register with details'}
            </span>
            <div className="border-t border-[#E7E5E4] w-full" />
          </div>

          {/* SECTION B: Manual Citizen Registration Form */}
          <form onSubmit={handleManualRegister} autoComplete="off" className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                {isTamil ? 'முழுப் பெயர்' : 'Full Name'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  name="register-full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isTamil ? 'எ.கா: ஆனந்த் குமார்' : 'e.g. Anand Kumar'}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                {isTamil ? 'மின்னஞ்சல் முகவரி' : 'Email Address'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  autoComplete="off"
                  name="register-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                {isTamil ? 'கடவுச்சொல்' : 'Password'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  name="register-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-[#737373] hover:text-[#171717] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                {isTamil ? 'குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்' : 'Must be at least 6 characters'}
              </span>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                {isTamil ? 'கடவுச்சொல்லை உறுதி செய்க' : 'Confirm Password'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  name="register-confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-[#737373] hover:text-[#171717] cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center py-3 text-xs sm:text-sm font-bold shadow-xs mt-2"
              isLoading={isLoading}
            >
              <span>{isTamil ? 'குடிமக்கள் கணக்கை உருவாக்குக' : 'Create Citizen Account'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* SECTION C: Navigation to Login */}
          <div className="pt-2 text-center border-t border-[#E7E5E4] text-xs text-[#737373]">
            <span>{isTamil ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?'} </span>
            <Link to="/login" className="font-bold text-[#F97316] hover:underline cursor-pointer">
              {isTamil ? 'உள்நுழையவும்' : 'Log in'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}