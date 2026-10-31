// Frontend/src/pages/councillor/ManageComplaintPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { deadlineService } from '../../services/deadlineService';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { ProgressUpdateForm } from '../../components/complaints/ProgressUpdateForm';
import { ResolutionEvidenceForm } from '../../components/complaints/ResolutionEvidenceForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { departmentService } from '../../services/departmentService';
import { formatDateTime } from '../../utils/dateUtils';

export function ManageComplaintPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('status'); // status, deadline, progress, resolve

  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [deadlineType, setDeadlineType] = useState('DEPARTMENT_PROVIDED_TARGET');
  const [supportingSource, setSupportingSource] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Councillor Proceed state
  const [verificationNotes, setVerificationNotes] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('MEDIUM');
  const [proceedLoading, setProceedLoading] = useState(false);

  const fetchComplaint = async () => {
    setIsLoading(true);
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
      setNewStatus(data.status);
      setSelectedDeptId(data.department_id || data.department?.id || '');
      setSelectedPriority(data.priority || 'MEDIUM');
      setVerificationNotes(
        data.councillor_notes ||
        `Inspected field conditions at ${data.address_text}. Genuine civic grievance confirmed on ground. Transmitting to municipal department for execution.`
      );
    } catch (err) {
      alert('Failed to load complaint');
      navigate('/councillor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
    departmentService.getDepartments()
      .then((depts) => setDepartments(depts || []))
      .catch((err) => console.error('Failed to load depts:', err));
  }, [id]);

  const handleCouncillorProceed = async (e) => {
    e.preventDefault();
    setProceedLoading(true);
    try {
      await complaintService.councillorProceed(id, {
        verification_notes: verificationNotes.trim(),
        department_id: selectedDeptId || undefined,
        priority: selectedPriority,
      });
      await fetchComplaint();
      alert('Success! Grievance officially verified and forwarded to department.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify and proceed complaint');
    } finally {
      setProceedLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusReason.trim()) return alert('Reason is required for status transitions');

    setActionLoading(true);
    try {
      await complaintService.updateStatus(id, {
        status: newStatus,
        reason: statusReason.trim(),
        update_source: 'COUNCILLOR',
      });
      setStatusReason('');
      await fetchComplaint();
      alert('Status successfully updated!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetDeadline = async (e) => {
    e.preventDefault();
    if (!targetDate || !supportingSource.trim()) {
      return alert('Target date and supporting reference are required');
    }

    setActionLoading(true);
    try {
      await deadlineService.proposeDeadline(id, {
        target_date: targetDate,
        deadline_type: deadlineType,
        responsible_department: complaint.category_name,
        supporting_source_text: supportingSource.trim(),
      });
      setSupportingSource('');
      await fetchComplaint();
      alert('Official deadline recorded!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record deadline');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProgressSubmit = async (data) => {
    setActionLoading(true);
    try {
      await complaintService.submitProgress(id, data);
      await fetchComplaint();
      alert('Progress update published!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit progress');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveSubmit = async (data) => {
    setActionLoading(true);
    try {
      await complaintService.proposeResolution(id, data);
      await fetchComplaint();
      alert('Resolution proposed for citizen verification!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to propose resolution');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;
  if (!complaint) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Ward Complaints', to: '/councillor/complaints' },
          { label: `Manage ${complaint.reference_id}` },
        ]}
      />

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-neutral-900 text-white">
            {complaint.reference_id}
          </span>
          <span className="text-xs font-semibold text-[#F97316]">{complaint.category_name}</span>
          <span className="text-xs text-[#737373] ml-auto">Current Status: <strong>{complaint.status}</strong></span>
        </div>
        <h1 className="text-xl font-bold text-[#171717]">{complaint.title}</h1>
        <p className="text-xs text-[#737373]">{complaint.address_text}</p>
      </div>

      {/* Civic Middleware: Councillor Verification & Accountability Proceed */}
      {!complaint.councillor_verified || complaint.status === 'Pending Councillor Verification' ? (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              🛡️
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#171717]">
                  Action Required: Ward Councillor Verification (Civic Middleware)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-mono font-bold">
                  HELD IN MIDDLEWARE
                </span>
              </div>
              <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                In Tamil Nadu civic governance protocol, citizen grievances do not bypass the Ward Councillor. As the elected representative, you are the accountable intermediary. Verify the issue on the ground, then click <strong>"Proceed to Department"</strong> to authorize transmission to the municipal engineering wing.
              </p>
            </div>
          </div>

          <form onSubmit={handleCouncillorProceed} className="space-y-4 pt-2 border-t border-amber-200">
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                Ground Verification Observations & Endorsement Note <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="w-full text-xs p-3 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-[#F97316] focus:outline-none"
                placeholder="Record your field observations, confirmed damage, and instructions for department engineers..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  Designated Municipal Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-[#F97316] focus:outline-none font-medium"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  Assessed Urgency Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-[#F97316] focus:outline-none font-medium"
                >
                  <option value="LOW">Low Priority (Routine Work)</option>
                  <option value="MEDIUM">Medium Priority (Standard Charter SLA)</option>
                  <option value="HIGH">High Priority (Urgent Public Inconvenience)</option>
                  <option value="CRITICAL">Critical Emergency (Immediate Hazard)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-[#737373] italic">
                Clicking proceed stamps your official digital endorsement and notifies both the citizen and department officers.
              </span>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={proceedLoading}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 shadow-sm shrink-0"
              >
                <span>Proceed: Verify & Forward to Department &rarr;</span>
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-green-50/90 border border-green-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-green-600 text-white flex items-center justify-center font-bold text-base shrink-0">
              ✓
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-green-900">
                  Officially Verified & Transmitted by Ward Councillor
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-green-100 text-green-800 font-bold">
                  {formatDateTime(complaint.councillor_verified_at)}
                </span>
              </div>
              <p className="text-xs text-green-800 truncate mt-0.5">
                Verified by <strong>{complaint.councillor_name}</strong> &bull; Endorsement: "{complaint.councillor_notes}"
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-green-200 text-xs font-bold text-green-800">
              🏛️ {complaint.department_name || 'Department Received'}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#E7E5E4] gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('status')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'status'
              ? 'border-[#F97316] text-[#F97316]'
              : 'border-transparent text-[#737373] hover:text-[#171717]'
          }`}
        >
          Update Official Status
        </button>
        <button
          onClick={() => setActiveTab('deadline')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'deadline'
              ? 'border-[#F97316] text-[#F97316]'
              : 'border-transparent text-[#737373] hover:text-[#171717]'
          }`}
        >
          Assign/Extend Deadline
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'progress'
              ? 'border-[#F97316] text-[#F97316]'
              : 'border-transparent text-[#737373] hover:text-[#171717]'
          }`}
        >
          Log Field Progress
        </button>
        <button
          onClick={() => setActiveTab('resolve')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'resolve'
              ? 'border-[#F97316] text-[#F97316]'
              : 'border-transparent text-[#737373] hover:text-[#171717]'
          }`}
        >
          Propose Resolution
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs">
        {activeTab === 'status' && (
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <h3 className="text-sm font-bold text-[#171717]">Status Transition Workflow</h3>
            <Select
              label="New Official Status"
              value={newStatus}
              options={[
                { value: 'Acknowledged', label: 'Acknowledged (Inspected by Councillor)' },
                { value: 'Under Review', label: 'Under Review (Assigned to Engineering Wing)' },
                { value: 'In Progress', label: 'In Progress (Active Field Work)' },
                { value: 'Rejected', label: 'Rejected (Outside Jurisdiction or Duplicate)' },
              ]}
              onChange={(e) => setNewStatus(e.target.value)}
            />
            <Textarea
              label="Mandatory Reason & Official Note"
              required
              rows={3}
              placeholder="Explain the inspection findings, team deployed, or justification..."
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={actionLoading}>
                Confirm Status Transition
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'deadline' && (
          <form onSubmit={handleSetDeadline} className="space-y-4">
            <h3 className="text-sm font-bold text-[#171717]">Record Evidence-Based Target Date</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Target Date"
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
              <Select
                label="Deadline Classification"
                value={deadlineType}
                options={[
                  { value: 'DEPARTMENT_PROVIDED_TARGET', label: 'Department Provided Target' },
                  { value: 'VERIFIED_OFFICIAL_TIMELINE', label: 'Verified Citizen Charter Timeline' },
                  { value: 'ESTIMATED_TARGET', label: 'Estimated Target' },
                ]}
                onChange={(e) => setDeadlineType(e.target.value)}
              />
            </div>
            <Input
              label="Supporting Reference / Memo Source"
              required
              placeholder="e.g. Committed by Sanitary Inspector via Memo TK-1088"
              value={supportingSource}
              onChange={(e) => setSupportingSource(e.target.value)}
              helperText="Do not enter arbitrary dates without department source reference."
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={actionLoading}>
                Save Target Date
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'progress' && (
          <ProgressUpdateForm
            complaintId={complaint.id}
            onSubmit={handleProgressSubmit}
            isLoading={actionLoading}
          />
        )}

        {activeTab === 'resolve' && (
          <ResolutionEvidenceForm
            complaintId={complaint.id}
            onSubmit={handleResolveSubmit}
            isLoading={actionLoading}
          />
        )}
      </div>
    </div>
  );
}
