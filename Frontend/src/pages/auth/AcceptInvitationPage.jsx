// Frontend/src/pages/auth/AcceptInvitationPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { authService } from '../../services/authService';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ShieldCheck,
  AlertCircle,
  Building,
  Briefcase,
  Lock,
  User,
  AtSign,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
} from 'lucide-react';

export function AcceptInvitationPage() {
  const [searchParams] = useLanguage() && useSearchParams();
  const token = searchParams.get('token') || '';
  const { acceptInvitation, loginWithGoogle } = useAuth();
  const { isTamil } = useLanguage();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState('');

  // Form states for password setup
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    async function fetchInvitation() {
      if (!token) {
        setVerifyError(
          isTamil
            ? 'அழைப்புக் குறியீடு (Token) விடுபட்டுள்ளது. தயவுசெய்து உங்கள் அழைப்பு இணைப்பைச் சரிபார்க்கவும்.'
            : 'Invitation token is missing. Please check your invitation link.'
        );
        setIsVerifying(false);
        return;
      }

      setIsVerifying(true);
      setVerifyError('');
      try {
        const data = await authService.getInvitation(token);
        setInvitation(data);
        if (data.full_name) {
          const suggested = data.full_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
          setUsername(suggested);
        }
      } catch (err) {
        setVerifyError(
          err.response?.data?.message ||
            err.message ||
            (isTamil
              ? 'இந்த அழைப்பு காலாவதியானது அல்லது செல்லுபடியாகாது.'
              : 'This invitation is invalid, expired, or has already been revoked.')
        );
      } finally {
        setIsVerifying(false);
      }
    }

    fetchInvitation();
  }, [token, isTamil]);

  const handlePostAuthRedirect = (role) => {
    if (role === 'WARD_COUNCILLOR') {
      navigate('/councillor', { replace: true });
    } else if (role === 'DEPARTMENT_HANDLER') {
      navigate('/councillor/assignments', { replace: true });
    } else if (role === 'ADMIN') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleAcceptWithPassword = async (e) => {
    e.preventDefault();
    setActionError('');

    if (!username.trim()) {
      return setActionError(isTamil ? 'பயனர் பெயரை உள்ளிடவும்' : 'Please choose a username');
    }
    if (!password || password.length < 6) {
      return setActionError(isTamil ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்' : 'Password must be at least 6 characters');
    }
    if (password !== confirmPassword) {
      return setActionError(isTamil ? 'கடவுச்சொற்கள் பொருந்தவில்லை' : 'Passwords do not match');
    }

    setIsSubmitting(true);
    try {
      const res = await acceptInvitation({
        token,
        username: username.trim(),
        password,
      });
      handlePostAuthRedirect(res.user?.role || invitation.role);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to accept invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptWithGoogle = async () => {
    setActionError('');
    setIsSubmitting(true);
    try {
      // Create Google JWT matching invitation email
      const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
      const payload = btoa(
        JSON.stringify({
          sub: `google_inv_${token.substring(0, 10)}`,
          email: invitation.email,
          name: invitation.full_name,
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          email_verified: true,
          iss: 'https://accounts.google.com',
          aud: 'tn-civic-applet',
        })
      );
      const signature = btoa('mock_secure_invitation_signature');
      const credential = `${header}.${payload}.${signature}`;

      const res = await loginWithGoogle(credential, null, 'login', token);
      handlePostAuthRedirect(res.user?.role || invitation.role);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to accept with Google account');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center py-12 px-4">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-semibold text-[#737373]">
            {isTamil ? 'அழைப்பு சரிபார்க்கப்படுகிறது...' : 'Validating official invitation...'}
          </p>
        </div>
      </div>
    );
  }

  if (verifyError || !invitation) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 px-4 sm:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900">
                {isTamil ? 'செல்லுபடியாகாத அழைப்பு' : 'Invalid or Expired Invitation'}
              </h2>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                {verifyError || 'This invitation could not be verified. Please ask your System Administrator to issue a new invitation.'}
              </p>
            </div>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="primary" size="md" className="w-full justify-center">
                  {isTamil ? 'உள்நுழைவுப் பக்கத்திற்கு செல்க' : 'Go to Login'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isCouncillor = invitation.role === 'WARD_COUNCILLOR';
  const isDeptHandler = invitation.role === 'DEPARTMENT_HANDLER';

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200 shadow-xs mb-1">
            <ShieldCheck className="w-8 h-8 text-[#F97316]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-[#EA580C]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isTamil ? 'அதிகாரப்பூர்வ அழைப்பு' : 'Official Portal Invitation'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            {isTamil ? 'உங்கள் அதிகாரப்பூர்வ கணக்கை அமைக்குக' : 'Accept Invitation & Activate Account'}
          </h1>
          <p className="text-xs sm:text-sm text-[#737373]">
            {isTamil
              ? 'தமிழ்நாடு உள்ளாட்சி குறைதீர்ப்பு தளத்தில் உங்கள் பதவியை செயல்படுத்தவும்.'
              : 'You have been invited by the System Administrator to join KuralTN.'}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm rounded-3xl border border-[#E7E5E4] space-y-6">
          {actionError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{actionError}</div>
            </div>
          )}

          {/* Invitation Details Summary Card */}
          <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200/80 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-orange-900 border-b border-orange-200/60 pb-1.5">
              {isTamil ? 'அழைப்பு விவரங்கள்' : 'Invitation Credentials'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#737373] block text-[11px]">{isTamil ? 'முழுப் பெயர்' : 'Full Name'}</span>
                <span className="font-bold text-[#171717]">{invitation.full_name}</span>
              </div>

              <div>
                <span className="text-[#737373] block text-[11px]">{isTamil ? 'மின்னஞ்சல்' : 'Invited Email'}</span>
                <span className="font-bold text-[#171717]">{invitation.email}</span>
              </div>

              <div>
                <span className="text-[#737373] block text-[11px]">{isTamil ? 'பதவி / பங்கு' : 'Assigned Role'}</span>
                <span className="inline-block px-2 py-0.5 mt-0.5 text-[11px] font-mono font-bold bg-white text-orange-700 border border-orange-200 rounded">
                  {invitation.role.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                {isCouncillor && (
                  <>
                    <span className="text-[#737373] block text-[11px]">{isTamil ? 'வார்டு & மாவட்டம்' : 'Territory'}</span>
                    <span className="font-bold text-[#171717] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      Ward {invitation.ward_number || invitation.ward_id}, {invitation.district_id || 'Tamil Nadu'}
                    </span>
                  </>
                )}
                {isDeptHandler && (
                  <>
                    <span className="text-[#737373] block text-[11px]">{isTamil ? 'துறை & பதவி' : 'Department & Post'}</span>
                    <span className="font-bold text-[#171717] flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5 text-orange-500" />
                      {invitation.department_name || invitation.department_id || 'Municipal Works'} - {invitation.designation || 'Staff'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Option A: Quick Activation via Matching Google Account */}
          <div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleAcceptWithGoogle}
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
              <span>
                {isTamil
                  ? `கூகிள் (${invitation.email}) மூலம் இணைக்க`
                  : `Connect & Activate with Google (${invitation.email})`}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E7E5E4] w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-[#737373] uppercase tracking-wider shrink-0">
              {isTamil ? 'அல்லது கடவுச்சொல் அமைத்து செயல்படுத்துக' : 'or set up password'}
            </span>
            <div className="border-t border-[#E7E5E4] w-full" />
          </div>

          {/* Option B: Set Password & Username */}
          <form onSubmit={handleAcceptWithPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                {isTamil ? 'பயனர் பெயர் (Username)' : 'Username'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="official_username"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                {isTamil ? 'புதிய கடவுச்சொல்' : 'Choose Password'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                {isTamil ? 'கடவுச்சொல்லை உறுதி செய்க' : 'Confirm Password'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              isLoading={isSubmitting}
            >
              <span>{isTamil ? 'கணக்கை செயல்படுத்தி நுழைக' : 'Activate Account & Access Portal'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-[#E7E5E4]">
            <Link to="/login" className="text-xs text-[#737373] hover:text-[#171717]">
              &larr; {isTamil ? 'வழக்கமான உள்நுழைவுக்கு செல்க' : 'Back to Standard Login'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
