// Frontend/src/pages/citizen/WardAnnouncementsPage.jsx
import React, { useState, useEffect } from 'react';
import { communityService } from '../../services/communityService';
import { AnnouncementCard } from '../../components/community/AnnouncementCard';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { useAuth } from '../../hooks/useAuth';
import { EmptyState } from '../../components/common/EmptyState';
import { Megaphone } from 'lucide-react';

export function WardAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnnouncements() {
      if (user?.ward_id) {
        setIsLoading(true);
        try {
          const data = await communityService.getAnnouncements(user.ward_id);
          setAnnouncements(data || []);
        } catch (err) {
          console.error('Failed to load announcements:', err);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadAnnouncements();
  }, [user]);

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
