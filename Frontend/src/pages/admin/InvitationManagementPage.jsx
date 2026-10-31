// Frontend/src/pages/admin/InvitationManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { departmentService } from '../../services/departmentService';
import { useWard } from '../../hooks/useWard';
import { useLanguage } from '../../hooks/useLanguage';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Mail,
  Send,
  PlusCircle,
  Copy,
  Check,
  RefreshCw,
  Ban,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Building,
  Briefcase,
  ShieldCheck,
  Search,
  ExternalLink,
} from 'lucide-react';

export function InvitationManagementPage() {
  const { isTamil } = useLanguage();
  const { wards } = useWard();

  const [invitations, setInvitations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);

  // Invite modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteType, setInviteType] = useState('WARD_COUNCILLOR'); // 'WARD_COUNCILLOR' | 'DEPARTMENT_HANDLER'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Chennai');
  const [wardNumber, setWardNumber] = useState('114');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [invData, deptData] = await Promise.all([
        adminService.getInvitations(),
        departmentService.getDepartments().catch(() => []),
      ]);
      setInvitations(invData || []);
      setDepartments(deptData || []);
      if (deptData?.length > 0 && !departmentId) {
        setDepartmentId(deptData[0].id);
      }
    } catch (err) {
      console.error('Failed to load invitations:', err);
      setError(err.response?.data?.message || 'Failed to load invitations list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyLink = (token) => {
    const origin = window.location.origin;
    const url = `${origin}/invitation/accept?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleCreateInvite = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionSuccess('');

    if (!fullName.trim() || !email.trim()) {
      return setFormError('Full Name and Email are required');
    }

    setIsSubmitting(true);
    try {
      const selectedDept = departments.find((d) => d.id === departmentId);
      const payload = {
        role: inviteType,
        full_name: fullName.trim(),
        email: email.trim(),
        ...(inviteType === 'WARD_COUNCILLOR'
          ? {
              district_id: district,
              ward_number: wardNumber,
              ward_id: `ward_${wardNumber}`,
            }
          : {
              department_id: departmentId,
              department_name: selectedDept?.name || 'Municipal Works',
              designation: designation.trim() || 'Department Officer',
            }),
      };

      const result = await adminService.createInvitation(payload);
      setShowInviteModal(false);
      setFullName('');
      setEmail('');
      setDesignation('');
      setActionSuccess(`Invitation dispatched for ${result.full_name} (${result.email})! Token: ${result.token}`);
      await loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to dispatch invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (id) => {
    try {
      await adminService.resendInvitation(id);
      setActionSuccess('Invitation re-issued and expiration renewed for 7 days!');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resend invitation');
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this invitation? The token will become immediately invalid.')) {
      return;
    }
    try {
      await adminService.revokeInvitation(id);
      setActionSuccess('Invitation revoked.');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke invitation');
    }
  };

  // Filtered invitations
  const filteredInvitations = invitations.filter((inv) => {
    const matchesSearch =
      inv.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.token?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || inv.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || inv.status?.toUpperCase() === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Breadcrumbs
        items={[{ label: 'Admin', to: '/admin' }, { label: 'Invitation Management' }]}
      />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-[#EA580C] mb-2">
            <Send className="w-3.5 h-3.5" />
            <span>Official Roles Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
            {isTamil ? 'அழைப்பு மேலாண்மை' : 'Invitation Management'}
          </h1>
          <p className="text-xs text-[#737373] mt-1 max-w-2xl leading-relaxed">
            {isTamil
              ? 'வார்டு கவுன்சிலர்கள் மற்றும் அரசு துறை அதிகாரிகளுக்கு பாதுகாப்பான மின்னஞ்சல் அழைப்புகளை அனுப்பவும், ஏற்கப்பட்ட நிலைகளை கண்காணிக்கவும்.'
              : 'Issue cryptographic 32-byte onboarding tokens for Ward Councillors and Department Staff. Citizens register publicly, while official administrative roles require admin-issued invitations.'}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={PlusCircle}
          onClick={() => {
            setShowInviteModal(true);
            setFormError('');
          }}
          className="shadow-xs self-start md:self-auto"
        >
          {isTamil ? 'புதிய அழைப்பை அனுப்புக' : 'Dispatch New Invitation'}
        </Button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-900 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess('')}
            className="text-green-700 hover:text-green-900 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or token..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-1 focus:ring-[#F97316] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-50 rounded-xl border border-[#E7E5E4] font-semibold text-neutral-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="WARD_COUNCILLOR">Ward Councillor</option>
            <option value="DEPARTMENT_HANDLER">Department Staff</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-50 rounded-xl border border-[#E7E5E4] font-semibold text-neutral-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Acceptance</option>
            <option value="ACCEPTED">Accepted / Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="REVOKED">Revoked</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={loadData}
            isLoading={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Invitations Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredInvitations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-12 text-center text-xs text-[#737373] space-y-2">
          <Mail className="w-8 h-8 text-neutral-300 mx-auto mb-1" />
          <div className="font-bold text-[#171717]">No invitations found</div>
          <div>No official invitations match the current search filters or none have been sent yet.</div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#171717]">
              <thead className="bg-[#FAF9F6] border-b border-[#E7E5E4] text-[#737373] uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-4">Recipient</th>
                  <th className="p-4">Invited Role</th>
                  <th className="p-4">Assigned Jurisdiction</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Issued & Expiry</th>
                  <th className="p-4">Invitation Link</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {filteredInvitations.map((inv) => {
                  const isPending = inv.status === 'Pending' || inv.status === 'PENDING';
                  const isAccepted = inv.status === 'Accepted' || inv.status === 'ACCEPTED';
                  const isRevoked = inv.status === 'Revoked' || inv.status === 'REVOKED';
                  const isExpired = inv.status === 'Expired' || inv.status === 'EXPIRED';

                  return (
                    <tr key={inv.id} className="hover:bg-neutral-50 transition-colors">
                      {/* Recipient */}
                      <td className="p-4">
                        <div className="font-bold text-[#171717]">{inv.full_name}</div>
                        <div className="text-[11px] text-[#737373]">{inv.email}</div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-orange-50 text-orange-700 border border-orange-200">
                          {inv.role?.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Jurisdiction */}
                      <td className="p-4 text-[11px]">
                        {inv.role === 'WARD_COUNCILLOR' ? (
                          <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                            <Building className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                            <span>Ward {inv.ward_number || inv.ward_id}, {inv.district_id || 'Tamil Nadu'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                            <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{inv.department_name || inv.department_id || 'Department'} ({inv.designation || 'Staff'})</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {isAccepted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Accepted
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3 animate-pulse" />
                            Pending Acceptance
                          </span>
                        ) : isRevoked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            <Ban className="w-3 h-3" />
                            Revoked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                            Expired
                          </span>
                        )}
                      </td>

                      {/* Issued & Expiry */}
                      <td className="p-4 text-[11px] text-[#737373]">
                        <div>Created: {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'Recent'}</div>
                        <div className="text-[10px] text-neutral-400">
                          Expires: {inv.expires_at ? new Date(inv.expires_at).toLocaleDateString() : '7 days'}
                        </div>
                      </td>

                      {/* Invitation Link */}
                      <td className="p-4">
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => handleCopyLink(inv.token)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E7E5E4] bg-white hover:bg-neutral-100 text-[11px] font-semibold text-[#171717] transition-all cursor-pointer"
                          >
                            {copiedToken === inv.token ? (
                              <>
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-green-700 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#737373]" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] text-neutral-400 font-mono">Token redeemed</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        {isPending && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="xs"
                              icon={RefreshCw}
                              onClick={() => handleResend(inv.id)}
                              title="Resend invitation and extend expiry"
                            >
                              Resend
                            </Button>
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-red-600 hover:bg-red-50 border-red-200"
                              icon={Ban}
                              onClick={() => handleRevoke(inv.id)}
                              title="Revoke invitation"
                            >
                              Revoke
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: DISPATCH NEW INVITATION */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E7E5E4] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Send className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#171717]">
                    Dispatch Official Invitation
                  </h3>
                  <p className="text-[11px] text-[#737373]">
                    Issue a cryptographic invite token to onboarding official personnel.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateInvite} className="space-y-4 text-xs">
              {/* Role Type Selector */}
              <div>
                <label className="block font-bold text-[#171717] uppercase tracking-wider text-[11px] mb-1.5">
                  Official Role Designation <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteType('WARD_COUNCILLOR')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      inviteType === 'WARD_COUNCILLOR'
                        ? 'border-[#F97316] bg-orange-50/70 text-orange-950 font-bold ring-1 ring-[#F97316]'
                        : 'border-[#E7E5E4] bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <Building className="w-4 h-4 text-orange-600" />
                      <span>Ward Councillor</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-normal">
                      Manages ward grievances & verification
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInviteType('DEPARTMENT_HANDLER')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      inviteType === 'DEPARTMENT_HANDLER'
                        ? 'border-[#F97316] bg-orange-50/70 text-orange-950 font-bold ring-1 ring-[#F97316]'
                        : 'border-[#E7E5E4] bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span>Department Staff</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-normal">
                      Handles resolution work & progress
                    </span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block font-bold text-[#171717] uppercase tracking-wider text-[11px] mb-1">
                  Full Name of Official <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={inviteType === 'WARD_COUNCILLOR' ? 'e.g. Senthil Nathan' : 'e.g. Er. Murugan'}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-1 focus:ring-[#F97316] focus:bg-white"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-bold text-[#171717] uppercase tracking-wider text-[11px] mb-1">
                  Official Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="official@corporation.tn.gov.in"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-1 focus:ring-[#F97316] focus:bg-white"
                  />
                </div>
              </div>

              {/* Ward Councillor Specifics */}
              {inviteType === 'WARD_COUNCILLOR' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <div>
                    <label className="block font-semibold text-[#171717] text-[11px] mb-1">
                      District Jurisdiction
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E7E5E4] rounded-lg focus:ring-1 focus:ring-[#F97316]"
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
                    <label className="block font-semibold text-[#171717] text-[11px] mb-1">
                      Assigned Ward Number
                    </label>
                    <input
                      type="text"
                      required
                      value={wardNumber}
                      onChange={(e) => setWardNumber(e.target.value)}
                      placeholder="e.g. 114"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E7E5E4] rounded-lg focus:ring-1 focus:ring-[#F97316]"
                    />
                  </div>
                </div>
              )}

              {/* Department Staff Specifics */}
              {inviteType === 'DEPARTMENT_HANDLER' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <div>
                    <label className="block font-semibold text-[#171717] text-[11px] mb-1">
                      Municipal Department
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E7E5E4] rounded-lg focus:ring-1 focus:ring-[#F97316]"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#171717] text-[11px] mb-1">
                      Official Designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Assistant Executive Engineer"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E7E5E4] rounded-lg focus:ring-1 focus:ring-[#F97316]"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E7E5E4]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  icon={Send}
                >
                  Create & Dispatch Token
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
