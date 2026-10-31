// Frontend/src/pages/reviewer/AssignedCasesPage.jsx
import React, { useState, useEffect } from 'react';
import { accountabilityService } from '../../services/accountabilityService';
import { ConfidentialCaseCard } from '../../components/accountability/ConfidentialCaseCard';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function AssignedCasesPage() {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCases() {
      setIsLoading(true);
      try {
        const data = await accountabilityService.getAssignedCases();
        setCases(data || []);
      } catch (err) {
        console.error('Failed to load assigned cases:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCases();
  }, []);

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
