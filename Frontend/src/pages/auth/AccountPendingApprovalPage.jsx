// Frontend/src/pages/auth/AccountPendingApprovalPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { userService } from '../../services/userService';
import { Button } from '../../components/common/Button';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import {
  Clock,
  ShieldCheck,
  UserCheck,
  Building2,
  Mail,
  User,
  RefreshCw,
  LogOut,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { KuralLogo } from '../../components/common/KuralLogo';

export function AccountPendingApprovalPage() {
  const { user, updateUser, logout } = useAuth();
  const { t, isTamil } = useLanguage();
  const navigate = useNavigate();

  const [isChecking, setIsChecking] = useState(false);
  const [notice, setNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setNotice('');
    setErrorNotice('');
    try {
      const profile = await userService.getProfile();
      updateUser(profile);

      if (profile.approval_status === 'APPROVED' && profile.role !== 'PENDING') {
        setNotice(
          isTamil
            ? `உங்கள் கணக்கு அங்கீகரிக்கப்பட்டது (${profile.role})! முகப்புக்கு அழைத்துச் செல்கிறோம்...`
            : `Account approved as ${profile.role.replace(/_/g, ' ')}! Redirecting to dashboard...`
        );
        setTimeout(() => {
          if (profile.role === 'WARD_COUNCILLOR') navigate('/councillor', { replace: true });
          else if (profile.role === 'ADMIN') navigate('/admin', { replace: true });
          else if (profile.role === 'DEPARTMENT_HANDLER') navigate('/councillor/assignments', { replace: true });
          else if (profile.role === 'ACCOUNTABILITY_REVIEWER') navigate('/reviewer', { replace: true });
          else navigate('/dashboard', { replace: true });
        }, 1200);
      } else if (profile.approval_status === 'REJECTED') {
        setErrorNotice(
          isTamil
            ? 'உங்கள் கணக்கு விண்ணப்பம் நிர்வாகத்தால் நிராகரிக்கப்பட்டது.'
            : 'Your account registration was declined by the system administrator.'
        );
      } else {
        setNotice(
          isTamil
            ? 'சரிபார்ப்பு இன்னும் நிலுவையில் உள்ளது. முதன்மை நிர்வாகி விரைவில் சரிபார்ப்பார்.'
            : 'Verification is currently pending. The System Administrator will review your account shortly.'
        );
      }
    } catch (err) {
      setErrorNotice(err.response?.data?.message || 'Failed to refresh status from server.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const isRejected = user?.approval_status === 'REJECTED';
  const isSuspended = user?.approval_status === 'SUSPENDED';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold tracking-wider uppercase text-[#737373]">
          {isTamil ? 'அங்கீகார நிலை' : 'Access Authorization'}
        </span>
        <LanguageToggle />
      </div>

      {/* Main Status Header Card */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-xs">
          {isRejected ? (
            <AlertCircle className="w-8 h-8 text-[#B91C1C]" />
          ) : isSuspended ? (
            <Lock className="w-8 h-8 text-[#B91C1C]" />
          ) : (
            <Clock className="w-8 h-8 text-[#D97706] animate-pulse" />
          )}
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
            {isRejected
              ? isTamil
                ? 'கணக்கு விண்ணப்பம் நிராகரிக்கப்பட்டது'
                : 'Registration Application Declined'
              : isSuspended
              ? isTamil
                ? 'கணக்கு தற்காலிகமாக நிறுத்தப்பட்டுள்ளது'
                : 'Account Suspended'
              : isTamil
              ? 'நிர்வாகியின் ஒப்புதலுக்காக காத்திருக்கிறது'
              : 'Account Pending Administrator Approval'}
          </h1>
          <p className="text-xs text-[#737373] max-w-sm mx-auto mt-1 leading-relaxed">
            {isRejected
              ? isTamil
                ? 'உங்கள் கணக்கு விண்ணப்பம் நிர்வாகப் பரிசீலனையில் நிராகரிக்கப்பட்டது. கூடுதல் தகவலுக்கு மக்கள் குறைதீர்ப்பு மையத்தை தொடர்பு கொள்ளவும்.'
                : 'Your registration request could not be approved at this time. Please contact municipal administration for inquiries.'
              : isSuspended
              ? isTamil
                ? 'உங்கள் கணக்கு அணுகல் நிர்வாகத்தால் நிறுத்தப்பட்டுள்ளது.'
                : 'Your application access has been restricted by system governance.'
              : isTamil
              ? 'தமிழ்நாடு நகராட்சி பாதுகாப்பு நெறிமுறைகளின்படி, அனைத்து புதிய பயனர்களும் கணினி நிர்வாகியால் சரிபார்க்கப்பட்டு பாத்திரம் ஒதுக்கப்பட்ட பின்னரே உள்ளடக்கங்களை அணுக முடியும்.'
              : 'In accordance with Tamil Nadu municipal security governance, a System Administrator must verify your credentials and assign an authorized application role before website access is granted.'}
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-green-50 border border-green-200 text-[#15803D] rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-[#B91C1C] rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Account Registration Dossier */}
      <div className="bg-[#FAF9F6] rounded-2xl border border-[#E7E5E4] p-5 space-y-3.5 text-xs">
        <div className="text-[11px] font-bold text-[#171717] uppercase tracking-wider border-b border-[#E7E5E4] pb-2 flex items-center justify-between">
          <span>{isTamil ? 'பதிவு செய்யப்பட்ட விவரங்கள்' : 'Registration Submission Dossier'}</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
            {user?.approval_status || 'PENDING_APPROVAL'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="text-[#737373] block text-[11px]">{isTamil ? 'முழு பெயர்' : 'Full Name'}</span>
            <div className="font-bold text-[#171717] mt-0.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#737373]" />
              <span>{user?.full_name || 'Registered User'}</span>
            </div>
          </div>

          <div>
            <span className="text-[#737373] block text-[11px]">{isTamil ? 'கூகிள் மின்னஞ்சல்' : 'Google Verified Email'}</span>
            <div className="font-bold text-[#171717] mt-0.5 flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-[#737373]" />
              <span className="truncate">{user?.email || 'N/A'}</span>
            </div>
          </div>

          <div>
            <span className="text-[#737373] block text-[11px]">{isTamil ? 'ஒதுக்கப்பட்ட பாத்திரம்' : 'Assigned Role'}</span>
            <div className="font-bold text-amber-700 mt-0.5">
              {user?.role && user.role !== 'PENDING' ? user.role.replace(/_/g, ' ') : 'Unassigned (Awaiting Administrator Approval)'}
            </div>
          </div>

          <div>
            <span className="text-[#737373] block text-[11px]">{isTamil ? 'பதிவு தேதி' : 'Registration Date'}</span>
            <div className="font-medium text-[#171717] mt-0.5">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="space-y-2.5 pt-1">
        <Button
          type="button"
          variant="primary"
          size="md"
          className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C]"
          isLoading={isChecking}
          onClick={handleCheckStatus}
        >
          <RefreshCw className="w-4 h-4" />
          <span>{isTamil ? 'ஒப்புதல் நிலையை சரிபார்க்கவும்' : 'Check Approval Status Now'}</span>
        </Button>

        <div className="flex gap-2">
          <Link
            to="/complaints"
            className="flex-1 py-2 px-3 text-center text-xs font-semibold rounded-xl border border-[#E7E5E4] text-[#171717] hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-[#737373]" />
            <span>{isTamil ? 'பொது புகார்கள்' : 'Public Feed'}</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex-1 py-2 px-3 text-center text-xs font-semibold rounded-xl border border-[#E7E5E4] text-[#737373] hover:text-[#B91C1C] hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('navSignOut')}</span>
          </button>
        </div>
      </div>

      <div className="text-[11px] text-[#737373] text-center pt-2 border-t border-[#E7E5E4]">
        {isTamil
          ? 'நிர்வாகியின் சரிபார்ப்பு முடிந்ததும் உங்கள் கணக்கு தானாகச் செயல்படும்.'
          : 'Once approved by the System Administrator, your account will instantly gain full role-permitted access.'}
      </div>
    </div>
  );
}
