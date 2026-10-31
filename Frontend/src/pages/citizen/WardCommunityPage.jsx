// Frontend/src/pages/citizen/WardCommunityPage.jsx
import React, { useState, useEffect } from 'react';
import { WardChat } from '../../components/community/WardChat';
import { MemberList } from '../../components/community/MemberList';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { useAuth } from '../../hooks/useAuth';
import { wardService } from '../../services/wardService';
import { Users, Megaphone, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WardCommunityPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [wardInfo, setWardInfo] = useState(null);

  useEffect(() => {
    async function loadWardData() {
      if (user?.ward_id) {
        try {
          const [w, m] = await Promise.all([
            wardService.getWardById(user.ward_id),
            wardService.getWardMembers(user.ward_id),
          ]);
          setWardInfo(w);
          setMembers(m || []);
        } catch (err) {
          console.error('Failed to load ward data:', err);
        }
      }
    }
    loadWardData();
  }, [user]);

  if (!user?.ward_id) {
    return (
      <div className="p-12 text-center text-sm text-[#737373]">
        Please complete your onboarding to select a residential ward.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Ward Community' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#171717] tracking-tight">
            {wardInfo?.ward_name || `Ward ${user.ward_id}`} Community
          </h1>
          <p className="text-xs text-[#737373] mt-1">
            Real-time verified resident discussions and municipal coordination
          </p>
        </div>

        <Link
          to="/ward/announcements"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#F97316] hover:underline"
        >
          <Megaphone className="w-4 h-4" />
          <span>View Ward Announcements</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Live Chat (2 cols) */}
        <div className="lg:col-span-2">
          <WardChat wardId={user.ward_id} wardName={wardInfo?.ward_name || 'Ward ' + user.ward_id} />
        </div>

        {/* Ward Info & Active Members (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#171717] uppercase tracking-wider">
              <Shield className="w-4 h-4 text-[#F97316]" />
              <span>Ward Jurisdiction</span>
            </div>
            <div>
              <span className="font-semibold text-[#171717]">Local Body: </span>
              <span className="text-[#737373]">{wardInfo?.local_body_name}</span>
            </div>
            <div>
              <span className="font-semibold text-[#171717]">Elected Councillor: </span>
              <span className="text-[#737373]">{wardInfo?.councillor_name}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171717] uppercase tracking-wider">
                <Users className="w-4 h-4 text-[#F97316]" />
                <span>Verified Members ({members.length})</span>
              </div>
            </div>
            <MemberList members={members} />
          </div>
        </div>
      </div>
    </div>
  );
}
