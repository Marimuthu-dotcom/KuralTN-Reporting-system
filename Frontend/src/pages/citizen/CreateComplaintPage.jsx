// Frontend/src/pages/citizen/CreateComplaintPage.jsx
import React, { useState, useRef } from 'react';
import { ComplaintForm } from '../../components/complaints/ComplaintForm';
import { SubmissionProgressModal } from '../../components/complaints/SubmissionProgressModal';
import { complaintService } from '../../services/complaintService';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';

export function CreateComplaintPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Submission Flow & Razorpay-Style Animation States
  const [submissionStage, setSubmissionStage] = useState(null); // null | 'posting' | 'processing' | 'verifying' | 'success' | 'failure' | 'unknown'
  const [submittedComplaint, setSubmittedComplaint] = useState(null);
  const [submissionError, setSubmissionError] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Preserve idempotent submission ID and form payload for safe retries
  const currentSubmissionIdRef = useRef(null);
  const lastFormDataRef = useRef(null);

  const generateSubmissionId = () => {
    return `sub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const executeSubmission = async (formData, submissionId) => {
    setSubmissionStage('posting');
    setSubmissionError('');

    // Ensure idempotency key is attached
    if (!formData.has('client_submission_id')) {
      formData.append('client_submission_id', submissionId);
    } else {
      formData.set('client_submission_id', submissionId);
    }

    lastFormDataRef.current = formData;

    // Visual animation timeline pacing
    const tProcessing = setTimeout(() => {
      setSubmissionStage((curr) => (curr === 'posting' ? 'processing' : curr));
    }, 450);

    const tVerifying = setTimeout(() => {
      setSubmissionStage((curr) => (curr === 'processing' || curr === 'posting' ? 'verifying' : curr));
    }, 1100);

    try {
      // Real database creation API request
      const created = await complaintService.createComplaint(formData);

      // Ensure minimal duration so citizen perceives stages cleanly
      await new Promise((resolve) => setTimeout(resolve, 1400));

      clearTimeout(tProcessing);
      clearTimeout(tVerifying);

      setSubmittedComplaint(created);
      setSubmissionStage('success');
    } catch (err) {
      clearTimeout(tProcessing);
      clearTimeout(tVerifying);

      // Distinguish network timeout / connection abort from deterministic backend error
      const isTimeout =
        err.code === 'ECONNABORTED' ||
        err.message?.toLowerCase().includes('timeout') ||
        err.message?.toLowerCase().includes('network error') ||
        (!err.response && !err.status);

      if (isTimeout) {
        setSubmissionStage('unknown');
        setSubmissionError(
          'Network connection interrupted before receiving confirmation. Your complaint might already be stored.'
        );
      } else {
        const message =
          err.response?.data?.message ||
          err.message ||
          'Failed to record complaint in municipal database.';
        setSubmissionError(message);
        setSubmissionStage('failure');
      }
    }
  };

  const handleSubmit = (formData) => {
    // Generate fresh idempotent tracking ID
    const submissionId = generateSubmissionId();
    currentSubmissionIdRef.current = submissionId;
    executeSubmission(formData, submissionId);
  };

  const handleRetry = () => {
    if (lastFormDataRef.current && currentSubmissionIdRef.current) {
      executeSubmission(lastFormDataRef.current, currentSubmissionIdRef.current);
    }
  };

  const handleCheckStatus = async () => {
    if (!currentSubmissionIdRef.current) return;
    setIsCheckingStatus(true);
    try {
      const existing = await complaintService.checkSubmissionStatus(currentSubmissionIdRef.current);
      if (existing) {
        setSubmittedComplaint(existing);
        setSubmissionStage('success');
      } else {
        alert('No committed record found in the database yet. You can safely retry submission.');
      }
    } catch (err) {
      alert('Unable to confirm status at this moment. You can safely retry submission.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCloseModal = () => {
    // Close modal while preserving form state so user can edit details if needed
    setSubmissionStage(null);
  };

  const isFormLocked = submissionStage !== null && submissionStage !== 'failure';

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <Breadcrumbs items={[{ label: t('navDashboard'), to: '/dashboard' }, { label: t('navReport') }]} />

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 sm:p-8 shadow-xs space-y-2">
        <h1 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
          {t('reportHeading')}
        </h1>
        <p className="text-xs text-[#737373] leading-relaxed">
          {t('reportSubheading')}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-8 shadow-xs">
        <ComplaintForm
          onSubmit={handleSubmit}
          isLoading={isFormLocked}
          defaultWardId={user?.ward_id}
        />
      </div>

      {/* Razorpay-Style Animated Submission Modal */}
      <SubmissionProgressModal
        stage={submissionStage}
        complaint={submittedComplaint}
        error={submissionError}
        onRetry={handleRetry}
        onCheckStatus={handleCheckStatus}
        isCheckingStatus={isCheckingStatus}
        onClose={handleCloseModal}
      />
    </div>
  );
}
