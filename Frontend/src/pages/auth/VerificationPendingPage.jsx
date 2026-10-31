// Frontend/src/pages/auth/VerificationPendingPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWard } from '../../hooks/useWard';
import { useLanguage } from '../../hooks/useLanguage';
import { userService } from '../../services/userService';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import {
  Clock,
  ShieldCheck,
  Building,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  RefreshCw,
  LogOut,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { AnimatedShield, AnimatedPin } from '../../components/common/AnimatedIcons';

export function VerificationPendingPage() {
  const { user, updateUser, logout } = useAuth();
  const { wards } = useWard();
  const { t, isTamil } = useLanguage();
  const navigate = useNavigate();

  const [isChecking, setIsChecking] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [notice, setNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  const assignedWard = wards.find((w) => w.id === (user?.claimed_ward_id || user?.ward_id));
  const isRejected = user?.ward_verification_status === 'REJECTED';

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setNotice('');
    setErrorNotice('');
    try {
      const profile = await userService.getProfile();
      updateUser(profile);
      if (profile.is_ward_verified || profile.ward_verification_status === 'VERIFIED') {
        setNotice(
          isTamil
            ? 'உங்கள் வார்டு குடியிருப்பு சரிபார்க்கப்பட்டது! தளத்திற்கு அழைத்துச் செல்கிறோம்...'
            : 'Your ward residency has been verified! Redirecting to dashboard...'
        );
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1200);
      } else {
        setNotice(
          isTamil
            ? 'சரிபார்ப்பு இன்னும் நிலுவையில் உள்ளது. நகராட்சி நிர்வாகம் பரிசீலித்து வருகிறது.'
            : 'Verification is still in progress. The ward administration is reviewing your details.'
        );
      }
    } catch (err) {
      setErrorNotice(err.response?.data?.message || 'Failed to check verification status');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSimulateApproval = async () => {
    if (!user?.id) return;
    setIsSimulating(true);
    setNotice('');
    setErrorNotice('');
    try {
      await api.post(`/admin/users/${user.id}/verify-ward`, {
        status: 'APPROVED',
        reason: 'Authorized simulated municipal resident verification',
      });
      const profile = await userService.getProfile();
      updateUser(profile);
      setNotice(
        isTamil
          ? 'நகராட்சி நிர்வாகம் உங்கள் வார்டு குடியிருப்பை அதிகாரப்பூர்வமாக உறுதிப்படுத்தியது! குடிமக்கள் பக்கத்திற்கு செல்கிறது...'
          : 'Residency officially approved by Municipal Administration! Redirecting to Citizen Dashboard...'
      );
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1200);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || 'Failed to simulate verification');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-xs font-semibold text-[#737373] hover:text-[#171717]">
          &larr; {isTamil ? 'முகப்புக்குத் திரும்பு' : 'Back to Public Home'}
        </Link>
        <LanguageToggle />
      </div>

      {/* Main Status Header Card */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 sm:p-8 shadow-xs text-center space-y-4">
        <div className="inline-flex p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
          {isRejected ? (
            <AlertCircle className="w-10 h-10 text-red-500" />
          ) : (
            <AnimatedShield className="w-10 h-10 text-[#F97316]" />
          )}
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {isRejected
                ? isTamil
                  ? 'வார்டு சரிபார்ப்பு நிராகரிக்கப்பட்டது'
                  : 'Ward Verification Declined'
                : isTamil
                ? 'வார்டு குடியிருப்பு சரிபார்ப்பு நிலுவையில் உள்ளது'
                : 'Ward Residency Verification Pending'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
            {isRejected
              ? isTamil
                ? 'உங்கள் வார்டு முகவரி மறுஆய்வு தேவைப்படுகிறது'
                : 'Address Verification Requires Re-submission'
              : isTamil
              ? 'உங்கள் விண்ணப்பம் நகராட்சி ஆய்வில் உள்ளது'
              : 'Your Registration is Under Administrative Review'}
          </h1>

          <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
            {isRejected
              ? isTamil
                ? 'வழங்கப்பட்ட முகவரி மற்றும் வார்டு எண் பொருந்தவில்லை. உங்கள் சரியான வார்டு விவரங்களை மீண்டும் பதிவு செய்யவும்.'
                : 'The submitted residential address could not be verified for this ward. Please re-check your ward details and re-submit.'
              : isTamil
              ? 'தமிழ்நாடு நகராட்சி சட்டப்படி, வார்டு சார்ந்த விவாதங்கள் மற்றும் வாக்கெடுப்பில் பங்கேற்க உள்ளூர் குடியிருப்புச் சான்று சரிபார்ப்பு அவசியம்.'
              : 'In accordance with Tamil Nadu municipal governance, participation in private ward discussions and grievance voting requires verified territorial residency.'}
          </p>
        </div>

        {notice && (
          <div className="p-3 bg-green-50 border border-green-200 text-[#15803D] rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {errorNotice && (
          <div className="p-3 bg-red-50 border border-red-200 text-[#B91C1C] rounded-xl text-xs font-semibold">
            {errorNotice}
          </div>
        )}

        {/* Submitted Information Summary */}
        <div className="bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl p-4 text-left space-y-3 text-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#737373] border-b border-[#E7E5E4] pb-1.5">
            {isTamil ? 'பதிவு செய்யப்பட்ட விவரங்கள்' : 'Submitted Resident Dossier'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[#737373] block text-[11px]">{isTamil ? 'பெயர்' : 'Full Name'}</span>
              <span className="font-bold text-[#171717] flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-[#F97316]" />
                {user?.full_name || 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-[#737373] block text-[11px]">{isTamil ? 'கூகிள் மின்னஞ்சல்' : 'Google Verified Email'}</span>
              <span className="font-bold text-[#171717] flex items-center gap-1.5 mt-0.5 truncate">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                {user?.email || 'N/A'}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[#737373] block text-[11px]">{isTamil ? 'கோரப்பட்ட வார்டு' : 'Claimed Territorial Ward'}</span>
              <span className="font-bold text-[#171717] flex items-center gap-1.5 mt-0.5">
                <Building className="w-3.5 h-3.5 text-[#F97316]" />
                {assignedWard
                  ? `${assignedWard.ward_name} (Ward ${assignedWard.ward_number}) - ${assignedWard.district_name}`
                  : `Ward ID: ${user?.claimed_ward_id || user?.ward_id || 'Not specified'}`}
              </span>
            </div>

            <div>
              <span className="text-[#737373] block text-[11px]">{isTamil ? 'முகவரி' : 'Street Address'}</span>
              <span className="font-medium text-[#171717] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#737373]" />
                {user?.address_line || 'Pending update'}
              </span>
            </div>

            <div>
              <span className="text-[#737373] block text-[11px]">{isTamil ? 'கைபேசி & அஞ்சல் குறியீடு' : 'Phone & Pincode'}</span>
              <span className="font-medium text-[#171717] flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-[#737373]" />
                {user?.phone ? `${user.phone} (${user.pincode || 'Pincode'})` : 'N/A'}
                {user?.phone_verified && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.2 rounded font-bold">
                    OTP Verified
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-2">
          {isRejected ? (
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => navigate('/onboarding')}
            >
              {isTamil ? 'மீண்டும் வார்டு மற்றும் முகவரியை பதிவு செய்க' : 'Update Residential Details in Onboarding'}
            </Button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button
                variant="outline"
                size="md"
                className="w-full"
                icon={RefreshCw}
                isLoading={isChecking}
                onClick={handleCheckStatus}
              >
                {isTamil ? 'நிலையைச் சரிபார்க்க' : 'Check Verification Status'}
              </Button>

              <Button
                variant="primary"
                size="md"
                className="w-full bg-[#15803D] hover:bg-[#166534]"
                icon={ShieldCheck}
                isLoading={isSimulating}
                onClick={handleSimulateApproval}
              >
                {isTamil ? 'மாதிரி அங்கீகாரம் (Quick Verify)' : 'Simulate Admin Approval'}
              </Button>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 pt-1">
            <Link
              to="/complaints"
              className="text-xs font-semibold text-[#F97316] hover:underline flex items-center gap-1"
            >
              <span>{isTamil ? 'பொதுப் புகார்களைப் பார்வையிடு' : 'Browse Public Complaints Feed'}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <span className="text-neutral-300">&bull;</span>

            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs text-[#737373] hover:text-[#171717] flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>{isTamil ? 'வெளியேறு' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Public Features Allowed While Pending */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
          {isTamil ? 'தற்போது நீங்கள் பயன்படுத்தக்கூடிய பொதுச் சேவைகள்' : 'Services Available to You Right Now'}
        </h3>
        <p className="text-xs text-[#737373] leading-relaxed">
          {isTamil
            ? 'வார்டு சரிபார்ப்பு முடியும் வரையிலும், தமிழ்நாடு முழுவதற்குமான பொதுப் புகார்கள், துறைகளின் தொடர்பு எண்கள் மற்றும் வழிகாட்டிகளை நீங்கள் பார்வையிடலாம்.'
            : 'While territorial verification takes place, you can freely browse all public complaints across Tamil Nadu, explore municipal department helplines, and track city resolution progress.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          <Link
            to="/complaints"
            className="p-3 rounded-xl border border-[#E7E5E4] hover:border-[#F97316] bg-neutral-50 hover:bg-orange-50/50 transition-all flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-[#171717]">
                {isTamil ? 'தமிழ்நாடு பொதுப் புகார் பதிவேடு' : 'Tamil Nadu Public Feed'}
              </div>
              <div className="text-[11px] text-[#737373]">
                {isTamil ? 'அனைத்து புகார்கள் & தீர்வுகள்' : 'All public complaints & timelines'}
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#F97316]" />
          </Link>

          <Link
            to="/departments"
            className="p-3 rounded-xl border border-[#E7E5E4] hover:border-[#F97316] bg-neutral-50 hover:bg-orange-50/50 transition-all flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-[#171717]">
                {isTamil ? 'அரசுத் துறைகள் & தொலைபேசி' : 'Departments & Helplines'}
              </div>
              <div className="text-[11px] text-[#737373]">
                {isTamil ? 'அதிகாரிகள் & சேவை காலக்கெடு' : 'Officers & standard SLAs'}
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#F97316]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
