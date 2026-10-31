// Frontend/src/components/complaints/SubmissionProgressModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  LayoutDashboard,
  ShieldCheck,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { Button } from '../common/Button';

/**
 * Razorpay-Style Animated Complaint Submission Modal
 *
 * Visual Stages:
 * - 'posting': Sending complaint data to server
 * - 'processing': Validating ward, category, jurisdiction & SLA rules
 * - 'verifying': Confirming database persistence & generating official ticket
 * - 'success': Database write verified, official ticket generated
 * - 'failure': Database write failed or server returned validation error
 * - 'unknown': Network timeout / outcome unknown; allows checking status before retrying
 */
export function SubmissionProgressModal({
  stage, // 'posting' | 'processing' | 'verifying' | 'success' | 'failure' | 'unknown'
  complaint, // Received complaint object upon successful database commit
  error, // Error message upon failure
  onRetry, // Callback to retry submission with preserved data
  onCheckStatus, // Callback to verify database status if timeout occurs
  isCheckingStatus, // Loading flag for status verification check
  onClose, // Callback to close modal and edit form
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!stage) return null;

  const handleCopyTicket = () => {
    if (complaint?.reference_id) {
      navigator.clipboard.writeText(complaint.reference_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isProgressing = stage === 'posting' || stage === 'processing' || stage === 'verifying';

  // Step state indicators
  const getStepStatus = (stepName) => {
    if (stage === 'success') return 'completed';
    if (stage === 'failure') {
      if (stepName === 'posting') return 'failed';
      return 'pending';
    }
    if (stage === 'unknown') {
      if (stepName === 'verifying') return 'warning';
      return 'completed';
    }

    if (stepName === 'posting') {
      return stage === 'posting' ? 'active' : 'completed';
    }
    if (stepName === 'processing') {
      if (stage === 'posting') return 'pending';
      return stage === 'processing' ? 'active' : 'completed';
    }
    if (stepName === 'verifying') {
      return stage === 'verifying' ? 'active' : 'pending';
    }
    return 'pending';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/70 backdrop-blur-sm transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-modal-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E7E5E4] overflow-hidden transform transition-all duration-300">
        {/* Top Civic Security Accent Ribbon */}
        <div className="h-2 bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#C2410C]" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Branding & Stage Badge */}
          <div className="flex items-center justify-between text-xs text-[#737373]">
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-[#171717]">
              <ShieldCheck className="w-4 h-4 text-[#F97316]" />
              <span>KuralTN &bull; Municipal Redressal Gateway</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                stage === 'success'
                  ? 'bg-green-100 text-green-800'
                  : stage === 'failure'
                  ? 'bg-red-100 text-red-800'
                  : stage === 'unknown'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-orange-100 text-[#EA580C] animate-pulse'
              }`}
            >
              {stage === 'success'
                ? 'Recorded'
                : stage === 'failure'
                ? 'Submission Error'
                : stage === 'unknown'
                ? 'Uncertain Status'
                : 'Processing'}
            </span>
          </div>

          {/* Central Hero Animation Graphic */}
          <div className="flex flex-col items-center justify-center pt-2 pb-4">
            {/* 1. Progress State (Razorpay-Style Spinner & Pulse) */}
            {isProgressing && (
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Outer glowing pulsing ring */}
                <div className="absolute inset-0 rounded-full bg-orange-100/70 animate-ping opacity-30" />

                {/* Rotating SVG track with gradient stroke */}
                <svg className="w-full h-full transform -rotate-90 animate-spin" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#F5F5F4"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#razorpayGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset="100"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="razorpayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F97316" />
                      <stop offset="50%" stopColor="#EA580C" />
                      <stop offset="100%" stopColor="#FDE047" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center Pulse Icon */}
                <div className="absolute w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center border border-orange-100">
                  <RotateCw className="w-6 h-6 text-[#F97316] animate-spin" />
                </div>
              </div>
            )}

            {/* 2. Success State (Razorpay Smooth Circular Checkmark) */}
            {stage === 'success' && (
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-green-100 animate-pulse opacity-60" />
                <div className="w-20 h-20 rounded-full bg-[#15803D] flex items-center justify-center shadow-lg transform transition-transform duration-500 scale-100">
                  <Check className="w-10 h-10 text-white stroke-[3] animate-bounce" />
                </div>
              </div>
            )}

            {/* 3. Failure State (Animated Circular Cross) */}
            {stage === 'failure' && (
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-red-100 animate-pulse opacity-60" />
                <div className="w-20 h-20 rounded-full bg-[#B91C1C] flex items-center justify-center shadow-lg">
                  <X className="w-10 h-10 text-white stroke-[3]" />
                </div>
              </div>
            )}

            {/* 4. Unknown / Timeout State (Amber Warning) */}
            {stage === 'unknown' && (
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-100 animate-pulse opacity-60" />
                <div className="w-20 h-20 rounded-full bg-[#D97706] flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-10 h-10 text-white stroke-[2.5]" />
                </div>
              </div>
            )}

            {/* Dynamic Stage Heading & Feedback */}
            <div className="text-center mt-5 space-y-1.5">
              <h2
                id="submission-modal-title"
                className="text-lg sm:text-xl font-black text-[#171717] tracking-tight"
              >
                {stage === 'posting' && 'Posting Complaint to Gateway...'}
                {stage === 'processing' && 'Processing & Routing Grievance...'}
                {stage === 'verifying' && 'Verifying Database Persistence...'}
                {stage === 'success' && 'Complaint Delivered Successfully!'}
                {stage === 'failure' && 'Complaint Submission Failed'}
                {stage === 'unknown' && 'Submission Status Unknown'}
              </h2>

              <p className="text-xs text-[#737373] max-w-xs mx-auto leading-relaxed">
                {stage === 'posting' && 'Transmitting encrypted civic report and metadata to the municipal server.'}
                {stage === 'processing' && 'Validating ward boundaries, official SLA timelines, and responsible civic department.'}
                {stage === 'verifying' && 'Waiting for database confirmation to guarantee permanent persistence.'}
                {stage === 'success' && 'Your complaint has been submitted and recorded successfully.'}
                {stage === 'failure' &&
                  (error || 'The complaint could not be confirmed as successfully submitted. Your entered details have been preserved.')}
                {stage === 'unknown' &&
                  'The connection timed out before receiving a confirmation response from the server. Check your submission status before retrying.'}
              </p>
            </div>
          </div>

          {/* Stepped Progress Stages for In-Flight Submissions */}
          {isProgressing && (
            <div className="bg-[#FAF9F6] border border-[#E7E5E4] rounded-2xl p-4 space-y-3">
              {/* Step 1: Posting */}
              <div className="flex items-center gap-3 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    getStepStatus('posting') === 'completed'
                      ? 'bg-[#15803D] text-white'
                      : getStepStatus('posting') === 'active'
                      ? 'bg-[#F97316] text-white animate-pulse'
                      : 'bg-neutral-200 text-[#737373]'
                  }`}
                >
                  {getStepStatus('posting') === 'completed' ? <Check className="w-3.5 h-3.5" /> : '1'}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#171717]">Posting Complaint</div>
                  <div className="text-[11px] text-[#737373]">Dispatching payload to municipal backend</div>
                </div>
              </div>

              {/* Step 2: Processing */}
              <div className="flex items-center gap-3 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    getStepStatus('processing') === 'completed'
                      ? 'bg-[#15803D] text-white'
                      : getStepStatus('processing') === 'active'
                      ? 'bg-[#F97316] text-white animate-pulse'
                      : 'bg-neutral-200 text-[#737373]'
                  }`}
                >
                  {getStepStatus('processing') === 'completed' ? <Check className="w-3.5 h-3.5" /> : '2'}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#171717]">Processing & Validation</div>
                  <div className="text-[11px] text-[#737373]">Analyzing jurisdiction and category requirements</div>
                </div>
              </div>

              {/* Step 3: Verifying */}
              <div className="flex items-center gap-3 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    getStepStatus('verifying') === 'completed'
                      ? 'bg-[#15803D] text-white'
                      : getStepStatus('verifying') === 'active'
                      ? 'bg-[#F97316] text-white animate-pulse'
                      : 'bg-neutral-200 text-[#737373]'
                  }`}
                >
                  {getStepStatus('verifying') === 'completed' ? <Check className="w-3.5 h-3.5" /> : '3'}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#171717]">Verifying Submission</div>
                  <div className="text-[11px] text-[#737373]">Awaiting transactional database commit confirmation</div>
                </div>
              </div>
            </div>
          )}

          {/* Success Result Card with Ticket Reference ID */}
          {stage === 'success' && complaint && (
            <div className="bg-orange-50/50 border border-orange-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                  Complaint Reference ID
                </span>
                <button
                  type="button"
                  onClick={handleCopyTicket}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#EA580C] hover:underline cursor-pointer"
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="text-xl sm:text-2xl font-mono font-black text-[#171717] tracking-tight">
                {complaint.reference_id || complaint.id}
              </div>

              <div className="pt-2 border-t border-orange-200/50 flex flex-wrap items-center justify-between text-xs text-[#737373]">
                <span>
                  Ward: <strong className="text-[#171717]">{complaint.ward_name || complaint.ward_id}</strong>
                </span>
                <span>
                  Status: <strong className="text-[#15803D]">Submitted</strong>
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons for Terminal States */}
          {stage === 'success' && (
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C]"
                onClick={() => navigate(`/complaints/${complaint?.id || complaint?.reference_id}`)}
              >
                <span>View Complaint</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="md"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => navigate('/dashboard')}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </Button>
            </div>
          )}

          {stage === 'failure' && (
            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full flex items-center justify-center gap-2 bg-[#B91C1C] hover:bg-[#991B1B]"
                onClick={onRetry}
              >
                <RotateCw className="w-4 h-4" />
                <span>Retry Submission</span>
              </Button>
              <Button
                variant="outline"
                size="md"
                className="w-full flex items-center justify-center gap-2"
                onClick={onClose}
              >
                <span>Edit Complaint Form</span>
              </Button>
            </div>
          )}

          {stage === 'unknown' && (
            <div className="space-y-2.5 pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full flex items-center justify-center gap-2 bg-[#D97706] hover:bg-[#B45309]"
                isLoading={isCheckingStatus}
                onClick={onCheckStatus}
              >
                <RotateCw className="w-4 h-4" />
                <span>Check Submission Status Now</span>
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={onRetry}
                >
                  Retry Submission
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={onClose}
                >
                  Keep Form Details
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
