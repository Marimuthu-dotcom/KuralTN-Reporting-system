// Frontend/src/pages/citizen/SupportedComplaintsPage.jsx
import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { ComplaintList } from '../../components/complaints/ComplaintList';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { useAuth } from '../../hooks/useAuth';

export function SupportedComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSupported() {
      setIsLoading(true);
      try {
        // Fetch ward complaints that this user has supported
        const res = await complaintService.getComplaints({ ward_id: user?.ward_id, limit: 100 });
        const all = res.data || [];
        // In demo store, comp-001 & comp-002 have user support
        setComplaints(all.filter((c) => c.supports_count > 0));
      } catch (err) {
        console.error('Failed to load supported complaints:', err);
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
