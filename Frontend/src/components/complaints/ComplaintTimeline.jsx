// Frontend/src/components/complaints/ComplaintTimeline.jsx
import React from 'react';
import { CheckCircle2, Clock, Shield, User, ArrowRight } from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';
import { ComplaintStatusBadge } from './ComplaintStatusBadge';

export function ComplaintTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-xs text-[#737373] p-4 text-center">
        No status transitions recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E7E5E4]">
      {history.map((item, idx) => {
        const isLatest = idx === history.length - 1;

        return (
          <div key={item.id || idx} className="relative">
            {/* Timeline bullet icon */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white ${
                isLatest
                  ? 'border-[#F97316] text-[#F97316]'
                  : 'border-[#15803D] text-[#15803D]'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isLatest ? 'bg-[#F97316]' : 'bg-[#15803D]'
                }`}
              />
            </div>

            <div className={`rounded-lg border p-4 shadow-2xs ${
              item.actor_role === 'WARD_COUNCILLOR' || item.update_source === 'WARD_COUNCILLOR'
                ? 'bg-amber-50/30 border-amber-300 ring-1 ring-amber-200'
                : 'bg-white border-[#E7E5E4]'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {item.previous_status && (
                    <>
                      <span className="text-xs font-medium text-[#737373]">
                        {item.previous_status}
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#A8A29E]" />
                    </>
                  )}
                  <ComplaintStatusBadge status={item.new_status} />
                  {(item.actor_role === 'WARD_COUNCILLOR' || item.update_source === 'WARD_COUNCILLOR') && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      🛡️ Councillor Endorsed
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-[#737373]">
                  {formatDateTime(item.created_at)}
                </span>
              </div>

              {/* Reason / update body */}
              {item.reason && (
                <p className="text-xs text-[#171717] leading-relaxed mb-2 font-medium">
                  {item.reason}
                </p>
              )}

              {/* Actor credit */}
              <div className="flex items-center gap-2 text-[11px] text-[#737373] pt-2 border-t border-neutral-100">
                <Shield className="w-3.5 h-3.5 text-[#F97316]" />
                <span className="font-semibold text-[#171717]">{item.actor_name}</span>
                <span>({item.actor_role.replace(/_/g, ' ')})</span>
                {item.update_source && (
                  <span className="ml-auto px-1.5 py-0.5 bg-neutral-100 rounded text-[10px] font-mono">
                    Source: {item.update_source}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
