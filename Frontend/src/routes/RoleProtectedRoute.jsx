import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function RoleProtectedRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.approval_status === 'PENDING_APPROVAL' || user?.role === 'PENDING') {
    return <Navigate to="/pending-approval" replace />;
  }

  // Treat ADMIN and SYSTEM_ADMIN interchangeably
  const normalize = (r) => (r === 'SYSTEM_ADMIN' ? 'ADMIN' : r);
  const normalizedUserRole = normalize(user?.role);
  const normalizedAllowedRoles = allowedRoles.map(normalize);

  if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}
