// Frontend/src/pages/citizen/WardAnnouncementsPage.jsx
import React, { useState } from 'react';
import { AnnouncementCard } from '../../components/community/AnnouncementCard';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { useAuth } from '../../hooks/useAuth';
import { EmptyState } from '../../components/common/EmptyState';
import { Megaphone } from 'lucide-react';

const LOCAL_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Overhead Water Tank Cleaning Schedule — Ward 43',
    content: 'Municipal sanitation teams will clean the Millerpuram overhead water tank this Sunday from 7:00 AM to 10:00 AM. Kindly store water in advance.',
    category: 'WATER_SUPPLY',
    author_name: 'Councillor M. Senthil Nathan',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'ann-2',
    title: 'Pre-Monsoon Stormwater Drain Desilting Drive',
    content: 'Excavation and silt clearance is scheduled across Millerpuram 1st to 4th Cross Streets over the next three days.',
    category: 'DRAINAGE',
    author_name: 'Councillor M. Senthil Nathan',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'ann-3',
    title: 'Mobile Grievance & Aadhaar Camp at Ward Office',
    content: 'Citizens can inspect pending street repair dockets and verify residential ward details at the Ward 43 office on Friday 10 AM – 4 PM.',
    category: 'GENERAL_NOTICE',
    author_name: 'Ward 43 Municipal Office',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];

export function WardAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements] = useState(LOCAL_ANNOUNCEMENTS);
  const [isLoading] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Ward Community', to: '/ward' },
          { label: 'Official Announcements' },
        ]}
      />

      <div>
        <h1 className="text-2xl font-black text-[#171717] tracking-tight">
          Official Ward Announcements
        </h1>
        <p className="text-xs text-[#737373] mt-1">
          Direct notices regarding monsoon drain de-silting, waste bins distribution, water supply maintenance, and civic camps
        </p>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          title="No active announcements"
          description="Your Ward Councillor has not published any notices this week."
          icon={Megaphone}
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      )}
    </div>
  );
}