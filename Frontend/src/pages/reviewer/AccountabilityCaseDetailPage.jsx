// Frontend/src/pages/reviewer/AccountabilityCaseDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { accountabilityService } from '../../services/accountabilityService';
import { CaseHistory } from '../../components/accountability/CaseHistory';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/Textarea';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Lock, Shield, FileText, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/dateUtils';

export function AccountabilityCaseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [findingText, setFindingText] = useState('');
  const [referredAuthority, setReferredAuthority] = useState('');
  const [statusDecision, setStatusDecision] = useState('Finding Recorded');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCase = async () => {
    setIsLoading(true);
    try {
      const data = await accountabilityService.getCaseById(id);
      setCaseData(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load case');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  const handleRecordFinding = async (e) => {
    e.preventDefault();
    if (!findingText.trim()) return alert('Findings text is mandatory');

    setIsSubmitting(true);
    try {
      await accountabilityService.recordFinding(id, {
        findings_or_notes: findingText.trim(),
        referred_to_authority: referredAuthority.trim() || null,
        status: statusDecision,
      });
      setFindingText('');
      setReferredAuthority('');
      await fetchCase();
      alert('Formal finding successfully recorded and logged in audit trial!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record finding');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;
  if (!caseData) return <div className="p-12 text-center text-xs text-[#737373]">Case not found or access denied.</div>;

  const isReviewerOrAdmin = user?.role === 'ACCOUNTABILITY_REVIEWER' || user?.role === 'ADMIN';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumbs
        items={[
          { label: isReviewerOrAdmin ? 'Reviewer Docket' : 'My Reports', to: isReviewerOrAdmin ? '/reviewer/cases' : '/accountability/my-reports' },
          { label: caseData.case_reference_id },
        ]}
      />

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm px-2.5 py-1 bg-neutral-900 text-white rounded-lg flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#F97316]" />
              <span>{caseData.case_reference_id}</span>
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 text-[#F97316]">
              {caseData.concern_type?.replace(/_/g, ' ')}
            </span>
          </div>

          <Badge variant="warning">{caseData.status}</Badge>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-[#171717]">
          Confidential Case Docket & Evidence Audit
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E7E5E4] text-xs">
          <div>
            <span className="font-semibold text-[#171717]">Ward Incurred: </span>
            <span className="text-[#737373]">{caseData.ward_name}</span>
          </div>
          <div>
            <span className="font-semibold text-[#171717]">Related Grievance Ref: </span>
            <span className="font-mono text-[#F97316] font-bold">
              {caseData.complaint_reference_id || 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-[#171717]">Lodged Date: </span>
            <span className="text-[#737373]">{formatDate(caseData.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Case Details */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4 text-xs">
        <div>
          <h3 className="font-bold text-[#171717] uppercase tracking-wider mb-1">
            Factual Statement of Mismanagement / Non-Action
          </h3>
          <p className="p-4 bg-neutral-50 rounded-xl border border-[#E7E5E4] leading-relaxed whitespace-pre-wrap text-neutral-800">
            {caseData.description}
          </p>
        </div>

        {caseData.timeline_dates_text && (
          <div>
            <span className="font-bold text-[#171717]">Timeline & Key Dates: </span>
            <span className="text-[#737373]">{caseData.timeline_dates_text}</span>
          </div>
        )}

        {caseData.follow_up_attempts_text && (
          <div>
            <span className="font-bold text-[#171717]">Follow-up Attempts Made: </span>
            <span className="text-[#737373]">{caseData.follow_up_attempts_text}</span>
          </div>
        )}

        {caseData.expected_action_and_outcome && (
          <div>
            <span className="font-bold text-[#171717]">Desired Redressal Outcome: </span>
            <span className="text-[#737373]">{caseData.expected_action_and_outcome}</span>
          </div>
        )}
      </div>

      {/* Evidence Attachments */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
          Confidential Evidence Vault ({caseData.evidence?.length || 0} files)
        </h3>

        {(!caseData.evidence || caseData.evidence.length === 0) ? (
          <p className="text-xs text-[#737373]">No physical documents attached.</p>
        ) : (
          <div className="space-y-2">
            {caseData.evidence.map((ev) => (
              <div
                key={ev.id}
                className="p-3 bg-neutral-50 rounded-xl border border-[#E7E5E4] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#F97316]" />
                  <span className="font-semibold text-[#171717]">{ev.file_name}</span>
                </div>
                <span className="text-[11px] text-[#737373] italic">
                  Stored in private encrypted store
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviewer Action: Record Formal Finding */}
      {isReviewerOrAdmin && (
        <form
          onSubmit={handleRecordFinding}
          className="bg-white rounded-2xl border-2 border-[#F97316] p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-[#171717]">
            <Shield className="w-5 h-5 text-[#F97316]" />
            <span>Independent Reviewer Official Determination</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Investigation Outcome Decision"
              value={statusDecision}
              options={[
                { value: 'Finding Recorded', label: 'Finding Recorded (Formal Inquiry Complete)' },
                { value: 'Referred to Appropriate Authority', label: 'Referred to Directorate / Vigilance' },
                { value: 'More Information Required', label: 'More Information Required from Citizen' },
                { value: 'Closed', label: 'Closed (Unsubstantiated or Resolved)' },
              ]}
              onChange={(e) => setStatusDecision(e.target.value)}
            />

            <Input
              label="Referral Authority / Directorate (If referring)"
              placeholder="e.g. Directorate of Municipal Administration, Chennai"
              value={referredAuthority}
              onChange={(e) => setReferredAuthority(e.target.value)}
            />
          </div>

          <Textarea
            label="Formal Findings & Inquiry Notes"
            required
            rows={4}
            placeholder="Record the independent investigation observations, inspection findings, contractor sign-off errors, or corrective recommendations..."
            value={findingText}
            onChange={(e) => setFindingText(e.target.value)}
          />

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
              Commit Official Finding
            </Button>
          </div>
        </form>
      )}

      {/* Case History Timeline */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
          Audited Case History & Action Trail
        </h3>
        <CaseHistory history={caseData.history} />
      </div>
    </div>
  );
}
