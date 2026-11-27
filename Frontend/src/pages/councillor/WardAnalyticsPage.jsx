// Frontend/src/pages/councillor/WardAnalyticsPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { StatCard } from '../../components/dashboard/StatCard';
import { BarChart3, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const LOCAL_ANALYTICS_COMPLAINTS = [
  { id: 'an-1', status: 'Resolved', deadline_condition: 'ON_TRACK' },
  { id: 'an-2', status: 'Closed', deadline_condition: 'ON_TRACK' },
  { id: 'an-3', status: 'In Progress', deadline_condition: 'ON_TRACK' },
  { id: 'an-4', status: 'Under Review', deadline_condition: 'OVERDUE' },
];

export function WardAnalyticsPage() {
  const { user } = useAuth();
  const [complaints] = useState(LOCAL_ANALYTICS_COMPLAINTS);
  const [isLoading] = useState(false);

  const total = complaints.length;
  const resolved = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;
  const overdue = complaints.filter((c) => c.deadline_condition === 'OVERDUE').length;
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Councillor', to: '/councillor' }, { label: 'Ward Analytics' }]} />

      <div>
        <h1 className="text-2xl font-black text-[#171717]">Ward Performance & SLA Metrics</h1>
        <p className="text-xs text-[#737373] mt-1">
          Resolution velocity and citizen satisfaction metrics for {user?.ward_name}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Grievances" value={total} icon={BarChart3} />
        <StatCard title="Resolved Issues" value={resolved} variant="success" icon={CheckCircle2} />
        <StatCard title="Resolution Rate" value={`${resolutionRate}%`} variant="primary" />
        <StatCard title="Overdue Tickets" value={overdue} variant={overdue > 0 ? 'danger' : 'default'} icon={AlertTriangle} />
      </div>

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
          Compliance Summary
        </h3>
        <p className="text-xs text-[#737373] leading-relaxed">
          Under the Tamil Nadu Municipal Service Charter, target deadlines recorded for drinking water,
          sewerage, and road defects are audited by the Director of Municipal Administration.
          Citizen confirmation rates directly contribute to the local ward governance index.
        </p>
      </div>
    </div>
  );
}