// Frontend/src/components/dashboard/ActivityList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';
import { ComplaintStatusBadge } from '../complaints/ComplaintStatusBadge';
import { ArrowRight, FileText } from 'lucide-react';

export function ActivityList({ items = [], title = 'Recent Grievances' }) {
  if (!items || items.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl border border-[#E7E5E4] text-center text-xs text-[#737373]">
        No recent activity recorded.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
        <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
          {title}
        </h3>
        <Link
          to="/complaints"
          className="text-xs text-[#F97316] font-semibold hover:underline flex items-center gap-1"
        >
          <span>View all</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-[#E7E5E4]">
        {items.map((c) => (
          <div
            key={c.id}
            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-[11px] text-neutral-600">
                  {c.reference_id}
                </span>
                <span className="truncate font-semibold text-[#171717]">{c.title}</span>
              </div>
              <div className="text-[11px] text-[#737373] truncate">
                {c.ward_name || `Ward ${c.ward_id}`} &bull; {formatDate(c.created_at)}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <ComplaintStatusBadge status={c.status} />
              <Link
                to={`/complaints/${c.id}`}
                className="p-1 text-[#737373] hover:text-[#F97316]"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
