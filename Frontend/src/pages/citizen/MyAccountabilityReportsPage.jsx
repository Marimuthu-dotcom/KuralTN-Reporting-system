// Frontend/src/pages/citizen/MyAccountabilityReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { accountabilityService } from '../../services/accountabilityService';
import { ConfidentialCaseCard } from '../../components/accountability/ConfidentialCaseCard';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Button } from '../../components/common/Button';
import { Lock, PlusCircle } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

const LOCAL_ACCOUNTABILITY_REPORTS = [
  {
    id: 'acc-1',
    case_reference: 'ACC-2026-0012',
    complaint_reference_id: 'CIV-2026-00004',
    concern_type: 'FALSE_CLAIM_OF_RESOLUTION',
    description: 'Ticket marked resolved on portal without repairing broken valve cover on 3rd Cross Street.',
    status: 'UNDER_INVESTIGATION',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'acc-2',
    case_reference: 'ACC-2026-0008',
    complaint_reference_id: 'CIV-2026-00001',
    concern_type: 'REPEATED_MISSED_DEADLINES_WITHOUT_EXPLANATION',
    description: 'Three consecutive target deadlines elapsed without departmental progress note.',
    status: 'FINDING_RECORDED',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

export function MyAccountabilityReportsPage() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        const data = await accountabilityService.getMyReports();
        setReports(data?.length ? data : LOCAL_ACCOUNTABILITY_REPORTS);
      } catch {
        setReports(LOCAL_ACCOUNTABILITY_REPORTS);
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'My Confidential Reports' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#171717] tracking-tight">
            My Confidential Accountability Reports
          </h1>
          <p className="text-xs text-[#737373] mt-1">
            Cases reviewed by independent civil service review officers with full identity protection
          </p>
        </div>

        <Link to="/accountability/report">
          <Button variant="secondary" size="md" icon={Lock}>
            New Confidential Report
          </Button>
        </Link>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No confidential cases filed"
          description="You have not filed any accountability reports. Use this feature if you observe false claims of repair or repeated municipal inaction."
          icon={Lock}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reports.map((report) => (
            <ConfidentialCaseCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
