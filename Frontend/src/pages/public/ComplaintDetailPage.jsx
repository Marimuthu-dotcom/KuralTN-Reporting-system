// Frontend/src/pages/public/ComplaintDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building,
  Calendar,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import { ComplaintStatusBadge } from '../../components/complaints/ComplaintStatusBadge';
import { DeadlineIndicator } from '../../components/complaints/DeadlineIndicator';
import { ComplaintImages } from '../../components/complaints/ComplaintImages';
import { ComplaintMap } from '../../components/complaints/ComplaintMap';
import { ComplaintTimeline } from '../../components/complaints/ComplaintTimeline';
import { CommentSection } from '../../components/complaints/CommentSection';
import { OfficialUpdates } from '../../components/complaints/OfficialUpdates';
import { ResolutionReview } from '../../components/complaints/ResolutionReview';
import { SupportButton } from '../../components/complaints/SupportButton';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/dateUtils';
import { canUserEscalate } from '../../utils/permissions';
import { AnimatedShield, AnimatedAlert } from '../../components/common/AnimatedIcons';
import { CouncillorDocketModal } from '../../components/complaints/CouncillorDocketModal';
import { Printer } from 'lucide-react';

export function ComplaintDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t, getCategoryTitle, isTamil } = useLanguage();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showProceedModal, setShowProceedModal] = useState(false);
  const [showDocketModal, setShowDocketModal] = useState(false);
  const [proceedNotes, setProceedNotes] = useState('');
  const [isProceeding, setIsProceeding] = useState(false);

  const fetchComplaintDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
      if (data.comments) setComments(data.comments);
      else {
        const comms = await import('../../services/commentService').then((m) =>
          m.commentService.getComments(id)
        );
        setComments(comms || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || (isTamil ? 'புகார் விவரம் கிடைக்கவில்லை' : 'Complaint not found'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handleAddComment = async (text) => {
    const newComm = await import('../../services/commentService').then((m) =>
      m.commentService.addComment(id, text)
    );
    setComments((prev) => [...prev, newComm]);
  };

  const handleConfirmResolution = async (feedback) => {
    setIsActionLoading(true);
    try {
      await complaintService.confirmResolution(id, feedback);
      showSuccess(isTamil ? 'தீர்வு வெற்றிகரமாக உறுதிசெய்யப்பட்டது!' : 'Resolution successfully confirmed!');
      await fetchComplaintDetails();
    } catch (err) {
      showError(err.response?.data?.message || (isTamil ? 'தீர்வு உறுதிப்படுத்த முடியவில்லை' : 'Failed to confirm resolution'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDisputeResolution = async (reason) => {
    setIsActionLoading(true);
    try {
      await complaintService.disputeResolution(id, reason);
      showSuccess(isTamil ? 'மறுப்பு சமர்ப்பிக்கப்பட்டது. தணிக்கை தொடங்கும்.' : 'Dispute recorded for administrative investigation.');
      await fetchComplaintDetails();
    } catch (err) {
      showError(err.response?.data?.message || (isTamil ? 'மறுப்பு சமர்ப்பிக்க முடியவில்லை' : 'Failed to dispute resolution'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCouncillorProceed = async (e) => {
    e.preventDefault();
    setIsProceeding(true);
    try {
      await complaintService.councillorProceed(id, {
        verification_notes: proceedNotes.trim() || 'Ward Councillor conducted on-ground verification and officially authorized transmission to department.',
      });
      setShowProceedModal(false);
      await fetchComplaintDetails();
      showSuccess(isTamil ? 'வார்டு கவுன்சிலரால் சரிபார்க்கப்பட்டு துறைக்கு அனுப்பப்பட்டது!' : 'Grievance verified and forwarded to department!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to verify and proceed');
    } finally {
      setIsProceeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <ErrorState
        title={isTamil ? 'புகார் விவரம் கிடைக்கவில்லை' : 'Grievance Record Not Found'}
        message={error || (isTamil ? 'தேடப்பட்ட புகார் எண் பதிவேட்டில் இல்லை.' : 'The requested civic ticket does not exist or was archived.')}
        onRetry={fetchComplaintDetails}
      />
    );
  }

  const isReporter = user && user.id === complaint.user_id;
  const isCouncillorForWard = user && (user.role === 'ADMIN' || (user.role === 'WARD_COUNCILLOR' && (!user.ward_id || user.ward_id === complaint.ward_id)));
  const isAwaitingConfirmation = complaint.verification_state === 'AWAITING_CITIZEN_CONFIRMATION';
  const latestResolutionEvidence =
    complaint.resolution_evidence && complaint.resolution_evidence.length > 0
      ? complaint.resolution_evidence[complaint.resolution_evidence.length - 1]
      : null;

  const localizedCategory = getCategoryTitle(complaint.category_id, complaint.category_name);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('navPublicFeed'), to: '/complaints' },
          { label: complaint.reference_id },
        ]}
      />

      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm px-2.5 py-1 bg-neutral-900 text-white rounded-lg">
              {complaint.reference_id}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-orange-100 text-[#F97316] rounded-lg">
              {localizedCategory}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ComplaintStatusBadge
              status={complaint.status}
              verificationState={complaint.verification_state}
            />

            <SupportButton
              complaintId={complaint.id}
              initialCount={complaint.supports_count}
              complaintWardId={complaint.ward_id}
            />
          </div>
        </div>

        <h1 className="text-xl sm:text-3xl font-black text-[#171717] tracking-tight">
          {complaint.title}
        </h1>

        {/* Metadata info line */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#737373] pt-2 border-t border-[#E7E5E4]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#737373]" />
            <span>{isTamil ? 'பதிவு செய்த நாள்' : 'Logged on'} {formatDate(complaint.created_at)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Building className="w-4 h-4 text-[#737373]" />
            <span>
              {complaint.ward_name} &bull; {complaint.local_body_name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#F97316]" />
            <span>{isTamil ? 'வார்டு கவுன்சிலர்: ' : 'Councillor: '} {complaint.councillor_name || (isTamil ? 'வார்டு மக்கள் பிரதிநிதி' : 'Elected Ward Representative')}</span>
          </div>
        </div>
      </div>

      {/* Ward Councillor Middleware & Accountability Banner */}
      {!complaint.councillor_verified || complaint.status === 'Pending Councillor Verification' ? (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-950 text-sm">
                  {isTamil ? 'வார்டு கவுன்சிலர் சரிபார்ப்பில் உள்ளது (மத்தியஸ்தர் பணி)' : 'Civic Middleware: Awaiting Ward Councillor Verification'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                  Pending Proceed
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed max-w-3xl">
                {isTamil
                  ? `குடிமக்கள் பதிவு செய்த புகார்கள் நேரடியாக துறைக்குச் செல்வதில்லை. வார்டு கவுன்சிலர் (${complaint.councillor_name || 'கவுன்சிலர்'}) கள ஆய்வு செய்து, உண்மைத்தன்மையை உறுதிசெய்து 'Proceed' பொத்தானை அழுத்திய பிறகே சம்பந்தப்பட்ட ${complaint.department_name || 'அரசுத் துறைக்கு'} நடவடிக்கைக்காகப் போகும்.`
                  : `Complaints are not dispatched directly to executive departments. Elected Ward Councillor (${complaint.councillor_name || 'Ward Councillor'}) acts as the accountable middleware to verify field veracity before authorizing transmission to ${complaint.department_name || 'the department'}.`}
              </p>
            </div>
          </div>

          {isCouncillorForWard && (
            <div className="shrink-0 flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setProceedNotes(`Inspected field conditions at ${complaint.address_text}. Confirmed valid grievance. Forwarding to ${complaint.department_name || 'department'} for execution.`);
                  setShowProceedModal(true);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs whitespace-nowrap"
              >
                <span>{isTamil ? 'சரிபார்த்து துறைக்கு அனுப்புக (Proceed) &rarr;' : 'Verify & Proceed to Dept &rarr;'}</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50/90 border border-green-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-green-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              ✓
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-950 text-sm">
                  {isTamil ? 'வார்டு கவுன்சிலரால் சரிபார்க்கப்பட்டு துறைக்கு அனுப்பப்பட்டது' : 'Verified & Dispatched by Ward Councillor'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-green-100 text-green-800 font-bold">
                  {formatDate(complaint.councillor_verified_at)}
                </span>
              </div>
              <p className="text-green-800 mt-0.5">
                {isTamil ? 'கவுன்சிலர் குறிப்பு: ' : 'Endorsement Note: '}
                <em>"{complaint.councillor_notes || 'Grievance verified on ground and dispatched to department.'}"</em>
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-green-200 text-xs font-bold text-green-800">
              🏛️ {complaint.department_name || 'Department Received'}
            </span>
          </div>
        </div>
      )}

      {/* Resolution Review Banner if Resolution Proposed */}
      {isAwaitingConfirmation && latestResolutionEvidence && (
        <ResolutionReview
          evidence={latestResolutionEvidence}
          isReporter={isReporter}
          onConfirm={handleConfirmResolution}
          onDispute={handleDisputeResolution}
          isLoading={isActionLoading}
        />
      )}

      {/* Two-column layout: Left details, Right Map & Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Description */}
          <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
              {isTamil ? 'பிரச்சனை பற்றிய முழு விளக்கம்' : 'Problem Description'}
            </h3>
            <p className="text-sm text-[#171717] leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {/* Supporting Photographs */}
          <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
              {isTamil ? 'புகைப்பட ஆதாரங்கள்' : 'Photographic Evidence'}
            </h3>
            <ComplaintImages images={complaint.images} />
          </div>

          {/* Department Progress Bulletins */}
          <OfficialUpdates updates={complaint.official_updates} />

          {/* Official Status Transition History */}
          <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E4]">
              <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                {isTamil ? 'அதிகாரப்பூர்வ நடவடிக்கை வரலாறு' : 'Official Status Transition History'}
              </h3>
              <span className="text-xs text-[#737373]">{isTamil ? 'தணிக்கை பதிவு' : 'Audited Record'}</span>
            </div>
            <ComplaintTimeline history={complaint.status_history} />
          </div>

          {/* Ward Community Comments */}
          <CommentSection
            complaintId={complaint.id}
            complaintWardId={complaint.ward_id}
            comments={comments}
            onAddComment={handleAddComment}
          />
        </div>

        {/* Right Column (1 col): Department, Deadlines, Location, Escalation CTA */}
        <div className="space-y-6">
          {/* Ward Councillor Middleware & Accountability Card */}
          <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs space-y-3 bg-gradient-to-br from-white to-amber-50/30">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-2.5">
              <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>🛡️</span> {isTamil ? 'வார்டு கவுன்சிலர் (மத்தியஸ்தர்)' : 'Ward Councillor Middleware'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                {complaint.councillor_verified ? (isTamil ? 'அனுப்பப்பட்டது' : 'Verified & Proceeded') : (isTamil ? 'சரிபார்ப்பில் உள்ளது' : 'Pending Verification')}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-black text-[#171717]">
                {complaint.councillor_name || 'Elected Ward Councillor'}
              </h4>
              <p className="text-[11px] text-[#737373] mt-0.5">
                {complaint.ward_name} &bull; {isTamil ? 'வார்டு மக்கள் பிரதிநிதி' : 'Ward Representative'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#737373]">{isTamil ? 'சரிபார்ப்பு நிலை:' : 'Verification:'}</span>
                <span className={`font-bold ${complaint.councillor_verified ? 'text-green-700' : 'text-amber-700'}`}>
                  {complaint.councillor_verified ? '✓ ' + (isTamil ? 'உறுதிசெய்யப்பட்டது' : 'Verified by Councillor') : '⏳ ' + (isTamil ? 'நிலுவையில் உள்ளது' : 'Pending')}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#737373]">{isTamil ? 'துறை பெற்றது:' : 'Dept Received:'}</span>
                <span className={`font-bold ${complaint.department_received ? 'text-blue-700' : 'text-neutral-500'}`}>
                  {complaint.department_received ? (isTamil ? 'ஆம், பெறப்பட்டது' : 'Yes, Received') : (isTamil ? 'கவுன்சிலர் ஒப்புதலுக்குப் பின்' : 'Awaiting Councillor Proceed')}
                </span>
              </div>
            </div>

            {isCouncillorForWard && (!complaint.councillor_verified || complaint.status === 'Pending Councillor Verification') && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setProceedNotes(`Inspected field conditions at ${complaint.address_text}. Confirmed valid grievance. Forwarding to ${complaint.department_name || 'department'} for execution.`);
                  setShowProceedModal(true);
                }}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                {isTamil ? 'சரிபார்த்து துறைக்கு அனுப்புக &rarr;' : 'Verify & Proceed to Dept &rarr;'}
              </Button>
            )}
          </div>

          {/* Managing Civic Department Card */}
          <div className="bg-white rounded-2xl border border-orange-200/90 p-5 shadow-xs space-y-3.5 bg-gradient-to-br from-white to-orange-50/20">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-2.5">
              <span className="text-[11px] font-extrabold text-[#F97316] uppercase tracking-wider flex items-center gap-1.5">
                <span>🏛️</span> {isTamil ? 'நிர்வகிக்கும் அரசுத் துறை' : 'Managing Civic Department'}
              </span>
              {complaint.department?.code && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-100/80 text-[#C2410C]">
                  {complaint.department.code}
                </span>
              )}
            </div>

            <div>
              <h4 className="text-sm font-black text-[#171717] leading-tight">
                {isTamil
                  ? (complaint.department?.name_ta || complaint.department_name_ta || 'நகராட்சி நிர்வாகம்')
                  : (complaint.department?.name || complaint.department_name || 'Municipal Administration')}
              </h4>
              <p className="text-[11px] text-[#737373] mt-1">
                {isTamil
                  ? 'இப்புகாரைத் தீர்க்கும் முழு பொறுப்பும் சட்டப்படி இத்துறைக்கே உரியது.'
                  : 'Statutory department responsible for executing and inspecting this resolution.'}
              </p>
            </div>

            <div className="space-y-2 text-xs pt-1 border-t border-neutral-100">
              {complaint.department?.head_officer && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#737373] text-[11px] shrink-0">
                    {isTamil ? 'துறை அதிகாரி:' : 'Nodal Officer:'}
                  </span>
                  <span className="font-bold text-[#171717] text-right truncate">
                    {complaint.department.head_officer}
                  </span>
                </div>
              )}

              {(complaint.department?.contact_phone || complaint.department?.emergency_helpline) && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#737373] text-[11px] shrink-0">
                    {isTamil ? 'உதவி எண்:' : 'Helpline:'}
                  </span>
                  <a
                    href={`tel:${complaint.department.emergency_helpline || complaint.department.contact_phone}`}
                    className="font-bold text-[#F97316] hover:underline text-right"
                  >
                    {complaint.department.emergency_helpline || complaint.department.contact_phone}
                  </a>
                </div>
              )}

              {complaint.department?.sla_standard_days && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#737373] text-[11px] shrink-0">
                    {isTamil ? 'வழக்கமான தீர்வு:' : 'Standard SLA:'}
                  </span>
                  <span className="font-bold text-[#15803D]">
                    {complaint.department.sla_standard_days} {isTamil ? 'நாட்கள்' : 'Days'}
                  </span>
                </div>
              )}
            </div>

            {complaint.department_id && (
              <div className="pt-2 border-t border-neutral-100">
                <Link
                  to={`/complaints?department_id=${complaint.department_id}`}
                  className="block text-center text-xs font-bold text-[#F97316] hover:text-[#C2410C] hover:underline"
                >
                  {isTamil ? 'இத்துறை நிர்வகிக்கும் அனைத்து புகார்களும் &rarr;' : 'View all complaints handled by this dept &rarr;'}
                </Link>
              </div>
            )}
          </div>

          {/* Deadline card */}
          <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
              {t('targetDate')}
            </h3>
            <DeadlineIndicator
              deadline={complaint.active_deadline}
              condition={complaint.deadline_condition}
              isResolved={complaint.status === 'Resolved' || complaint.status === 'Closed'}
            />

            {complaint.deadline_history && complaint.deadline_history.length > 0 && (
              <div className="pt-2 border-t border-[#E7E5E4] text-[11px] space-y-1.5">
                <span className="font-bold text-[#171717]">
                  {isTamil ? 'காலக்கெடு தணிக்கை:' : 'Deadline Audits:'}
                </span>
                {complaint.deadline_history.map((dh) => (
                  <div key={dh.id} className="text-[#737373]">
                    &bull; {dh.action_type.replace(/_/g, ' ')}: {dh.reason}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location and Maps */}
          <ComplaintMap
            latitude={complaint.latitude}
            longitude={complaint.longitude}
            addressText={complaint.address_text}
            landmark={complaint.landmark}
          />

          {/* Escalation Action Card */}
          {canUserEscalate(user, complaint) && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AnimatedAlert className="w-4 h-4 text-[#B45309]" />
                <span>{isTamil ? 'உயர் அதிகாரிக்கு மேல்முறையீடு தேவையா?' : 'Need Higher Authority Escalation?'}</span>
              </div>
              <p className="text-xs text-amber-950/80 leading-relaxed">
                {isTamil
                  ? 'காலக்கெடு கடந்தும் வேலை தொடங்கப்படவில்லையெனில், மாநகராட்சி ஆணையர் அல்லது மாவட்ட ஆட்சியரிடம் நேரடியாக மேல்முறையீடு செய்யலாம்.'
                  : 'If this grievance faces repeated missed deadlines or unaddressed delays, you may escalate to the Municipal Commissioner or District Collectorate.'}
              </p>
              <Link to={`/my-escalations?complaintId=${complaint.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  {isTamil ? 'மேல்முறையீடு செய்க' : 'Initiate Supervisory Escalation'}
                </Button>
              </Link>
            </div>
          )}

          {/* Confidential Accountability Referral Card */}
          <div className="bg-neutral-900 text-white rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F97316]">
              <AnimatedShield className="w-4 h-4 text-[#F97316]" />
              <span>{isTamil ? 'ரகசிய பொறுப்புடைமை விசாரணை' : 'Confidential Accountability Inquiry'}</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {isTamil
                ? 'பொய் சொல்லி புகார் முடிக்கப்பட்டாலோ அல்லது லஞ்சம் கோரப்பட்டாலோ, தனிப்பட்ட நடுநிலை அதிகாரியிடம் ரகசிய புகார் அளியுங்கள்.'
                : 'If this complaint was marked resolved falsely or mishandled repeatedly, file a confidential report with the Independent Accountability Reviewer.'}
            </p>
            <Link to={`/accountability/report?complaintRef=${complaint.reference_id}`}>
              <Button variant="secondary" size="sm" className="w-full bg-neutral-800 hover:bg-neutral-700">
                {isTamil ? 'ரகசிய புகார் பதிவு செய்க' : 'File Confidential Report'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Ward Councillor Proceed Modal */}
      {showProceedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E7E5E4] space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  🛡️
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#171717]">
                    {isTamil ? 'வார்டு கவுன்சிலர் சரிபார்ப்பு & துறைக்கு அனுப்புதல்' : 'Councillor Verification & Proceed'}
                  </h3>
                  <span className="text-xs text-[#737373]">
                    {complaint.reference_id}: {complaint.title}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProceedModal(false)}
                className="text-[#737373] hover:text-[#171717] text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>{isTamil ? 'பொறுப்புடைமை விதி:' : 'Accountability Check:'}</strong> {isTamil
                ? `வார்டு கவுன்சிலராக நீங்கள் களப்பணியை உறுதிசெய்து 'Proceed' செய்யும் போது, இப்புகார் அதிகாரப்பூர்வமாக ${complaint.department_name || 'அரசுத் துறைக்கு'} நடவடிக்கைக்காகப் போகும்.`
                : `By clicking Proceed, you officially verify this citizen report on the ground and transmit it to ${complaint.department_name || 'the department'} for action.`}
            </div>

            <form onSubmit={handleCouncillorProceed} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                  {isTamil ? 'கள ஆய்வு குறிப்புகள் / உத்தரவு' : 'Ground Inspection & Endorsement Notes'}
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full text-xs p-3 bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:ring-2 focus:ring-[#F97316] focus:outline-none"
                  value={proceedNotes}
                  onChange={(e) => setProceedNotes(e.target.value)}
                  placeholder={isTamil ? 'கள ஆய்வு விவரம், பழுது உண்மைத்தன்மை, துறைக்கு அளிக்கும் குறிப்பு...' : 'Record field inspection findings and instructions to the department...'}
                />
              </div>

              <div className="p-3 bg-neutral-100 rounded-xl text-xs font-bold text-[#171717] flex items-center justify-between">
                <span>🏛️ {isTamil ? 'அனுப்பப்படும் துறை: ' : 'Target Department: '} {complaint.department_name || 'Managing Department'}</span>
                <span className="text-[10px] text-[#737373] font-mono">Assigned Wing</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E7E5E4]">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setShowProceedModal(false)}
                  disabled={isProceeding}
                >
                  {isTamil ? 'ரத்து செய்க' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isProceeding}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  {isTamil ? 'உறுதிசெய்து துறைக்கு அனுப்புக (Proceed) &rarr;' : 'Confirm & Proceed to Department &rarr;'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
