// Frontend/src/pages/auth/AccessDeniedPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';

export function AccessDeniedPage() {
  return (
    <div className="py-20 text-center max-w-md mx-auto space-y-4">
      <div className="p-4 bg-red-100 text-[#B91C1C] rounded-full w-fit mx-auto">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h1 className="text-xl font-bold text-[#171717]">Access Restricted</h1>
      <p className="text-xs text-[#737373] leading-relaxed">
        You do not have the required administrative role or jurisdiction permissions
        to view or edit this restricted civic chamber.
      </p>
      <div className="pt-2">
        <Link to="/dashboard">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
