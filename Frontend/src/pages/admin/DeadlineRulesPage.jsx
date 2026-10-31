// Frontend/src/pages/admin/DeadlineRulesPage.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Clock, Shield } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export function DeadlineRulesPage() {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    async function loadRules() {
      try {
        const data = await adminService.getDeadlineRules();
        setRules(data || []);
      } catch (err) {
        console.error('Failed to load deadline rules:', err);
      }
    }
    loadRules();
  }, []);

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
