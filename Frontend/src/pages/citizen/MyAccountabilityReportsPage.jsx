// Frontend/src/pages/citizen/MyAccountabilityReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { accountabilityService } from '../../services/accountabilityService';
import { ConfidentialCaseCard } from '../../components/accountability/ConfidentialCaseCard';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Button } from '../../components/common/Button';
import { Lock, PlusCircle } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

export function MyAccountabilityReportsPage() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        const data = await accountabilityService.getMyReports();
        setReports(data || []);
      } catch (err) {
        console.error('Failed to load accountability reports:', err);
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
