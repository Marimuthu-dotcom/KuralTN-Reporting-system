// Frontend/src/pages/reviewer/AssignedCasesPage.jsx
import React, { useState } from 'react';
import { ConfidentialCaseCard } from '../../components/accountability/ConfidentialCaseCard';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const LOCAL_REVIEWER_CASES = [
  {
    id: 'case-rev-1',
    case_reference_id: 'ACC-2026-009',
    complaint_reference_id: 'CIV-2026-00013',
    concern_type: 'FALSE_RESOLUTION_CLAIM',
    description: 'Streetlight pole marked resolved in contractor report without functional luminaire replacement on site.',
    ward_name: 'Ward 114 - Mylapore',
    status: 'Under Review',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'case-rev-2',
    case_reference_id: 'ACC-2026-010',
    complaint_reference_id: 'CIV-2026-00012',
    concern_type: 'REPEATED_SLA_BREACH',
    description: 'Potable water pipeline rupture extended three times without engineering work order memo.',
    ward_name: 'Ward 43 - Thoothukudi',
    status: 'Finding Recorded',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'case-rev-3',
    case_reference_id: 'ACC-2026-011',
    complaint_reference_id: 'CIV-2026-00004',
    concern_type: 'ADMINISTRATIVE_NON_RESPONSIVENESS',
    description: 'Stormwater drain desilting escalated after 14 days without inspection note.',
    ward_name: 'Ward 114 - Mylapore',
    status: 'Referred to Appropriate Authority',
    created_at: new Date(Date.now() - 86400000 * 11).toISOString(),
  },
];

export function AssignedCasesPage() {
  const [cases] = useState(LOCAL_REVIEWER_CASES);
  const [isLoading] = useState(false);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Reviewer', to: '/reviewer' }, { label: 'Assigned Cases' }]} />

      <div>
        <h1 className="text-2xl font-black text-[#171717]">Assigned Case Docket</h1>
        <p className="text-xs text-[#737373] mt-1">
          Confidential inquiries assigned to you for independent compliance verification
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cases.map((c) => (
            <ConfidentialCaseCard key={c.id} report={c} isReviewer={true} />
          ))}
        </div>
      )}
    </div>
  );
}