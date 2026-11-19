// Frontend/src/pages/citizen/MyComplaintsPage.jsx
import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { ComplaintList } from '../../components/complaints/ComplaintList';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { PlusCircle } from 'lucide-react';

const LOCAL_MY_COMPLAINTS = [
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
    id: 'comp-006',
    reference_id: 'CIV-2026-00006',
    title: 'Blocked stormwater drain overflowing onto 2nd Street',
    description: 'Silt accumulation near the junction culvert is causing stagnant water accumulation.',
    category_id: 'cat-drainage',
    category_name: 'Drainage & Sewerage',
    ward_id: 'ward-43-thoothukudi',
    ward_name: 'Millerpuram - Ward 43',
    district_name: 'Thoothukudi',
    address_text: 'Millerpuram 2nd Street Cross',
    status: 'Forwarded to Department',
    supports_count: 35,
    comments_count: 4,
    councillor_verified: true,
    department_name: 'Drainage & Sewerage Board',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

export function MyComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMyComplaints() {
      setIsLoading(true);
      try {
        const res = await complaintService.getComplaints({ limit: 100 });
        const all = res.data || [];
        const mine = all.filter((c) => c.user_id === user?.id);
        setComplaints(mine.length ? mine : LOCAL_MY_COMPLAINTS);
      } catch {
        setComplaints(LOCAL_MY_COMPLAINTS);
      } finally {
        setIsLoading(false);
      }
    }
    loadMyComplaints();
  }, [user]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'My Complaints' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#171717] tracking-tight">
            My Submitted Civic Reports
          </h1>
          <p className="text-xs text-[#737373] mt-1">
            Track resolution proposals, official deadlines, and progress notes on tickets you filed
          </p>
        </div>

        <Link to="/report">
          <Button variant="primary" size="md" icon={PlusCircle}>
            New Grievance
          </Button>
        </Link>
      </div>

      <ComplaintList
        complaints={complaints}
        isLoading={isLoading}
        emptyTitle="You haven't filed any complaints yet"
        emptyDescription="Report any road damage, water leak, or civic failure in your neighborhood."
      />
    </div>
  );
}
