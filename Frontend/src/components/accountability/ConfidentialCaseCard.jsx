// Frontend/src/components/accountability/ConfidentialCaseCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Shield, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/dateUtils';

export function ConfidentialCaseCard({ report, isReviewer = false }) {
  if (!report) return null;

  const statusVariantMap = {
    Submitted: 'neutral',
    'Under Review': 'blue',
    'More Information Required': 'warning',
    'Referred to Appropriate Authority': 'primary',
    'Finding Recorded': 'success',
    Closed: 'neutral',
  };

  const targetLink = isReviewer
    ? `/reviewer/cases/${report.id}`
    : `/accountability/cases/${report.id}`;

  return (
    <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-xs hover:shadow-md transition-all space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-neutral-900 text-white flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#F97316]" />
            <span>{report.case_reference_id}</span>
          </span>
          {report.complaint_reference_id && (
            <span className="text-xs font-mono text-[#737373]">
              Re: {report.complaint_reference_id}
            </span>
          )}
        </div>

        <Badge variant={statusVariantMap[report.status] || 'neutral'}>
          {report.status}
        </Badge>
      </div>

      <div className="text-xs font-bold text-[#171717]">
        {report.concern_type?.replace(/_/g, ' ')}
      </div>

      <p className="text-xs text-[#737373] line-clamp-2 leading-relaxed">
        {report.description}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-[#E7E5E4] text-xs">
        <div className="flex items-center gap-1.5 text-[#737373]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(report.created_at)}</span>
          <span className="mx-1">&bull;</span>
          <span>{report.ward_name}</span>
        </div>

        <Link
          to={targetLink}
          className="flex items-center gap-1 font-semibold text-[#F97316] hover:underline"
        >
          <span>View Case File</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
