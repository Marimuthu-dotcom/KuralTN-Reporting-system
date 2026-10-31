// Frontend/src/components/accountability/CaseHistory.jsx
import React from 'react';
import { formatDateTime } from '../../utils/dateUtils';
import { ShieldCheck, ArrowRight, User } from 'lucide-react';
import { Badge } from '../common/Badge';

export function CaseHistory({ history = [] }) {
  if (!history || history.length === 0) {
    return <p className="text-xs text-[#737373] p-4">No audit actions recorded yet.</p>;
  }

  return (
    <div className="space-y-3">
      {history.map((h) => (
        <div
          key={h.id}
          className="p-4 bg-neutral-50 rounded-xl border border-[#E7E5E4] text-xs space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#171717]">{h.action_type.replace(/_/g, ' ')}</span>
              <Badge variant="neutral" size="xs">
                {h.actor_role?.replace(/_/g, ' ')}
              </Badge>
            </div>
            <span className="text-[11px] text-[#737373]">{formatDateTime(h.created_at)}</span>
          </div>

          <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
            {h.findings_or_notes}
          </p>

          {h.referred_to_authority && (
            <div className="text-[11px] font-semibold text-[#15803D]">
              Formal Referral: {h.referred_to_authority}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
