// Frontend/src/pages/councillor/WardComplaintsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { complaintService } from '../../services/complaintService';
import { ComplaintList } from '../../components/complaints/ComplaintList';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Select } from '../../components/common/Select';

const LOCAL_WARD_COMPLAINTS = [
  {
    id: 'comp-coun-1',
    reference_id: 'CIV-2026-00011',
    title: 'Collapsed Stormwater Drain Cover near Luz Corner',
    description: 'Reinforced concrete slab over storm drain has caved in near bus shelter.',
    category_name: 'Stormwater & Drainage',
    address_text: 'Luz Church Road, Mylapore, Chennai',
    status: 'Pending Councillor Verification',
    councillor_verified: false,
    support_count: 19,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'comp-coun-2',
    reference_id: 'CIV-2026-00012',
    title: 'Pipeline Leakage Flooding 2nd Cross Street',
    description: 'Potable distribution line leaking continuously for 48 hours.',
    category_name: 'Water Supply & Leakage',
    address_text: '2nd Cross Street, Ward 114',
    status: 'Forwarded to Department',
    councillor_verified: true,
    support_count: 34,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'comp-coun-3',
    reference_id: 'CIV-2026-00013',
    title: 'Non-Functional High Mast Streetlight at Junction',
    description: 'Junction tower lighting off since weekend storm.',
    category_name: 'Street Lights',
    address_text: 'Kutchery Road Junction, Ward 114',
    status: 'In Progress',
    councillor_verified: true,
    support_count: 14,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

export function WardComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWardComplaints() {
      setIsLoading(true);
      try {
        const res = await complaintService.getComplaints({
          ward_id: user?.ward_id,
          status: filterStatus || undefined,
          limit: 100,
        });
        const items = res.data || [];
        if (items.length > 0) {
          setComplaints(items);
        } else {
          setComplaints(
            filterStatus
              ? LOCAL_WARD_COMPLAINTS.filter((c) => c.status === filterStatus)
              : LOCAL_WARD_COMPLAINTS
          );
        }
      } catch {
        setComplaints(
          filterStatus
            ? LOCAL_WARD_COMPLAINTS.filter((c) => c.status === filterStatus)
            : LOCAL_WARD_COMPLAINTS
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadWardComplaints();
  }, [user, filterStatus]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Councillor', to: '/councillor' }, { label: 'Ward Complaints' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#171717]">Ward Grievances Ledger</h1>
          <p className="text-xs text-[#737373] mt-1">
            Complete registry of issues reported within {user?.ward_name}
          </p>
        </div>

        <div className="w-56">
          <Select
            placeholder="All Statuses"
            value={filterStatus}
            options={[
              { value: 'Pending Councillor Verification', label: '🛡️ Awaiting Councillor Verification' },
              { value: 'Forwarded to Department', label: '🏛️ Forwarded to Department' },
              { value: 'Acknowledged', label: 'Acknowledged' },
              { value: 'Under Review', label: 'Under Review' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Resolution Proposed', label: 'Resolution Proposed' },
              { value: 'Resolved', label: 'Resolved' },
              { value: 'Submitted', label: 'Submitted' },
            ]}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>
      </div>

      {/* Middleware Protocol Quick Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 rounded-xl border font-bold cursor-pointer transition-all ${
            filterStatus === ''
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'bg-white text-[#737373] border-[#E7E5E4] hover:bg-neutral-50'
          }`}
        >
          All ({complaints.length})
        </button>
        <button
          onClick={() => setFilterStatus('Pending Councillor Verification')}
          className={`px-3 py-1.5 rounded-xl border font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
            filterStatus === 'Pending Councillor Verification'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <span>🛡️ Needs Verification & Proceed</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white text-amber-900 text-[10px]">
            {complaints.filter((c) => !c.councillor_verified || c.status === 'Pending Councillor Verification').length}
          </span>
        </button>
        <button
          onClick={() => setFilterStatus('Forwarded to Department')}
          className={`px-3 py-1.5 rounded-xl border font-bold cursor-pointer transition-all ${
            filterStatus === 'Forwarded to Department'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
          }`}
        >
          🏛️ Forwarded to Department
        </button>
      </div>

      <ComplaintList complaints={complaints} isLoading={isLoading} />
    </div>
  );
}
