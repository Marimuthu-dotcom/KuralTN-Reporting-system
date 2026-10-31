// Frontend/src/pages/admin/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { departmentService } from '../../services/departmentService';
import { useWard } from '../../hooks/useWard';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  Building2,
  MapPin,
  Lock,
  Unlock,
  Shield,
  FileCheck,
  Users,
} from 'lucide-react';

export function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'users'

  // Modal states for approving / rejecting registration requests
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states for approval
  const [assignRole, setAssignRole] = useState('CITIZEN');
  const [assignWardId, setAssignWardId] = useState('');
  const [assignDepartmentId, setAssignDepartmentId] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const { wards } = useWard();

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [usersData, reqData, deptsData] = await Promise.all([
        adminService.getUsers(),
        adminService.getApprovalRequests(),
        departmentService.getDepartments().catch(() => []),
      ]);
      setUsers(usersData || []);
      setApprovalRequests(reqData || []);
      setDepartments(deptsData || []);
    } catch (err) {
      console.error('Failed to load user administration data:', err);
      setLoadError('Failed to load user accounts from database. Please check connection and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openApproveModal = (req) => {
    setSelectedRequest(req);
    setAssignRole(req.requested_role || 'CITIZEN');
    setAssignWardId(req.requested_ward_id || (wards[0]?.id || ''));
    setAssignDepartmentId(req.requested_department_id || (departments[0]?.id || ''));
    setApprovalNotes(req.notes || '');
    setApprovalModalOpen(true);
  };

  const openRejectModal = (req) => {
    setSelectedRequest(req);
    setRejectionReason('');
    setRejectionModalOpen(true);
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (assignRole === 'WARD_COUNCILLOR' && !assignWardId) {
      alert('A residential ward must be assigned to an approved Ward Councillor.');
      return;
    }
    if (assignRole === 'DEPARTMENT_HANDLER' && !assignDepartmentId) {
      alert('A municipal department must be assigned to approved Department Staff.');
      return;
    }

    setActionLoading(true);
    try {
      await adminService.approveRegistrationRequest(selectedRequest.id, {
        role: assignRole,
        ward_id: assignRole === 'WARD_COUNCILLOR' || assignRole === 'CITIZEN' ? assignWardId : null,
        department_id: assignRole === 'DEPARTMENT_HANDLER' ? assignDepartmentId : null,
        notes: approvalNotes,
      });
      setApprovalModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve account request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      await adminService.rejectRegistrationRequest(selectedRequest.id, {
        reason: rejectionReason.trim() || 'Application did not satisfy administrative identity verification.',
      });
      setRejectionModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject account request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    const isSuspending = user.is_active && user.approval_status !== 'SUSPENDED';
    const confirmMsg = isSuspending
      ? `Are you sure you want to suspend application access for ${user.full_name}?`
      : `Reactivate application access for ${user.full_name}?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(user.id);
    try {
      await adminService.updateUserStatus(user.id, {
        is_active: !isSuspending,
        approval_status: isSuspending ? 'SUSPENDED' : 'APPROVED',
        reason: isSuspending ? 'Suspended by system administrator' : 'Reactivated by system administrator',
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user account status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, { role: newRole });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleVerifyWard = async (userId, status) => {
    setActionLoadingId(userId);
    try {
      await adminService.verifyUserWard(userId, {
        status,
        reason: status === 'APPROVED' ? 'Verified by Municipal Administration' : 'Address verification rejected',
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${status.toLowerCase()} ward verification`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingApprovalsCount = approvalRequests.filter((r) => r.status === 'PENDING').length;

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'User & Role Administration' }]} />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
            User Access & Role Approval
          </h1>
          <p className="text-xs text-[#737373] mt-1 leading-relaxed">
            Administrator-controlled registration verification, role assignment, and access control governance.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-semibold self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('approvals')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'approvals'
                ? 'bg-[#F97316] text-white shadow-xs font-bold'
                : 'text-[#737373] hover:text-[#171717]'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Pending Approvals</span>
            {pendingApprovalsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'approvals' ? 'bg-white text-[#EA580C]' : 'bg-[#EA580C] text-white'
              }`}>
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#F97316] text-white shadow-xs font-bold'
                : 'text-[#737373] hover:text-[#171717]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>All Users Directory ({users.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PENDING ACCOUNT & ROLE APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#171717] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F97316]" />
              <span>Registration Approval Queue</span>
            </h2>
            <span className="text-xs text-[#737373]">
              {pendingApprovalsCount} awaiting verification
            </span>
          </div>

          {approvalRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E7E5E4] p-12 text-center text-xs text-[#737373]">
              No registration approval requests found.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#171717]">
                  <thead className="bg-[#FAF9F6] border-b border-[#E7E5E4] text-[#737373] uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-4">Applicant</th>
                      <th className="p-4">Requested Role</th>
                      <th className="p-4">Residence / Ward</th>
                      <th className="p-4">Registered Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E5E4]">
                    {approvalRequests.map((req) => {
                      const isPending = req.status === 'PENDING';
                      const assignedWard = wards.find((w) => w.id === req.requested_ward_id);

                      return (
                        <tr key={req.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar src={req.avatar_url} name={req.user_name} size="sm" />
                              <div>
                                <span className="font-bold block text-[#171717]">{req.user_name}</span>
                                <span className="text-[11px] text-[#737373]">{req.user_email}</span>
                                {req.phone && (
                                  <span className="text-[10px] text-neutral-500 block">Phone: {req.phone}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="font-semibold px-2 py-0.5 rounded bg-orange-50 text-[#EA580C] text-[11px] border border-orange-200">
                              {req.requested_role?.replace(/_/g, ' ') || 'Citizen'}
                            </span>
                            {req.notes && (
                              <div className="text-[10px] text-[#737373] mt-1 max-w-[200px] truncate" title={req.notes}>
                                {req.notes}
                              </div>
                            )}
                          </td>

                          <td className="p-4 text-[11px]">
                            {assignedWard ? (
                              <div className="font-medium text-[#171717]">
                                {assignedWard.ward_name} (Ward {assignedWard.ward_number})
                              </div>
                            ) : req.requested_ward_id ? (
                              <div>{req.requested_ward_id}</div>
                            ) : (
                              <span className="text-neutral-400 italic">None specified</span>
                            )}
                            {req.address_line && (
                              <div className="text-[10px] text-[#737373] truncate max-w-[180px]">
                                {req.address_line}
                              </div>
                            )}
                          </td>

                          <td className="p-4 text-[11px] text-[#737373]">
                            {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Recent'}
                          </td>

                          <td className="p-4">
                            {req.status === 'APPROVED' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803D] bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                <CheckCircle2 className="w-3 h-3 text-[#15803D]" />
                                <span>Approved</span>
                              </span>
                            ) : req.status === 'REJECTED' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                <XCircle className="w-3 h-3 text-red-600" />
                                <span>Declined</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                <span>Pending Verification</span>
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="primary"
                                  size="xs"
                                  className="bg-[#15803D] hover:bg-[#166534]"
                                  onClick={() => openApproveModal(req)}
                                >
                                  Review & Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  className="text-red-600 hover:bg-red-50 border-red-200"
                                  onClick={() => openRejectModal(req)}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#737373]">
                                Reviewed by {req.reviewed_by_name || 'Admin'}
                              </span>
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
        </div>
      )}

      {loadError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center space-y-2">
          <p className="text-xs font-semibold text-red-700">{loadError}</p>
          <Button variant="outline" size="xs" onClick={loadData}>
            Retry Loading Users
          </Button>
        </div>
      )}

      {/* TAB 2: ALL REGISTERED USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#171717] uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#F97316]" />
              <span>Registered Accounts & Role Modification</span>
            </h2>
            <span className="text-xs text-[#737373]">{users.length} total accounts</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#171717]">
                <thead className="bg-[#FAF9F6] border-b border-[#E7E5E4] text-[#737373] uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Approval Status</th>
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4">Ward / Department Scope</th>
                    <th className="p-4">Ward Residency Verification</th>
                    <th className="p-4">Modify Role</th>
                    <th className="p-4 text-right">Access Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center">
                        <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                        <div className="text-sm font-semibold text-[#171717]">No users found.</div>
                        <div className="text-xs text-[#737373] mt-0.5">There are no user accounts in the database.</div>
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                    const assignedWard = wards.find(
                      (w) => w.id === (u.verified_ward_id || u.ward_id || u.claimed_ward_id)
                    );
                    const verificationStatus =
                      u.ward_verification_status || (u.is_ward_verified ? 'VERIFIED' : 'UNREGISTERED');
                    const isSuspended = !u.is_active || u.approval_status === 'SUSPENDED';

                    return (
                      <tr key={u.id} className={`hover:bg-neutral-50 transition-colors ${isSuspended ? 'opacity-60 bg-neutral-50/70' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar src={u.avatar_url} name={u.full_name} size="sm" />
                            <div>
                              <span className="font-bold block text-[#171717]">{u.full_name}</span>
                              <span className="text-[11px] text-[#737373]">{u.email}</span>
                              {u.phone && <span className="text-[10px] text-neutral-500 block">{u.phone}</span>}
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          {u.approval_status === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#15803D] bg-green-50 px-2 py-0.5 rounded border border-green-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </span>
                          ) : u.approval_status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              <XCircle className="w-3 h-3" />
                              Declined
                            </span>
                          ) : isSuspended ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-700 bg-neutral-200 px-2 py-0.5 rounded">
                              <Lock className="w-3 h-3" />
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Clock className="w-3 h-3 animate-pulse" />
                              Pending Approval
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <Badge variant={u.role === 'ADMIN' ? 'error' : u.role === 'WARD_COUNCILLOR' ? 'primary' : 'neutral'} size="xs">
                            {u.role}
                          </Badge>
                        </td>

                        <td className="p-4 text-[11px]">
                          {u.department_name ? (
                            <div className="font-semibold text-neutral-800 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-[#F97316]" />
                              <span>{u.department_name}</span>
                            </div>
                          ) : assignedWard ? (
                            <div className="font-medium text-[#171717] flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#737373]" />
                              <span>{assignedWard.ward_name}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic">None</span>
                          )}
                        </td>

                        <td className="p-4">
                          {verificationStatus === 'VERIFIED' ? (
                            <span className="text-[10px] text-[#15803D] font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Verified
                            </span>
                          ) : verificationStatus === 'PENDING' ? (
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="primary"
                                size="xs"
                                className="bg-[#15803D] hover:bg-[#166534]"
                                isLoading={actionLoadingId === u.id}
                                onClick={() => handleVerifyWard(u.id, 'APPROVED')}
                              >
                                Approve Ward
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                className="text-red-600 hover:bg-red-50 border-red-200"
                                isLoading={actionLoadingId === u.id}
                                onClick={() => handleVerifyWard(u.id, 'REJECTED')}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-neutral-400">{verificationStatus}</span>
                          )}
                        </td>

                        <td className="p-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={isSuspended}
                            className="text-xs bg-white border border-[#E7E5E4] rounded px-2 py-1 focus:ring-1 focus:ring-[#F97316] cursor-pointer disabled:opacity-50"
                          >
                            <option value="CITIZEN">CITIZEN</option>
                            <option value="WARD_COUNCILLOR">WARD_COUNCILLOR</option>
                            <option value="DEPARTMENT_HANDLER">DEPARTMENT_HANDLER</option>
                            <option value="ACCOUNTABILITY_REVIEWER">ACCOUNTABILITY_REVIEWER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>

                        <td className="p-4 text-right">
                          <Button
                            variant="outline"
                            size="xs"
                            className={isSuspended ? 'text-green-700 border-green-200 hover:bg-green-50' : 'text-neutral-700 border-neutral-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200'}
                            isLoading={actionLoadingId === u.id}
                            onClick={() => handleToggleUserStatus(u)}
                          >
                            {isSuspended ? (
                              <span className="flex items-center gap-1"><Unlock className="w-3 h-3" /> Reactivate</span>
                            ) : (
                              <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Suspend</span>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: APPROVE REGISTRATION & ASSIGN ROLE */}
      {approvalModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E7E5E4] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#15803D]" />
                <h3 className="font-bold text-sm text-[#171717]">Approve User & Assign Authorized Role</h3>
              </div>
              <button
                type="button"
                onClick={() => setApprovalModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 text-xs space-y-1">
              <div>Applicant: <strong className="text-[#171717]">{selectedRequest.user_name}</strong></div>
              <div>Email: <span className="text-[#737373]">{selectedRequest.user_email}</span></div>
              {selectedRequest.address_line && (
                <div>Address: <span className="text-[#737373]">{selectedRequest.address_line}</span></div>
              )}
            </div>

            <form onSubmit={handleApproveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#171717] uppercase tracking-wider text-[11px] mb-1.5">
                  Authorized Role Assignment <span className="text-[#B91C1C]">*</span>
                </label>
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E7E5E4] rounded-xl font-semibold text-[#171717] focus:ring-1 focus:ring-[#F97316]"
                >
                  <option value="CITIZEN">Citizen (Report complaints, community participation)</option>
                  <option value="WARD_COUNCILLOR">Ward Councillor (Manage assigned ward issues & resolutions)</option>
                  <option value="DEPARTMENT_HANDLER">Department Staff (Manage department assignments & progress)</option>
                  <option value="ADMIN">System Administrator (Full governance & access control)</option>
                </select>
              </div>

              {/* Conditional Ward Jurisdiction */}
              {(assignRole === 'WARD_COUNCILLOR' || assignRole === 'CITIZEN') && (
                <div>
                  <label className="block font-bold text-[#171717] uppercase tracking-wider text-[11px] mb-1.5">
                    Assigned Ward Jurisdiction {assignRole === 'WARD_COUNCILLOR' && <span className="text-[#B91C1C]">*</span>}
                  </label>
                  <select
                    value={assignWardId}
                    onChange={(e) => setAssignWardId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E7E5E4] rounded-xl text-[#171717] focus:ring-1 focus:ring-[#F97316]"
                  >
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.ward_name} (Ward {w.ward_number}) &bull; {w.local_body_name || 'Corporation'}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-[#737373] mt-1 block">
                    {assignRole === 'WARD_COUNCILLOR'
                      ? 'The Councillor will only be permitted to manage complaints in this specific ward.'
                      : 'The citizen will be assigned and verified for this residential ward.'}
                  </span>
                </div>
              )}

              {/* Conditional Department Assignment */}
              {assignRole === 'DEPARTMENT_HANDLER' && (
                <div>
                  <label className="block font-bold text-[#171717] uppercase tracking-wider text-[11px] mb-1.5">
                    Assigned Municipal Department <span className="text-[#B91C1C]">*</span>
                  </label>
                  <select
                    value={assignDepartmentId}
                    onChange={(e) => setAssignDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E7E5E4] rounded-xl text-[#171717] focus:ring-1 focus:ring-[#F97316]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-[#737373] mt-1 block">
                    Staff will be restricted to tasks routed to this authorized department.
                  </span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#171717] text-[11px] mb-1">
                  Verification Notes / Official Record
                </label>
                <textarea
                  rows={2}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="e.g. Identity verified via municipal voter roll and electoral ward registry."
                  className="w-full px-3 py-2 bg-white border border-[#E7E5E4] rounded-xl text-xs focus:ring-1 focus:ring-[#F97316]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E7E5E4]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setApprovalModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#15803D] hover:bg-[#166534]"
                  isLoading={actionLoading}
                >
                  Confirm & Approve Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REJECT REGISTRATION REQUEST */}
      {rejectionModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E5E4] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-[#B91C1C]" />
                <h3 className="font-bold text-sm text-[#171717]">Decline Account Registration</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectionModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#737373]">
              Decline registration request for <strong className="text-[#171717]">{selectedRequest.user_name}</strong> ({selectedRequest.user_email}). Application access will be denied.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#171717] text-[11px] mb-1">
                  Reason for Rejection
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Address submitted does not fall within municipal Corporation boundaries."
                  className="w-full px-3 py-2 bg-white border border-[#E7E5E4] rounded-xl text-xs focus:ring-1 focus:ring-[#F97316]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E7E5E4]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#B91C1C] hover:bg-[#991B1B]"
                  isLoading={actionLoading}
                >
                  Confirm Rejection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
