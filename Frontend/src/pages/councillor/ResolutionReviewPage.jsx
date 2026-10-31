// Frontend/src/pages/councillor/ResolutionReviewPage.jsx
import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../hooks/useAuth';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/common/Badge';

export function ResolutionReviewPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await complaintService.getComplaints({ ward_id: user?.ward_id, limit: 100 });
        const all = res.data || [];
        setComplaints(all.filter((c) => c.status === 'Resolution Proposed' || c.status === 'Resolved'));
      } catch (err) {
        console.error('Failed to load resolution reviews:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Councillor', to: '/councillor' }, { label: 'Resolution Reviews' }]} />

      <div>
        <h1 className="text-2xl font-black text-[#171717]">Resolution Proposals & Citizen Confirmations</h1>
        <p className="text-xs text-[#737373] mt-1">
          Monitor repairs submitted for citizen test and verify disputed tickets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {complaints.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-neutral-800">{c.reference_id}</span>
              <Badge variant={c.status === 'Resolved' ? 'success' : 'warning'}>
                {c.status}
              </Badge>
            </div>

            <h3 className="text-sm font-bold text-[#171717]">{c.title}</h3>
            <p className="text-xs text-[#737373] line-clamp-2">{c.description}</p>

            <div className="pt-2 border-t border-[#E7E5E4] flex items-center justify-between text-xs">
              <span className="text-[#737373]">
                {c.verification_state?.replace(/_/g, ' ')}
              </span>
              <Link to={`/complaints/${c.id}`} className="font-semibold text-[#F97316] hover:underline flex items-center gap-1">
                <span>View Evidence</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
