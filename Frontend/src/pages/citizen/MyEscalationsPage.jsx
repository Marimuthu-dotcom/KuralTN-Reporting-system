// Frontend/src/pages/citizen/MyEscalationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { escalationService } from '../../services/escalationService';
import { complaintService } from '../../services/complaintService';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Select } from '../../components/common/Select';
import { AlertTriangle, ShieldCheck, Calendar, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

export function MyEscalationsPage() {
  const [searchParams] = useSearchParams();
  const prefillComplaintId = searchParams.get('complaintId');

  const [escalations, setEscalations] = useState([]);
  const [showEscalateForm, setShowEscalateForm] = useState(Boolean(prefillComplaintId));
  const [complaints, setComplaints] = useState([]);

  const [formData, setFormData] = useState({
    complaint_id: prefillComplaintId || '',
    reason_category: 'OVERDUE_DEADLINE',
    detailed_reason: '',
    escalation_tier: 'TIER_2_MUNICIPAL_COMMISSIONER',
    target_authority: 'Municipal Commissioner',
    external_portal_ref: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    try {
      const [escList, compRes] = await Promise.all([
        escalationService.getMyEscalations(),
        complaintService.getComplaints({ limit: 50 }),
      ]);
      setEscalations(escList || []);
      setComplaints(compRes.data || []);
    } catch (err) {
      console.error('Failed to load escalations:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.complaint_id || !formData.detailed_reason.trim()) return;

    setIsLoading(true);
    try {
      await escalationService.escalateComplaint(formData.complaint_id, formData);
      setShowEscalateForm(false);
      setFormData({
        complaint_id: '',
        reason_category: 'OVERDUE_DEADLINE',
        detailed_reason: '',
        escalation_tier: 'TIER_2_MUNICIPAL_COMMISSIONER',
        target_authority: 'Municipal Commissioner',
        external_portal_ref: '',
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Escalation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'My Escalations' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#171717] tracking-tight">
            Supervisory Escalations Queue
          </h1>
          <p className="text-xs text-[#737373] mt-1">
            Formal administrative appeals routed to the Municipal Commissioner and District Collectorate
          </p>
        </div>

        <Button
          variant={showEscalateForm ? 'outline' : 'primary'}
          size="md"
          icon={AlertTriangle}
          onClick={() => setShowEscalateForm(!showEscalateForm)}
        >
          {showEscalateForm ? 'Cancel Form' : 'Initiate New Escalation'}
        </Button>
      </div>

      {/* Escalation Form */}
      {showEscalateForm && (
        <form
          onSubmit={handleEscalateSubmit}
          className="bg-white rounded-2xl border border-amber-300 p-6 sm:p-8 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-[#E7E5E4] text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-[#B45309]" />
            <span>Escalate Unresolved Grievance to Supervisory Authority</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Select Grievance to Escalate"
              required
              value={formData.complaint_id}
              placeholder="Choose grievance"
              options={complaints.map((c) => ({
                value: c.id,
                label: `${c.reference_id}: ${c.title} (${c.status})`,
              }))}
              onChange={(e) => setFormData({ ...formData, complaint_id: e.target.value })}
            />

            <Select
              label="Primary Reason Category"
              required
              value={formData.reason_category}
              options={[
                { value: 'OVERDUE_DEADLINE', label: 'Overdue Deadline (Passed without completion)' },
                { value: 'NO_ACKNOWLEDGEMENT', label: 'No Acknowledgement by Ward Officials' },
                { value: 'INADEQUATE_PROGRESS', label: 'Inadequate or Stalled Field Progress' },
                { value: 'DISPUTED_RESOLUTION', label: 'Disputed False Claim of Resolution' },
                { value: 'REPEATED_DELAY', label: 'Repeated Unjustified Delay Extensions' },
              ]}
              onChange={(e) => setFormData({ ...formData, reason_category: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Target Escalation Authority"
              value={formData.escalation_tier}
              options={[
                { value: 'TIER_2_MUNICIPAL_COMMISSIONER', label: 'Municipal Corporation Commissioner' },
                { value: 'TIER_3_DISTRICT_COLLECTOR', label: 'District Collectorate Oversight Wing' },
                { value: 'TIER_4_CM_HELPLINE_EXTERNAL', label: 'State Chief Minister Helpline (1100)' },
              ]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  escalation_tier: e.target.value,
                  target_authority:
                    e.target.value === 'TIER_3_DISTRICT_COLLECTOR'
                      ? 'District Collectorate'
                      : e.target.value === 'TIER_4_CM_HELPLINE_EXTERNAL'
                      ? 'CM Helpline 1100 Portal'
                      : 'Municipal Commissioner',
                })
              }
            />

            <Input
              label="External Portal Token / Memo (Optional)"
              placeholder="e.g. TNC-2026-8812"
              value={formData.external_portal_ref}
              onChange={(e) => setFormData({ ...formData, external_portal_ref: e.target.value })}
            />
          </div>

          <Textarea
            label="Detailed Justification for Escalation"
            required
            rows={3}
            placeholder="Explain why local ward handling failed to resolve the defect..."
            value={formData.detailed_reason}
            onChange={(e) => setFormData({ ...formData, detailed_reason: e.target.value })}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
              Submit Formal Escalation
            </Button>
          </div>
        </form>
      )}

      {/* Escalations List */}
      <div className="space-y-4">
        {escalations.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E7E5E4] p-10 text-center text-xs text-[#737373]">
            No escalations filed. If a grievance fails to meet its committed target date, you can escalate it here.
          </div>
        ) : (
          escalations.map((esc) => (
            <div
              key={esc.id}
              className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                    {esc.escalation_reference}
                  </span>
                  <span className="font-mono text-xs text-[#737373]">
                    Re: {esc.complaint_reference_id}
                  </span>
                </div>

                <Badge variant={esc.status === 'ACTION_TAKEN' ? 'success' : 'warning'}>
                  {esc.status}
                </Badge>
              </div>

              <div className="text-xs font-bold text-[#171717]">
                Authority: {esc.target_authority} &bull; Cause: {esc.reason_category?.replace(/_/g, ' ')}
              </div>

              <p className="text-xs text-[#737373] leading-relaxed whitespace-pre-wrap">
                {esc.detailed_reason}
              </p>

              {esc.official_action_notes && (
                <div className="p-3 bg-neutral-50 rounded-lg border border-[#E7E5E4] text-xs text-neutral-800">
                  <span className="font-bold block text-[11px] text-[#171717]">
                    Official Action Note:
                  </span>
                  {esc.official_action_notes}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#E7E5E4] text-[11px] text-[#737373]">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Escalated on {formatDate(esc.created_at)}</span>
                </div>

                <a
                  href={`/complaints/${esc.complaint_id}`}
                  className="font-semibold text-[#F97316] hover:underline flex items-center gap-1"
                >
                  <span>View Original Ticket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
