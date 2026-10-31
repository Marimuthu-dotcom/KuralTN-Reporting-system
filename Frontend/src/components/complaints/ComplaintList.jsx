// Frontend/src/components/complaints/ComplaintList.jsx
import React from 'react';
import { ComplaintCard } from './ComplaintCard';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';
import { FileQuestion } from 'lucide-react';

export function ComplaintList({
  complaints = [],
  isLoading = false,
  emptyTitle = 'No complaints found',
  emptyDescription = 'Try adjusting your district, ward, or category filters.',
  onSupportChange,
}) {
  if (isLoading) {
    return <LoadingSkeleton count={4} />;
  }

  if (!complaints || complaints.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={FileQuestion}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {complaints.map((complaint) => (
        <ComplaintCard
          key={complaint.id}
          complaint={complaint}
          onSupportChange={onSupportChange}
        />
      ))}
    </div>
  );
}
