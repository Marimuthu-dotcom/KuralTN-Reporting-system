// Frontend/src/components/complaints/ComplaintStatusBadge.jsx
import React from 'react';
import { Badge } from '../common/Badge';
import { useLanguage } from '../../hooks/useLanguage';

export function ComplaintStatusBadge({ status, verificationState, className = '' }) {
  const { getStatusLabel, isTamil } = useLanguage();

  if (status === 'Resolution Proposed') {
    return (
      <Badge variant="warning" className={className}>
        {isTamil
          ? 'தீர்வு முன்மொழியப்பட்டது (மக்கள் சரிபார்ப்பிற்கு)'
          : 'Resolution Proposed (Awaiting Citizen Confirmation)'}
      </Badge>
    );
  }

  if (status === 'Resolved') {
    return (
      <Badge variant="success" className={className}>
        {verificationState === 'CONFIRMED_RESOLVED'
          ? isTamil
            ? 'முழுமையாகத் தீர்க்கப்பட்டது (மக்கள் உறுதிசெய்தது)'
            : 'Resolved (Citizen Confirmed)'
          : isTamil
          ? 'தீர்க்கப்பட்டது'
          : 'Resolved'}
      </Badge>
    );
  }

  if (status === 'Pending Councillor Verification') {
    return (
      <Badge variant="warning" className={`border border-amber-300 font-bold bg-amber-50 text-amber-800 ${className}`}>
        🛡️ {getStatusLabel(status)}
      </Badge>
    );
  }

  if (status === 'Forwarded to Department') {
    return (
      <Badge variant="blue" className={`border border-blue-200 font-bold bg-blue-50 text-blue-800 ${className}`}>
        🏛️ {getStatusLabel(status)}
      </Badge>
    );
  }

  const badgeMap = {
    'Pending Councillor Verification': { variant: 'warning' },
    Submitted: { variant: 'neutral' },
    'Forwarded to Department': { variant: 'blue' },
    Acknowledged: { variant: 'primary' },
    'Under Review': { variant: 'blue' },
    'In Progress': { variant: 'primary' },
    Closed: { variant: 'neutral' },
    Rejected: { variant: 'danger' },
  };

  const current = badgeMap[status] || { variant: 'neutral' };

  return (
    <Badge variant={current.variant} className={className}>
      {getStatusLabel(status)}
    </Badge>
  );
}
