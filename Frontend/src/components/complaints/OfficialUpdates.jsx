// Frontend/src/components/complaints/OfficialUpdates.jsx
import React from 'react';
import { Briefcase, Building, CheckCircle2 } from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

export function OfficialUpdates({ updates = [] }) {
  if (!updates || updates.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-[#E7E5E4] p-6 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E4]">
        <Briefcase className="w-4 h-4 text-[#F97316]" />
        <h3 className="text-sm font-bold text-[#171717] uppercase tracking-wider">
          Departmental Progress Bulletins ({updates.length})
        </h3>
      </div>

      <div className="space-y-4">
        {updates.map((up) => (
          <div
            key={up.id}
            className="p-4 rounded-xl border border-orange-200/80 bg-orange-50/30 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-[#171717]">{up.update_title}</h4>
                <div className="flex items-center gap-2 text-[11px] text-[#737373] mt-0.5">
                  <Building className="w-3 h-3 text-[#F97316]" />
                  <span>{up.department_source}</span>
                  {up.reference_no && (
                    <span className="font-mono text-neutral-600">
                      Ref: {up.reference_no}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                {up.progress_percentage > 0 && (
                  <span className="text-xs font-bold text-[#15803D]">
                    {up.progress_percentage}% Done
                  </span>
                )}
                <div className="text-[10px] text-[#737373]">
                  {formatDateTime(up.created_at)}
                </div>
              </div>
            </div>

            <p className="text-xs text-[#171717] leading-relaxed whitespace-pre-wrap">
              {up.update_body}
            </p>

            <div className="text-[10px] text-[#737373] italic pt-1">
              Recorded by {up.author_name} ({up.author_role.replace(/_/g, ' ')})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
