// Frontend/src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function ProtectedRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) 
  {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) 
  {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user account is pending administrator approval or unassigned role
  if (
    (user?.approval_status === 'PENDING_APPROVAL' || user?.role === 'PENDING' || user?.approval_status === 'REJECTED') &&
    location.pathname !== '/pending-approval'
  ) 
  {
    return <Navigate to="/pending-approval" replace />;
  }

  // If user explicitly has incomplete external registration details
  if (
    user?.registration_status === 'PENDING_DETAILS' &&
    location.pathname !== '/onboarding'
  ) 
  {
    return <Navigate to="/onboarding" replace />;
  }

  // If citizen attempts to enter private ward community chat or ward management while verification is pending
  if (
    user?.role === 'CITIZEN' &&
    (!user?.is_ward_verified || user?.ward_verification_status === 'PENDING') &&
    (location.pathname === '/ward' || location.pathname === '/ward/announcements')
  ) 
  {
    return <Navigate to="/verification-pending" replace />;
  }

  return children;
}
