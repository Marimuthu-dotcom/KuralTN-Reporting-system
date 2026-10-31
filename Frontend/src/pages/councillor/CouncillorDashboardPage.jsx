// Frontend/src/pages/councillor/CouncillorDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Megaphone,
  Briefcase,
  Users,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { StatCard } from '../../components/dashboard/StatCard';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { ActivityList } from '../../components/dashboard/ActivityList';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function CouncillorDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [proceedModalComplaint, setProceedModalComplaint] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [isProceeding, setIsProceeding] = useState(false);

  const loadWardData = async () => {
    setIsLoading(true);
    try {
      const res = await complaintService.getComplaints({ ward_id: user?.ward_id, limit: 100 });
      setComplaints(res.data || []);
    } catch (err) {
      console.error('Failed to load councillor metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWardData();
  }, [user]);

  const handleOpenProceed = (comp) => {
    setProceedModalComplaint(comp);
    setVerificationNotes(`Inspected field conditions at ${comp.address_text}. Genuine civic grievance confirmed on ground. Forwarding for immediate departmental action.`);
    setSelectedDeptId(comp.department_id || '');
  };

  const handleExecuteProceed = async (e) => {
    e.preventDefault();
    if (!proceedModalComplaint) return;
    setIsProceeding(true);
    try {
      await complaintService.councillorProceed(proceedModalComplaint.id, {
        verification_notes: verificationNotes,
        department_id: selectedDeptId || undefined,
      });
      setProceedModalComplaint(null);
      await loadWardData();
      alert(`Success! Complaint ${proceedModalComplaint.reference_id} verified and officially forwarded to department.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify and proceed complaint');
    } finally {
      setIsProceeding(false);
    }
  };

  if (isLoading) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;

  const pendingVerification = complaints.filter(
    (c) => !c.councillor_verified || c.status === 'Pending Councillor Verification'
  );
  const total = complaints.length;
  const inProgress = complaints.filter((c) => ['Acknowledged', 'In Progress', 'Under Review'].includes(c.status)).length;
  const overdue = complaints.filter((c) => c.deadline_condition === 'OVERDUE').length;
  const resolutionProposed = complaints.filter((c) => c.status === 'Resolution Proposed').length;
  const resolved = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={`Ward Councillor Chamber`}
        subtitle={`${user?.full_name} &bull; Jurisdiction: ${user?.ward_name || 'Ward ' + user?.ward_id}`}
        actions={
          <div className="flex gap-2">
            <Link to="/councillor/assignments">
              <Button variant="outline" size="md">
                🏛️ Department Triage
              </Button>
            </Link>
            <Link to="/councillor/announcements">
              <Button variant="primary" size="md" icon={Megaphone}>
                Broadcast Announcement
              </Button>
            </Link>
          </div>
        }
      />

      {/* Civic Middleware: Pending Councillor Verification Queue */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              🛡️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#171717] flex items-center gap-2">
                <span>Citizen Complaints Awaiting Councillor Verification & Dispatch</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-xs font-bold font-mono">
                  {pendingVerification.length} Pending
                </span>
              </h2>
              <p className="text-xs text-[#737373] mt-0.5 max-w-2xl">
                As the elected Ward Councillor, you are the accountable civic middleware. Verify citizen reports on the ground, then click <strong>"Proceed"</strong> to officially transmit the grievance to the responsible municipal department.
              </p>
            </div>
          </div>
          <Link to="/councillor/complaints?status=Pending+Councillor+Verification">
            <Button variant="outline" size="sm" className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100">
              View All ({pendingVerification.length})
            </Button>
          </Link>
        </div>

        {pendingVerification.length === 0 ? (
          <div className="bg-white/80 rounded-2xl p-4 border border-amber-200 text-center text-xs text-[#737373]">
            ✓ All citizen complaints in your ward have been verified and forwarded to departments. No grievances are currently blocked in the middleware queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingVerification.slice(0, 4).map((comp) => (
              <div
                key={comp.id}
                className="bg-white rounded-2xl border border-amber-200/90 p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-neutral-900 text-white rounded">
                      {comp.reference_id}
                    </span>
                    <span className="text-[11px] font-bold text-[#F97316] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      {comp.category_name}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#171717] line-clamp-1">{comp.title}</h4>
                  <p className="text-xs text-[#737373] line-clamp-2 mt-1">{comp.description}</p>
                  <div className="text-[11px] text-[#737373] mt-2 flex items-center justify-between">
                    <span>📍 {comp.address_text || 'Ward Location'}</span>
                    <span>Reported by: <strong>{comp.reporter_name}</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-[#737373]">
                    Target Dept: <span className="font-semibold text-[#171717]">{comp.department_name || 'Municipal Dept'}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/councillor/complaints/${comp.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Inspect
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenProceed(comp)}
                      className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                    >
                      <span>Proceed to Dept &rarr;</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overdue Alert banner if any */}
      {overdue > 0 && (
        <div className="p-4 bg-red-600 text-white rounded-2xl shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold block text-sm">
                Urgent Action: {overdue} Grievance(s) Exceeded Committed Deadlines
              </span>
              Target dates lapsed without verified resolution. Please liaise with Assistant Executive Engineers.
            </div>
          </div>
          <Link to="/councillor/deadlines">
            <Button variant="secondary" size="sm" className="bg-neutral-900 text-white hover:bg-neutral-800">
              Manage Overdue Delays
            </Button>
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Awaiting Verification"
          value={pendingVerification.length}
          subtitle="Held in Councillor Queue"
          icon={Shield}
          variant={pendingVerification.length > 0 ? 'warning' : 'default'}
          onClick={() => navigate('/councillor/complaints?status=Pending+Councillor+Verification')}
        />
        <StatCard
          title="Total Ward Issues"
          value={total}
          subtitle="All grievances in ward"
          icon={FileText}
          onClick={() => navigate('/councillor/complaints')}
        />
        <StatCard
          title="Active Field Work"
          value={inProgress}
          subtitle="Dispatched / in progress"
          icon={Clock}
          variant="primary"
          onClick={() => navigate('/councillor/complaints')}
        />
        <StatCard
          title="Overdue Delays"
          value={overdue}
          subtitle="Exceeded SLA target"
          icon={AlertTriangle}
          variant={overdue > 0 ? 'danger' : 'default'}
          onClick={() => navigate('/councillor/deadlines')}
        />
        <StatCard
          title="Citizen Review"
          value={resolutionProposed}
          subtitle="Awaiting citizen test"
          icon={CheckCircle2}
          variant="warning"
          onClick={() => navigate('/councillor/resolutions')}
        />
      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/councillor/assignments"
          className="p-4 bg-white rounded-xl border border-[#E7E5E4] hover:border-[#F97316] transition-all flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-[#F97316] rounded-lg">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#171717] block">Department Triage</span>
              <span className="text-[11px] text-[#737373]">Coordinate verified issues with departments</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#737373]" />
        </Link>

        <Link
          to="/councillor/deadlines"
          className="p-4 bg-white rounded-xl border border-[#E7E5E4] hover:border-[#F97316] transition-all flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#171717] block">Deadline Management</span>
              <span className="text-[11px] text-[#737373]">Assign and extend department targets</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#737373]" />
        </Link>

        <Link
          to="/ward"
          className="p-4 bg-white rounded-xl border border-[#E7E5E4] hover:border-[#F97316] transition-all flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-100 text-neutral-800 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#171717] block">Ward Live Chat</span>
              <span className="text-[11px] text-[#737373]">Coordinate with ward residents</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#737373]" />
        </Link>
      </div>

      {/* Ward Activity Feed */}
      <ActivityList items={complaints.slice(0, 8)} title="Ward Complaints Triage" />

      {/* Quick Proceed to Department Modal */}
      {proceedModalComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E7E5E4] space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  🛡️
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#171717]">
                    Ward Councillor Verification & Proceed
                  </h3>
                  <span className="text-xs text-[#737373]">
                    {proceedModalComplaint.reference_id}: {proceedModalComplaint.title}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProceedModalComplaint(null)}
                className="text-[#737373] hover:text-[#171717] text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Accountability Check:</strong> As Ward Councillor <strong>{user?.full_name}</strong>, confirming this action signifies that you have verified this citizen complaint and are officially transmitting it to the municipal department for field execution.
            </div>

            <form onSubmit={handleExecuteProceed} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                  Ground Inspection & Endorsement Notes
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full text-xs p-3 bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:ring-2 focus:ring-[#F97316] focus:outline-none"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Record your field observations, verification findings, and instructions to the department..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                  Transmitting to Municipal Department
                </label>
                <div className="p-3 bg-neutral-100 rounded-xl text-xs font-bold text-[#171717] flex items-center justify-between">
                  <span>🏛️ {proceedModalComplaint.department_name || 'Managing Department'}</span>
                  <span className="text-[10px] text-[#737373] font-mono">Assigned Wing</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E7E5E4]">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setProceedModalComplaint(null)}
                  disabled={isProceeding}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isProceeding}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Confirm & Proceed to Department &rarr;
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
