// Frontend/src/pages/admin/AuditLogsPage.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { formatDateTime } from '../../utils/dateUtils';
import { Lock, Shield } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await adminService.getAuditLogs();
        setLogs(data || []);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Audit Logs' }]} />

      <div>
        <h1 className="text-2xl font-black text-[#171717]">Security & Administrative Audit Logs</h1>
        <p className="text-xs text-[#737373] mt-1">
          Tamper-evident trail of administrative status transitions, role grants, and SLA adjustments
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#171717]">
            <thead className="bg-[#FAF9F6] border-b border-[#E7E5E4] text-[#737373] uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Actor Role</th>
                <th className="p-4">Target Resource</th>
                <th className="p-4">Details / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50 transition-colors font-mono">
                  <td className="p-4 text-[11px] text-[#737373] whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="p-4 font-bold text-[#171717]">
                    {log.action}
                  </td>
                  <td className="p-4">
                    <Badge variant="primary" size="xs">
                      {log.actor_role}
                    </Badge>
                  </td>
                  <td className="p-4 text-[#737373]">
                    {log.resource_type}: {log.resource_id}
                  </td>
                  <td className="p-4 text-[11px] text-[#737373] max-w-xs truncate">
                    {log.metadata_json || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
