// Frontend/src/pages/citizen/MyComplaintsPage.jsx
import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { ComplaintList } from '../../components/complaints/ComplaintList';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { PlusCircle } from 'lucide-react';

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
        setComplaints(all.filter((c) => c.user_id === user?.id));
      } catch (err) {
        console.error('Failed to load my complaints:', err);
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
