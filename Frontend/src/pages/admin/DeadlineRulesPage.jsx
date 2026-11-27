// Frontend/src/pages/admin/DeadlineRulesPage.jsx
import React, { useState } from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Clock, Shield } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

const LOCAL_DEADLINE_RULES = [
  { id: 'rule-1', severity: 'CRITICAL', description: 'Potable Water Ruptures & Exposed Live Hazards', standard_resolution_days: 2, max_permitted_extension_days: 1 },
  { id: 'rule-2', severity: 'HIGH', description: 'Road Carriageway Potholes & Stormwater Drain Collapse', standard_resolution_days: 7, max_permitted_extension_days: 3 },
  { id: 'rule-3', severity: 'MEDIUM', description: 'Streetlight Luminaires & Solid Waste Bins', standard_resolution_days: 4, max_permitted_extension_days: 2 },
  { id: 'rule-4', severity: 'LOW', description: 'Routine Park Maintenance & Signage', standard_resolution_days: 14, max_permitted_extension_days: 7 },
];

export function DeadlineRulesPage() {
  const [rules] = useState(LOCAL_DEADLINE_RULES);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'SLA Rules' }]} />

      <div>
        <h1 className="text-2xl font-black text-[#171717]">Statutory SLA Target Rules</h1>
        <p className="text-xs text-[#737373] mt-1">
          Standard Citizen Charter resolution timeframes and maximum permitted extension limits
        </p>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="xs">{rule.severity}</Badge>
                <span className="text-xs font-bold text-[#171717]">{rule.description}</span>
              </div>
              <div className="text-xs text-[#737373]">
                Standard Target: <strong>{rule.standard_resolution_days} days</strong> &bull; Max Extension: <strong>{rule.max_permitted_extension_days} days</strong>
              </div>
            </div>

            <div className="text-xs font-semibold text-[#15803D] bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
              Department written quote required
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}