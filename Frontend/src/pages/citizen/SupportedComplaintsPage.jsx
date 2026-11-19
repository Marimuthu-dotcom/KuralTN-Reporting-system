// Frontend/src/pages/citizen/SupportedComplaintsPage.jsx
import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { ComplaintList } from '../../components/complaints/ComplaintList';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { useAuth } from '../../hooks/useAuth';

const LOCAL_SUPPORTED_COMPLAINTS = [
  {
    id: 'comp-007',
    reference_id: 'CIV-2026-00007',
    title: 'Non-functional LED streetlights along Millerpuram Main Road',
    description: 'Four consecutive streetlamp poles near the bus shelter have been out for 6 nights.',
    category_id: 'cat-lights',
    category_name: 'Streetlights & Power',
    ward_id: 'ward-43-thoothukudi',
    ward_name: 'Millerpuram - Ward 43',
    district_name: 'Thoothukudi',
    address_text: 'Millerpuram Main Road, near Bus Stop',
    status: 'In Progress',
    supports_count: 42,
    comments_count: 6,
    councillor_verified: true,
    department_name: 'Street Lighting & Electrical Wing',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'comp-001',
    reference_id: 'CIV-2026-00001',
    title: 'Deep pothole near Bryant Nagar School junction',
    description: 'Damaged bitumen edge near the school entrance repaired and verified by local commuters.',
    category_id: 'cat-roads',
    category_name: 'Road & Pothole Damage',
    ward_id: 'ward-12-thoothukudi',
    ward_name: 'Bryant Nagar - Ward 12',
    district_name: 'Thoothukudi',
    address_text: 'Bryant Nagar 4th Main Road',
    status: 'Resolved',
    verification_state: 'CONFIRMED_RESOLVED',
    supports_count: 51,
    comments_count: 9,
    councillor_verified: true,
    department_name: 'Highways & Roads Engineering',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
];

export function SupportedComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSupported() {
      setIsLoading(true);
      try {
        const res = await complaintService.getComplaints({ ward_id: user?.ward_id, limit: 100 });
        const all = res.data || [];
        const supported = all.filter((c) => c.supports_count > 0);
        setComplaints(supported.length ? supported : LOCAL_SUPPORTED_COMPLAINTS);
      } catch {
        setComplaints(LOCAL_SUPPORTED_COMPLAINTS);
      } finally {
        setIsLoading(false);
      }
    }
    loadSupported();
  }, [user]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Supported Complaints' }]} />

      <div>
        <h1 className="text-2xl font-black text-[#171717] tracking-tight">
          Issues You Supported in {user?.ward_name || 'Your Ward'}
        </h1>
        <p className="text-xs text-[#737373] mt-1">
          Civic issues where you added your resident endorsement to expedite departmental action
        </p>
      </div>

      <ComplaintList
        complaints={complaints}
        isLoading={isLoading}
        emptyTitle="No supported complaints"
        emptyDescription="Explore your ward feed to support priority civic problems logged by neighbours."
      />
    </div>
  );
}
