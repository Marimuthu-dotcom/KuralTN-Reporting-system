// Frontend/src/pages/councillor/EscalationManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { escalationService } from '../../services/escalationService';
import { useAuth } from '../../hooks/useAuth';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Badge } from '../../components/common/Badge';
import { AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { Link } from 'react-router-dom';

export function EscalationManagementPage() {
  const { user } = useAuth();
  const [escalations, setEscalations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await escalationService.getAllEscalations();
        setEscalations(data || []);
      } catch (err) {
        console.error('Failed to load escalations:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Councillor', to: '/councillor' }, { label: 'Ward Escalations' }]} />

      <div>
        <h1 className="text-2xl font-black text-[#171717]">Escalations Routed to Higher Authorities</h1>
        <p className="text-xs text-[#737373] mt-1">
          Ward grievances where citizens appealed to Commissioner or Collectorate due to delays
        </p>
      </div>

      <div className="space-y-4">
        {escalations.map((esc) => (
          <div key={esc.id} className="bg-white rounded-xl border border-amber-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                {esc.escalation_reference} (Re: {esc.complaint_reference_id})
              </span>
              <Badge variant="warning">{esc.status}</Badge>
            </div>

            <h3 className="text-sm font-bold text-[#171717]">
              Escalated to: {esc.target_authority}
            </h3>

            <p className="text-xs text-[#737373] whitespace-pre-wrap leading-relaxed">
              {esc.detailed_reason}
            </p>

            <div className="pt-2 border-t border-[#E7E5E4] flex items-center justify-between text-xs">
              <span className="text-[#737373]">Logged on {formatDate(esc.created_at)}</span>
              <Link to={`/complaints/${esc.complaint_id}`} className="font-semibold text-[#F97316] hover:underline flex items-center gap-1">
                <span>View Complaint</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
