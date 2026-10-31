// Frontend/src/pages/auth/OnboardingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { useWard } from '../../hooks/useWard';
import { useLanguage } from '../../hooks/useLanguage';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { AnimatedPin } from '../../components/common/AnimatedIcons';
import {
  CheckCircle2,
  Mail,
  ShieldAlert,
  Phone,
  KeyRound,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export function OnboardingPage() {
  const { user, updateUser, logout } = useAuth();
  const { wards } = useWard();
  const { t, isTamil } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    ward_id: user?.claimed_ward_id || user?.ward_id || '',
    address_line: user?.address_line || '',
    pincode: user?.pincode || '',
    phone: user?.phone || '',
    phone_verified: Boolean(user?.phone_verified),
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Mobile OTP verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpNotice, setOtpNotice] = useState('');
  const [otpError, setOtpError] = useState('');

  // Keep form full_name synced if user profile loads asynchronously
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: prev.full_name || user.full_name || '',
        ward_id: prev.ward_id || user.claimed_ward_id || user.ward_id || '',
        address_line: prev.address_line || user.address_line || '',
        pincode: prev.pincode || user.pincode || '',
        phone: prev.phone || user.phone || '',
        phone_verified: prev.phone_verified || Boolean(user.phone_verified),
      }));
    }
  }, [user]);

  const handleSendOtp = async () => {
    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrors((prev) => ({
        ...prev,
        phone: isTamil
          ? 'சரியான 10 இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும் (எ.கா: 9842100001)'
          : 'Please enter a valid 10-digit Indian mobile number (e.g. 9842100001)',
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, phone: undefined }));
    setIsSendingOtp(true);
    setOtpNotice('');
    setOtpError('');
    try {
      const res = await userService.sendPhoneOtp(cleanPhone);
      setOtpSent(true);
      setOtpNotice(
        isTamil
          ? `சரிபார்ப்பு குறியீடு அனுப்பப்பட்டது (சோதனை குறியீடு: ${res.demoOtp || '123456'})`
          : `Verification OTP sent to ${cleanPhone} (Test Code: ${res.demoOtp || '123456'})`
      );
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setOtpError(isTamil ? 'OTP குறியீட்டை உள்ளிடவும்' : 'Please enter the 6-digit OTP code');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');
    try {
      await userService.verifyPhoneOtp({
        phone: formData.phone.trim().replace(/\D/g, ''),
        otp: otpCode.trim(),
      });
      setFormData((prev) => ({ ...prev, phone_verified: true }));
      setOtpNotice(isTamil ? 'கைபேசி எண் வெற்றிகரமாக சரிபார்க்கப்பட்டது!' : 'Mobile number verified successfully!');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim() || formData.full_name.trim().length < 3) {
      newErrors.full_name = isTamil
        ? 'முழு பெயர் குறைந்தது 3 எழுத்துக்கள் கொண்டிருக்க வேண்டும்'
        : 'Full name must be at least 3 characters long';
    }

    if (!formData.ward_id) {
      newErrors.ward_id = isTamil
        ? 'உங்கள் குடியிருப்பு வார்டைத் தேர்ந்தெடுக்கவும்'
        : 'Please select your residential ward in Tamil Nadu';
    }

    if (!formData.address_line.trim() || formData.address_line.trim().length < 5) {
      newErrors.address_line = isTamil
        ? 'கதவு எண் மற்றும் தெரு முகவரி தேவை (குறைந்தது 5 எழுத்துக்கள்)'
        : 'Door number and street address are required (min 5 characters)';
    }

    const cleanPincode = formData.pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
      newErrors.pincode = isTamil
        ? 'சரியான 6 இலக்க அஞ்சல் குறியீட்டை உள்ளிடவும் (எ.கா: 628008)'
        : 'Please enter a valid 6-digit postal pincode (e.g. 628008)';
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = isTamil
        ? 'சரியான 10 இலக்க கைபேசி எண் தேவை'
        : 'Valid 10-digit Indian mobile number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const updatedUser = await userService.completeOnboarding({
        full_name: formData.full_name.trim(),
        ward_id: formData.ward_id,
        address_line: formData.address_line.trim(),
        pincode: formData.pincode.trim(),
        phone: formData.phone.trim().replace(/\D/g, ''),
        phone_verified: formData.phone_verified,
      });

      updateUser(updatedUser);

      // Transition to verification pending page based on policy
      navigate('/verification-pending', { replace: true });
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          (isTamil ? 'வார்டு பதிவு தோல்வியடைந்தது' : 'Failed to complete personal registration')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={logout}
          className="text-xs text-[#737373] hover:text-[#171717] cursor-pointer"
        >
          &larr; {isTamil ? 'வேறு கணக்கில் நுழைக' : 'Switch Google Account'}
        </button>
        <LanguageToggle />
      </div>

      {/* Verified Google Account Badge */}
      <div className="bg-neutral-50 border border-[#E7E5E4] rounded-xl p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-full bg-white border border-[#E7E5E4] flex items-center justify-center shrink-0">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            )}
          </div>
          <div className="truncate">
            <span className="text-[#737373] text-[10px] block uppercase font-bold tracking-wider">
              {isTamil ? 'கூகிள் சரிபார்க்கப்பட்ட கணக்கு' : 'Google Authenticated Identity'}
            </span>
            <span className="font-semibold text-[#171717] truncate">{user?.email}</span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803D] bg-green-50 px-2 py-0.5 rounded-md shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
          <span>{isTamil ? 'சரிபார்க்கப்பட்டது' : 'Verified'}</span>
        </span>
      </div>

      <div className="text-center space-y-1">
        <div className="inline-flex p-3 bg-orange-100 text-[#F97316] rounded-2xl mb-2">
          <AnimatedPin className="w-8 h-8 text-[#F97316]" />
        </div>
        <h1 className="text-xl font-bold text-[#171717]">
          {isTamil ? 'உங்கள் குடியிருப்பு வார்டைத் தேர்வு செய்க' : 'Select Your Residential Ward'}
        </h1>
        <p className="text-xs text-[#737373]">
          {isTamil
            ? 'வார்டு பிரச்சனைகளில் ஆதரவு தெரிவிக்கவும் கருத்துப் பகிரவும் சரிபார்க்கப்பட்ட வார்டு முகவரி அவசியம்.'
            : 'Grievance participation and community discussions are restricted to verified residents of each ward.'}
        </p>
      </div>

      {submitError && (
        <div className="p-3 bg-red-50 border border-red-200 text-[#B91C1C] rounded-lg text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Ward Selection Residency Disclaimer */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">
            {isTamil ? 'வார்டு தேர்வு விளக்கம்:' : 'Ward Verification Notice:'}{' '}
          </span>
          {isTamil
            ? 'வார்டைத் தேர்ந்தெடுப்பது மட்டுமே குடியிருப்புக்கான முழுமையான சான்றாகாது. உங்கள் முகவரி நகராட்சி நிர்வாகத்தால் சரிபார்க்கப்பட்ட பிறகே வார்டு அளவிலான முழு உரிமைகள் வழங்கப்படும்.'
            : 'Selecting a ward claims residency but does not automatically prove it. Your claimed ward will be submitted for municipal administrative review before full voting rights are unlocked.'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={isTamil ? 'உங்கள் முழு பெயர்' : 'Your Full Name'}
          required
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          error={errors.full_name}
          placeholder="e.g. S. Arumugam"
        />

        <Select
          label={isTamil ? 'தமிழ்நாடு வார்டு பட்டியல்' : 'Select Your Tamil Nadu Ward'}
          required
          placeholder={isTamil ? 'வார்டைத் தேர்வு செய்க' : 'Choose ward'}
          value={formData.ward_id}
          options={wards.map((w) => ({
            value: w.id,
            label: `${w.ward_name} (Ward ${w.ward_number}) - ${w.district_name}`,
          }))}
          onChange={(e) => setFormData({ ...formData, ward_id: e.target.value })}
          error={errors.ward_id}
          helperText={
            isTamil
              ? 'உங்கள் தெரு உள்ள வார்டு எண்ணைத் தேர்வு செய்யவும்.'
              : 'Select the ward corresponding to your current street address.'
          }
        />

        <Input
          label={isTamil ? 'கதவு எண் & தெரு முகவரி' : 'Door No. & Street Address'}
          required
          placeholder={isTamil ? 'எ.கா: 42/A, மில்லர்புரம் 2வது தெரு' : 'e.g. 42/A, Millerpuram 2nd Street'}
          value={formData.address_line}
          onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
          error={errors.address_line}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={isTamil ? 'அஞ்சல் குறியீடு (Pincode)' : 'Postal Pincode'}
            required
            placeholder="e.g. 628008"
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            error={errors.pincode}
          />

          <div className="space-y-1">
            <Input
              label={isTamil ? 'கைபேசி எண் (Mobile)' : 'Mobile Phone'}
              required
              placeholder="e.g. 9842100001"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
            />
          </div>
        </div>

        {/* Mobile OTP Verification Sub-flow */}
        <div className="bg-neutral-50 border border-[#E7E5E4] rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#F97316]" />
              <span>{isTamil ? 'கைபேசி எண் சரிபார்ப்பு (OTP)' : 'Mobile Number Verification (OTP)'}</span>
            </div>

            {formData.phone_verified ? (
              <span className="text-[11px] font-bold text-[#15803D] bg-green-100 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{isTamil ? 'சரிபார்க்கப்பட்டது' : 'Verified'}</span>
              </span>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleSendOtp}
                isLoading={isSendingOtp}
                disabled={!formData.phone.trim()}
              >
                {otpSent
                  ? isTamil
                    ? 'மீண்டும் OTP அனுப்புக'
                    : 'Resend OTP'
                  : isTamil
                  ? 'OTP குறியீடு பெறுக'
                  : 'Send OTP'}
              </Button>
            )}
          </div>

          {otpNotice && (
            <div className="text-[11px] text-[#15803D] bg-green-50 p-2 rounded border border-green-200 font-medium">
              {otpNotice}
            </div>
          )}

          {otpError && (
            <div className="text-[11px] text-[#B91C1C] bg-red-50 p-2 rounded border border-red-200 font-medium">
              {otpError}
            </div>
          )}

          {otpSent && !formData.phone_verified && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder={isTamil ? '6 இலக்க OTP' : '6-digit OTP'}
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-32 px-3 py-1.5 text-xs font-mono font-bold bg-white border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              />
              <Button
                type="button"
                variant="primary"
                size="xs"
                onClick={handleVerifyOtp}
                isLoading={isVerifyingOtp}
              >
                {isTamil ? 'சரிபார்' : 'Verify'}
              </Button>
            </div>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            {isTamil ? 'வார்டு உறுப்பினர் பதிவை உறுதிசெய்க' : 'Confirm Ward Membership & Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
}
