// Frontend/src/pages/admin/AdminDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Users,
  Building,
  FileText,
  Clock,
  Shield,
  ShieldAlert,
  BarChart3,
  Lock,
  ArrowRight,
} from 'lucide-react';

export function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        const data = await adminService.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="State Governance & Platform Control Cell"
        subtitle="Tamil Nadu Civic Grievance Management Infrastructure Administration"
      />

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          value={analytics?.totalComplaints || 0}
          subtitle="Statewide recorded issues"
          icon={FileText}
          variant="default"
        />
        <StatCard
          title="Resolution Rate"
          value={`${analytics?.resolutionRatePercentage || 0}%`}
          subtitle={`${analytics?.resolved || 0} citizen confirmed`}
          icon={BarChart3}
          variant="success"
        />
        <StatCard
          title="Overdue Delays"
          value={analytics?.overdue || 0}
          subtitle="Passed statutory SLA"
          icon={Clock}
          variant="danger"
        />
        <StatCard
          title="Confidential Cases"
          value={analytics?.totalAccountabilityCases || 0}
          subtitle="Whistleblower inquiries"
          icon={Lock}
          variant="warning"
        />
      </div>

      {/* Administrative Control Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="bg-white rounded-2xl border border-[#E7E5E4] p-6 hover:border-[#F97316] transition-all flex items-start gap-4 shadow-2xs group"
        >
          <div className="p-3 bg-orange-100 text-[#F97316] rounded-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#171717] group-hover:text-[#F97316]">
              User & Role Governance
            </h3>
            <p className="text-xs text-[#737373] mt-1 leading-relaxed">
              Assign Councillors to wards, designate Department Handlers, and grant Reviewer credentials.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/districts"
          className="bg-white rounded-2xl border border-[#E7E5E4] p-6 hover:border-[#F97316] transition-all flex items-start gap-4 shadow-2xs group"
        >
          <div className="p-3 bg-neutral-100 text-[#171717] rounded-xl shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#171717] group-hover:text-[#F97316]">
              Administrative Geography
            </h3>
            <p className="text-xs text-[#737373] mt-1 leading-relaxed">
              Maintain Tamil Nadu districts, corporations, municipalities, and ward boundaries.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/categories"
          className="bg-white rounded-2xl border border-[#E7E5E4] p-6 hover:border-[#F97316] transition-all flex items-start gap-4 shadow-2xs group"
        >
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#171717] group-hover:text-[#F97316]">
              Complaint Categories & SLAs
            </h3>
            <p className="text-xs text-[#737373] mt-1 leading-relaxed">
              Configure civic problem categories, estimated resolution days, and responsible wings.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/deadline-rules"
          className="bg-white rounded-2xl border border-[#E7E5E4] p-6 hover:border-[#F97316] transition-all flex items-start gap-4 shadow-2xs group"
        >
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#171717] group-hover:text-[#F97316]">
              Citizen Charter SLA Rules
            </h3>
            <p className="text-xs text-[#737373] mt-1 leading-relaxed">
              Enforce statutory service deadlines and maximum permitted delay extensions.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/official-contacts"
          className="bg-white rounded-2xl border border-[#E7E5E4] p-6 hover:border-[#F97316] transition-all flex items-start gap-4 shadow-2xs group"
        >
          <div className="p-3 bg-red-100 text-red-800 rounded-xl shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#171717] group-hover:text-[#F97316]">
              Escalation Directory Registry
            </h3>
            <p className="text-xs text-[#737373] mt-1 leading-relaxed">
              Maintain verified contacts for CM Helpline 1100, TANGEDCO, and municipal desks.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/audit-logs"
          className="bg-white rounded-2xl border border-[#E7E5E4] p-6 hover:border-[#F97316] transition-all flex items-start gap-4 shadow-2xs group"
        >
          <div className="p-3 bg-purple-100 text-purple-800 rounded-xl shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#171717] group-hover:text-[#F97316]">
              Security Audit Logs
            </h3>
            <p className="text-xs text-[#737373] mt-1 leading-relaxed">
              Review tamper-evident system logs, status modifications, and role updates.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
