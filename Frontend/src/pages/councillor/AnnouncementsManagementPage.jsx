// Frontend/src/pages/councillor/AnnouncementsManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Megaphone, Calendar } from 'lucide-react';
import { AnnouncementCard } from '../../components/community/AnnouncementCard';

const LOCAL_WARD_ANNOUNCEMENTS = [
  {
    id: 'ann-coun-1',
    title: 'Pre-Monsoon Stormwater Drain Desilting Drive',
    content: 'Engineering teams will clear catchpits along Luz Church Road and Kutchery Road between 7 AM and 1 PM.',
    priority: 'IMPORTANT',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ann-coun-2',
    title: 'Ward Grievance Camp at Community Hall',
    content: 'Residents may verify pending water and road requests directly with Assistant Engineers on Saturday morning.',
    priority: 'NORMAL',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

export function AnnouncementsManagementPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState(LOCAL_WARD_ANNOUNCEMENTS);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'NORMAL',
    expires_at: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadAnnouncements = () => {
    // No backend: keep local announcements list
    setAnnouncements(LOCAL_WARD_ANNOUNCEMENTS);
  };

  useEffect(() => {
    loadAnnouncements();
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    setIsLoading(true);
    const localNewAnnouncement = {
      id: `ann-local-${Date.now()}`,
      ...formData,
      created_at: new Date().toISOString(),
    };
    setAnnouncements((prev) => [localNewAnnouncement, ...prev]);
    setFormData({ title: '', content: '', priority: 'NORMAL', expires_at: '' });
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: 'Councillor', to: '/councillor' }, { label: 'Announcements' }]} />

      <div>
        <h1 className="text-2xl font-black text-[#171717]">Broadcast Ward Announcement</h1>
        <p className="text-xs text-[#737373] mt-1">
          Publish official notices regarding monsoon precautions, de-silting, camps, or water schedules
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
        <Input
          label="Announcement Title"
          required
          placeholder="e.g. De-silting Schedule for Ward 43"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority Level"
            value={formData.priority}
            options={[
              { value: 'NORMAL', label: 'Normal (Standard notice)' },
              { value: 'IMPORTANT', label: 'Important (Action requested)' },
              { value: 'URGENT', label: 'Urgent (Emergency/Health warning)' },
            ]}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          />

          <Input
            label="Expiration Date (Optional)"
            type="date"
            value={formData.expires_at}
            onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
          />
        </div>

        <Textarea
          label="Announcement Content"
          required
          rows={3}
          placeholder="Provide instructions, timings, vehicle movement notices..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="md" icon={Megaphone} isLoading={isLoading}>
            Publish to Ward Feed
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[#171717] uppercase tracking-wider">
          Currently Published Notices ({announcements.length})
        </h2>
        <div className="space-y-3">
          {announcements.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      </div>
    </div>
  );
}