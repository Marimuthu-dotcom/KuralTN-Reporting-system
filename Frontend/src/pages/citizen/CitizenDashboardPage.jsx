// Frontend/src/pages/citizen/CitizenDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  Send,
  Edit3,
  Users,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useWard } from '../../hooks/useWard';
import { userService } from '../../services/userService';
import { complaintService } from '../../services/complaintService';
import { communityService } from '../../services/communityService';
import { StatCard } from '../../components/dashboard/StatCard';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { ActivityList } from '../../components/dashboard/ActivityList';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  AnimatedAlert,
  AnimatedCheckmark,
  AnimatedMegaphone,
} from '../../components/common/AnimatedIcons';

export function CitizenDashboardPage() {
  const { user, updateUser } = useAuth();
  const { t, isTamil } = useLanguage();
  const { wards } = useWard();
  const navigate = useNavigate();

  const [myComplaints, setMyComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ward membership verification form states
  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [reqFullName, setReqFullName] = useState(user?.full_name || '');
  const [reqPhone, setReqPhone] = useState(user?.phone || '');
  const [reqAddress, setReqAddress] = useState(user?.address_line || '');
  const [reqDistrict, setReqDistrict] = useState(user?.district_id || 'Chennai');
  const [reqWardNumber, setReqWardNumber] = useState(user?.ward_number || user?.ward_id?.replace('ward_', '') || '114');
  const [isSubmittingWard, setIsSubmittingWard] = useState(false);
  const [wardFormError, setWardFormError] = useState('');
  const [wardFormSuccess, setWardFormSuccess] = useState('');

  const isWardVerified = user?.is_ward_verified || user?.ward_verification_status === 'APPROVED';
  const wardStatus = user?.ward_verification_status || (isWardVerified ? 'APPROVED' : 'NOT_SUBMITTED');

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [complaintsRes, annData] = await Promise.all([
          complaintService.getComplaints({ limit: 100 }),
          user?.ward_id && isWardVerified ? communityService.getAnnouncements(user.ward_id) : Promise.resolve([]),
        ]);

        const all = complaintsRes.data || [];
        const userCreated = all.filter((c) => c.user_id === user?.id);
        setMyComplaints(userCreated);
        setAnnouncements(annData || []);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, [user, isWardVerified]);

  const handleSubmitWardRequest = async (e) => {
    e.preventDefault();
    setWardFormError('');
    setWardFormSuccess('');

    if (!reqFullName.trim() || !reqAddress.trim() || !reqWardNumber.trim()) {
      return setWardFormError(isTamil ? 'அனைத்து விவரங்களையும் பூர்த்தி செய்க' : 'Please provide all required fields');
    }

    setIsSubmittingWard(true);
    try {
      const res = await userService.submitWardMembershipRequest({
        full_name: reqFullName.trim(),
        phone: reqPhone.trim(),
        residential_address: reqAddress.trim(),
        district: reqDistrict,
        ward_number: reqWardNumber.trim(),
      });

      updateUser({
        full_name: reqFullName.trim(),
        phone: reqPhone.trim(),
        address_line: reqAddress.trim(),
        ward_verification_status: 'PENDING',
        is_ward_verified: false,
        claimed_ward_id: `ward_${reqWardNumber.trim()}`,
        ward_id: `ward_${reqWardNumber.trim()}`,
        ward_number: reqWardNumber.trim(),
        district_id: reqDistrict,
      });

      setIsEditingRequest(false);
      setWardFormSuccess(
        isTamil
          ? 'உங்கள் வார்டு உறுப்பினர் கோரிக்கை சமர்ப்பிக்கப்பட்டது! நிர்வாக ஒப்புதலுக்காக நிலுவையில் உள்ளது.'
          : 'Your Ward Community Membership request has been submitted for administrator review.'
      );
    } catch (err) {
      setWardFormError(err.response?.data?.message || err.message || 'Failed to submit ward membership request');
    } finally {
      setIsSubmittingWard(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const resolvedCount = myComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const inProgressCount = myComplaints.filter((c) => c.status === 'In Progress' || c.status === 'Acknowledged' || c.status === 'Under Review').length;
  const awaitingVerification = myComplaints.filter((c) => c.status === 'Resolution Proposed');

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={`${t('welcomeBack')}, ${user?.full_name}`}
        subtitle={
          isWardVerified
            ? `${t('residentOf')} Ward ${user?.ward_number || user?.ward_id?.replace('ward_', '') || ''} - ${user?.district_id || 'Tamil Nadu'}`
            : isTamil
            ? 'பொது குடிமக்கள் தளம் (வார்டு சரிபார்ப்பு நிலுவையில்)'
            : 'Citizen Portal (Ward Membership Unverified)'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/complaints">
              <Button variant="outline" size="md" className="text-sm py-2.5 px-3.5 border-orange-200 text-[#EA580C] hover:bg-orange-50 font-bold">
                🏛️ {t('navPublicFeed')}
              </Button>
            </Link>
            <Link to="/report">
              <Button variant="primary" size="md" icon={PlusCircle} className="text-sm py-2.5 px-4 shadow-sm">
                {t('navReport')}
              </Button>
            </Link>
          </div>
        }
      />

      {/* TASK 3: CITIZEN WARD COMMUNITY MEMBERSHIP STATUS & SUBMISSION WIDGET */}
      {isWardVerified ? (
        /* Status 1: Verified Ward Member */
        <div className="p-4 sm:p-5 bg-green-50 border border-green-200 text-green-950 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-green-700" />
            </div>
            <div className="text-xs">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-200 text-green-900 mb-0.5">
                <span>Verified Ward Member</span>
              </div>
              <span className="font-bold block text-sm text-green-900">
                {isTamil ? 'வார்டு சமூக அரங்கம் செயல்பாட்டில் உள்ளது' : `Ward ${user?.ward_number || user?.ward_id?.replace('ward_', '')} Resident Community Unlocked`}
              </span>
              <p className="text-green-800 leading-relaxed mt-0.5">
                {isTamil
                  ? 'உங்கள் குடியிருப்பு சரிபார்க்கப்பட்டது. நீங்கள் வார்டு மக்கள் கலந்துரையாடலில் பங்கேற்கலாம், வாக்கெடுப்பில் கலந்துகொள்ளலாம்.'
                  : 'Your residential status is officially verified. You can actively participate in ward community discussions and vote on local grievances.'}
              </p>
            </div>
          </div>
          <Link to="/ward">
            <Button variant="primary" size="sm" icon={Users} className="bg-green-700 hover:bg-green-800 whitespace-nowrap">
              {isTamil ? 'வார்டு அரங்கிற்கு செல்க' : 'Open Ward Community'}
            </Button>
          </Link>
        </div>
      ) : wardStatus === 'PENDING' && !isEditingRequest ? (
        /* Status 2: Request Pending Administrator Review */
        <div className="p-4 sm:p-5 bg-amber-50 border border-amber-200 text-amber-950 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-700" />
            </div>
            <div className="text-xs">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 mb-0.5">
                <span>Pending Administrator Review</span>
              </div>
              <span className="font-bold block text-sm text-amber-900">
                {isTamil
                  ? `வார்டு ${user?.ward_number || user?.claimed_ward_id?.replace('ward_', '') || '114'} உறுப்பினர் விண்ணப்பம் ஆய்வில் உள்ளது`
                  : `Ward Community Membership Request Submitted (Ward ${user?.ward_number || user?.claimed_ward_id?.replace('ward_', '') || '114'})`}
              </span>
              <p className="text-amber-800 leading-relaxed mt-0.5 max-w-2xl">
                {isTamil
                  ? 'உங்கள் முகவரி நகராட்சி நிர்வாகத்தால் சரிபார்க்கப்பட்டு வருகிறது. நீங்கள் பொதுப் புகார்களைப் பதிவு செய்யலாம், தமிழ்நாடு முழுவதற்குமான புகார்களைப் பார்வையிடலாம்.'
                  : 'Your territorial residency dossier is being reviewed by the System Administrator. Once approved, you will have exclusive access to Ward Community Chat and announcements.'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={Edit3}
            onClick={() => setIsEditingRequest(true)}
            className="border-amber-300 text-amber-900 hover:bg-amber-100 whitespace-nowrap shrink-0"
          >
            {isTamil ? 'விவரங்களை திருத்துக' : 'Edit Request'}
          </Button>
        </div>
      ) : wardStatus === 'REJECTED' && !isEditingRequest ? (
        /* Status 3: Request Declined */
        <div className="p-4 sm:p-5 bg-red-50 border border-red-200 text-red-950 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-red-700" />
            </div>
            <div className="text-xs">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-200 text-red-900 mb-0.5">
                <span>Verification Declined</span>
              </div>
              <span className="font-bold block text-sm text-red-900">
                {isTamil ? 'வார்டு குடியிருப்பு சரிபார்ப்பு நிராகரிக்கப்பட்டது' : 'Ward Membership Request Declined'}
              </span>
              <p className="text-red-800 leading-relaxed mt-0.5">
                {isTamil
                  ? `காரணம்: ${user?.rejection_reason || 'வழங்கப்பட்ட முகவரி மற்றும் வார்டு எண் பொருந்தவில்லை.'}`
                  : `Reason: ${user?.rejection_reason || 'The submitted address does not correspond to the requested ward territorial boundaries.'}`}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsEditingRequest(true)}
            className="bg-red-700 hover:bg-red-800 whitespace-nowrap shrink-0"
          >
            {isTamil ? 'மீண்டும் திருத்தி சமர்ப்பிக்க' : 'Update & Resubmit'}
          </Button>
        </div>
      ) : (
        /* Status 4: Request Form (NOT_SUBMITTED or Editing) */
        <div className="bg-white rounded-2xl border border-orange-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#171717]">
                  {isTamil ? 'வார்டு சமூக உறுப்பினர் சேர்க்கை விண்ணப்பம்' : 'Apply for Ward Community Membership'}
                </h3>
                <p className="text-xs text-[#737373] mt-0.5">
                  {isTamil
                    ? 'உங்கள் வார்டு விவாதங்கள் மற்றும் அறிவிப்புகளை அணுக உங்கள் குடியிருப்பு முகவரியைச் சமர்ப்பிக்கவும்.'
                    : 'Submit your residential details to unlock Ward Community discussions, grievance voting, and local announcements.'}
                </p>
              </div>
            </div>
            {isEditingRequest && (
              <button
                type="button"
                onClick={() => setIsEditingRequest(false)}
                className="text-xs text-neutral-500 hover:text-neutral-800 cursor-pointer"
              >
                ✕ Cancel
              </button>
            )}
          </div>

          {wardFormError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{wardFormError}</span>
            </div>
          )}

          {wardFormSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>{wardFormSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmitWardRequest} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#171717] uppercase tracking-wider text-[11px] mb-1">
                {isTamil ? 'முழுப் பெயர்' : 'Full Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reqFullName}
                onChange={(e) => setReqFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-1 focus:ring-[#F97316] focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-[#171717] uppercase tracking-wider text-[11px] mb-1">
                {isTamil ? 'கைபேசி எண்' : 'Phone Number'}
              </label>
              <input
                type="tel"
                value={reqPhone}
                onChange={(e) => setReqPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-1 focus:ring-[#F97316] focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#171717] uppercase tracking-wider text-[11px] mb-1">
                {isTamil ? 'குடியிருப்பு முகவரி' : 'Residential Street Address'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reqAddress}
                onChange={(e) => setReqAddress(e.target.value)}
                placeholder="e.g. 42, Bharathiyar Street, T. Nagar, Chennai"
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-1 focus:ring-[#F97316] focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-[#171717] uppercase tracking-wider text-[11px] mb-1">
                {isTamil ? 'மாவட்டம்' : 'District'} <span className="text-red-500">*</span>
              </label>
              <select
                value={reqDistrict}
                onChange={(e) => setReqDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-1 focus:ring-[#F97316] focus:bg-white cursor-pointer font-medium"
              >
                <option value="Chennai">Chennai</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Madurai">Madurai</option>
                <option value="Tiruchirappalli">Tiruchirappalli</option>
                <option value="Salem">Salem</option>
                <option value="Tirunelveli">Tirunelveli</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#171717] uppercase tracking-wider text-[11px] mb-1">
                {isTamil ? 'வார்டு எண்' : 'Ward Number'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reqWardNumber}
                onChange={(e) => setReqWardNumber(e.target.value)}
                placeholder="e.g. 114"
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-1 focus:ring-[#F97316] focus:bg-white font-medium"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmittingWard}
                icon={Send}
                className="shadow-xs"
              >
                {isTamil ? 'வார்டு உறுப்பினர் கோரிக்கையை சமர்ப்பிக்க' : 'Submit Ward Membership Request'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Awaiting Citizen Verification Alert Banner for resolved complaints */}
      {awaitingVerification.length > 0 && (
        <div className="p-4 sm:p-5 bg-amber-500 text-white rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AnimatedAlert className="w-7 h-7 text-white shrink-0" />
            <div className="text-xs">
              <span className="font-bold block text-sm sm:text-base">
                {t('actionRequiredBanner')}
              </span>
              <p className="opacity-95 leading-relaxed mt-0.5">
                {t('actionRequiredDesc')}
              </p>
            </div>
          </div>
          <Link to={`/complaints/${awaitingVerification[0].id}`}>
            <Button variant="secondary" size="sm" className="bg-neutral-900 text-white hover:bg-neutral-800 whitespace-nowrap">
              {t('reviewEvidenceBtn')}
            </Button>
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('myReports')}
          value={myComplaints.length}
          subtitle={isTamil ? 'நீங்கள் பதிவு செய்தவை' : 'Total tickets filed by you'}
          icon={FileText}
          variant="default"
          onClick={() => navigate('/my-complaints')}
        />
        <StatCard
          title={t('activeIssues')}
          value={inProgressCount}
          subtitle={isTamil ? 'ஆய்வில் அல்லது பணி நடப்பில்' : 'Under review or in progress'}
          icon={Clock}
          variant="primary"
          onClick={() => navigate('/my-complaints')}
        />
        <StatCard
          title={t('resolvedIssues')}
          value={resolvedCount}
          subtitle={isTamil ? 'மக்கள் உறுதிசெய்தவை' : 'Citizen-verified completions'}
          icon={CheckCircle2}
          variant="success"
          onClick={() => navigate('/my-complaints')}
        />
        <StatCard
          title={t('awaitingReview')}
          value={awaitingVerification.length}
          subtitle={isTamil ? 'உங்கள் ஒப்புதலுக்கு' : 'Resolutions pending your test'}
          icon={AlertTriangle}
          variant={awaitingVerification.length > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Two columns: Announcements & Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Ward Announcements (1 col) */}
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#171717] uppercase tracking-wider">
              <AnimatedMegaphone className="w-4 h-4 text-[#F97316]" />
              <span>{t('recentWardAnnouncements')}</span>
            </div>
            {isWardVerified && (
              <Link
                to="/ward/announcements"
                className="text-xs text-[#F97316] font-semibold hover:underline"
              >
                {t('viewAll')}
              </Link>
            )}
          </div>

          {!isWardVerified ? (
            <div className="text-center py-6 space-y-2">
              <Building2 className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-xs text-[#737373]">
                {isTamil
                  ? 'வார்டு கவுன்சிலரின் அறிவிப்புகளைப் பார்வையிட உங்கள் வார்டு குடியிருப்பை உறுதிப்படுத்தவும்.'
                  : 'Submit ward residency verification above to unlock local councillor announcements.'}
              </p>
            </div>
          ) : announcements.length === 0 ? (
            <p className="text-xs text-[#737373] text-center py-6">
              {isTamil
                ? 'உங்கள் வார்டு கவுன்சிலர் அறிவிப்புகள் எதுவும் வெளியிடவில்லை.'
                : 'No recent announcements published by your Ward Councillor.'}
            </p>
          ) : (
            <div className="space-y-3">
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="p-3 bg-neutral-50 rounded-xl border border-[#E7E5E4] text-xs space-y-1">
                  <div className="font-bold text-[#171717]">{a.title}</div>
                  <p className="text-[#737373] line-clamp-2 leading-relaxed">{a.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Recent Grievances (2 cols) */}
        <div className="lg:col-span-2">
          <ActivityList
            items={myComplaints.slice(0, 5)}
            title={isTamil ? 'என் சமீபத்திய புகார்கள்' : 'My Recent Grievances'}
          />
        </div>
      </div>
    </div>
  );
}
