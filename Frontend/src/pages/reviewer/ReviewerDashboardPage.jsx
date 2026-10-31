// Frontend/src/pages/reviewer/ReviewerDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { accountabilityService } from '../../services/accountabilityService';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { StatCard } from '../../components/dashboard/StatCard';
import { ConfidentialCaseCard } from '../../components/accountability/ConfidentialCaseCard';
import { Lock, Shield, CheckCircle2, Clock } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function ReviewerDashboardPage() {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCases() {
      setIsLoading(true);
      try {
        const data = await accountabilityService.getAssignedCases();
        setCases(data || []);
      } catch (err) {
        console.error('Failed to load reviewer cases:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCases();
  }, []);

  if (isLoading) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;

  const total = cases.length;
  const underReview = cases.filter((c) => c.status === 'Under Review' || c.status === 'Submitted').length;
  const findingRecorded = cases.filter((c) => c.status === 'Finding Recorded').length;
  const referred = cases.filter((c) => c.status === 'Referred to Appropriate Authority').length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#F97316]">
          <Lock className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Independent Oversight Board
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#171717]">
          Confidential Accountability Review Chamber
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] leading-relaxed max-w-3xl">
          Authorized independent review queue for investigating alleged false claims of resolution,
          repeated missed target dates, and administrative non-responsiveness across Tamil Nadu wards.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Inquiries" value={total} icon={Lock} onClick={() => navigate('/reviewer/cases')} />
        <StatCard title="Under Review" value={underReview} variant="warning" icon={Clock} onClick={() => navigate('/reviewer/cases')} />
        <StatCard title="Findings Logged" value={findingRecorded} variant="success" icon={CheckCircle2} onClick={() => navigate('/reviewer/cases')} />
        <StatCard title="Referred to Govt" value={referred} variant="primary" icon={Shield} onClick={() => navigate('/reviewer/cases')} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#171717] uppercase tracking-wider">
            Assigned Confidential Cases ({cases.length})
          </h2>
          <Link to="/reviewer/cases" className="text-xs font-semibold text-[#F97316] hover:underline">
            View full docket
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cases.map((c) => (
            <ConfidentialCaseCard key={c.id} report={c} isReviewer={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
