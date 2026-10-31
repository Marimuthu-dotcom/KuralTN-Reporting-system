// Frontend/src/pages/citizen/AccountabilityReportPage.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AccountabilityReportForm } from '../../components/accountability/AccountabilityReportForm';
import { accountabilityService } from '../../services/accountabilityService';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';

export function AccountabilityReportPage() {
  const [searchParams] = useSearchParams();
  const complaintRef = searchParams.get('complaintRef');

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError('');
    try {
      const created = await accountabilityService.submitReport(formData);
      navigate('/accountability/my-reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'File Confidential Report' },
        ]}
      />

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-8 shadow-xs space-y-2">
        <h1 className="text-2xl font-black text-[#171717] tracking-tight">
          File Confidential Accountability Report
        </h1>
        <p className="text-xs text-[#737373] leading-relaxed">
          Report serious administrative concerns regarding repeated ignored complaints,
          unexplained delays, or false claims of resolution. This investigation is conducted
          strictly by Independent Accountability Reviewers.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-[#B91C1C] rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 sm:p-8 shadow-xs">
        <AccountabilityReportForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
