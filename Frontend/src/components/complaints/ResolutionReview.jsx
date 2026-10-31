// Frontend/src/components/complaints/ResolutionReview.jsx
import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { formatDate } from '../../utils/dateUtils';
import { useLanguage } from '../../hooks/useLanguage';
import { AnimatedCheckmark, AnimatedAlert } from '../common/AnimatedIcons';

export function ResolutionReview({
  evidence,
  isReporter = false,
  onConfirm,
  onDispute,
  isLoading = false,
}) {
  const { t, isTamil } = useLanguage();
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [confirmFeedback, setConfirmFeedback] = useState(
    isTamil ? 'நேரில் பார்வையிட்டு வேலை முடிந்தது என உறுதிசெய்கிறேன்.' : 'Inspected and confirmed resolved.'
  );

  if (!evidence) return null;

  return (
    <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
          <AnimatedAlert className="w-6 h-6 text-amber-800" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#171717]">
            {t('resolutionPendingHeading')}
          </h3>
          <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
            {t('resolutionPendingDesc')}
          </p>
        </div>
      </div>

      {/* Evidence details */}
      <div className="p-4 bg-neutral-50 rounded-xl border border-[#E7E5E4] space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <span className="font-semibold text-[#171717]">{t('completionDate')}: </span>
            <span className="text-[#737373]">{formatDate(evidence.completion_date)}</span>
          </div>
          <div>
            <span className="font-semibold text-[#171717]">{t('submittedBy')}: </span>
            <span className="text-[#737373]">
              {evidence.submitted_by_name} ({evidence.submitted_by_role.replace(/_/g, ' ')})
            </span>
          </div>
          <div className="sm:col-span-2">
            <span className="font-semibold text-[#171717]">
              {isTamil ? 'தீர்வுத் தகவல் மூலம்: ' : 'Source of Resolution: '}
            </span>
            <span className="text-[#737373]">{evidence.source_of_resolution}</span>
          </div>
        </div>

        <div>
          <div className="font-semibold text-[#171717] mb-1">{t('workDescription')}:</div>
          <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-lg border border-[#E7E5E4]">
            {evidence.description}
          </p>
        </div>

        {evidence.evidence_image_url && (
          <div>
            <div className="font-semibold text-[#171717] mb-1">{t('evidencePhoto')}:</div>
            <div className="rounded-xl overflow-hidden border border-[#E7E5E4] max-h-60 bg-neutral-100 flex items-center justify-center">
              <img
                src={evidence.evidence_image_url}
                alt="Resolution evidence"
                className="max-h-60 object-contain w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Citizen Action Buttons */}
      {isReporter && (
        <div className="pt-2 border-t border-[#E7E5E4] space-y-4">
          <div className="text-xs font-semibold text-[#171717]">
            {isTamil
              ? 'புகாரளித்த குடிமகன் என்ற முறையில், தளத்தைப் பார்வையிட்டு உங்கள் முடிவைத் தேர்வு செய்க:'
              : 'As the citizen who reported this grievance, please choose an action:'}
          </div>

          {!showDisputeForm ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="success"
                size="md"
                isLoading={isLoading}
                onClick={() => onConfirm(confirmFeedback)}
                className="text-xs sm:text-sm py-2.5 px-4 shadow-sm"
              >
                <AnimatedCheckmark className="w-4 h-4 mr-2 text-white" />
                {t('confirmResolution')}
              </Button>
              <Button
                variant="outline"
                size="md"
                icon={XCircle}
                disabled={isLoading}
                onClick={() => setShowDisputeForm(true)}
                className="text-xs sm:text-sm py-2.5 px-4"
              >
                {t('disputeResolution')}
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-red-50/70 rounded-xl border border-red-200 space-y-3">
              <h4 className="text-xs font-bold text-[#B91C1C]">
                {t('explainDispute')}
              </h4>
              <Textarea
                rows={3}
                placeholder={
                  isTamil
                    ? 'இன்னும் என்ன வேலை மிச்சமுள்ளது அல்லது பழுது எவ்வாறு சரியாகவில்லை என்பதை விளக்குங்கள்...'
                    : 'Explain what is still unaddressed or why the repair failed...'
                }
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDisputeForm(false)}
                >
                  {t('cancel')}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={isLoading}
                  disabled={!disputeReason.trim()}
                  onClick={() => onDispute(disputeReason.trim())}
                >
                  {t('submitDispute')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
