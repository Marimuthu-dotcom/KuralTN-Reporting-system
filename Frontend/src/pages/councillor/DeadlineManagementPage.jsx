// Frontend/src/pages/councillor/DeadlineManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { deadlineService } from '../../services/deadlineService';
import { useAuth } from '../../hooks/useAuth';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { DeadlineIndicator } from '../../components/complaints/DeadlineIndicator';
import { Button } from '../../components/common/Button';
import { formatDate } from '../../utils/dateUtils';
import { Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DeadlineManagementPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await complaintService.getComplaints({ ward_id: user?.ward_id, limit: 100 });
        setComplaints(res.data || []);
      } catch (err) {
        console.error('Failed to load deadline data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  const overdueList = complaints.filter((c) => c.deadline_condition === 'OVERDUE');
  const onTrackList = complaints.filter((c) => c.deadline_condition === 'ON_TRACK' || c.deadline_condition === 'APPROACHING');

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Councillor', to: '/councillor' }, { label: 'Deadlines & Delays' }]} />

      <div>
        <h1 className="text-2xl font-black text-[#171717]">Ward Deadline & SLA Auditing</h1>
        <p className="text-xs text-[#737373] mt-1">
          Monitor committed completion timelines and expedite overdue departmental tasks
        </p>
      </div>

      {/* Overdue Urgent Block */}
      {overdueList.length > 0 && (
        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-red-900 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-[#B91C1C]" />
            <span>Overdue Departmental Delays ({overdueList.length})</span>
          </div>

          <div className="divide-y divide-red-200/60">
            {overdueList.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-[#171717]">{c.reference_id}: {c.title}</div>
                  <div className="text-[#737373]">{c.category_name} &bull; Target was: {formatDate(c.active_deadline?.current_target_date)}</div>
                </div>
                <Link to={`/councillor/complaints/${c.id}`}>
                  <Button variant="danger" size="sm">
                    Manage / Extend
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Deadlines */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[#171717] uppercase tracking-wider">
          All Active Target Timelines ({onTrackList.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {onTrackList.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-[#E7E5E4] p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span>{c.reference_id}</span>
                <span className="text-[#F97316] font-sans">{c.status}</span>
              </div>
              <h3 className="text-xs font-bold text-[#171717] line-clamp-1">{c.title}</h3>
              <DeadlineIndicator deadline={c.active_deadline} condition={c.deadline_condition} />
              <div className="pt-2 border-t border-[#E7E5E4] flex justify-end">
                <Link to={`/councillor/complaints/${c.id}`} className="text-xs font-semibold text-[#F97316] hover:underline flex items-center gap-1">
                  <span>Manage Deadline</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
