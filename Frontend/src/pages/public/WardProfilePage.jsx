// Frontend/src/pages/public/WardProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building, Users, Shield, MapPin, CheckCircle, Clock } from 'lucide-react';
import { wardService } from '../../services/wardService';
import { complaintService } from '../../services/complaintService';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const LOCAL_WARD_FALLBACK = {
  id: 'ward-43-thoothukudi',
  ward_number: 43,
  ward_name: 'Millerpuram',
  district_name: 'Thoothukudi',
  councillor_name: 'Councillor M. Senthil Nathan',
  local_body_name: 'Thoothukudi Municipal Corporation',
  population_approx: 14800,
};

const LOCAL_WARD_COMPLAINTS = [
  {
    id: 'comp-007',
    reference_id: 'CIV-2026-00007',
    title: 'Non-functional LED streetlights along Millerpuram Main Road',
    description: 'Four consecutive streetlamp poles near the bus shelter have been out for 6 nights.',
    category_id: 'cat-lights',
    category_name: 'Streetlights & Power',
    ward_id: 'ward-43-thoothukudi',
    ward_name: 'Millerpuram - Ward 43',
    district_name: 'Thoothukudi',
    address_text: 'Millerpuram Main Road, near Bus Stop',
    status: 'In Progress',
    supports_count: 42,
    comments_count: 6,
    councillor_verified: true,
    department_name: 'Street Lighting & Electrical Wing',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'comp-006',
    reference_id: 'CIV-2026-00006',
    title: 'Blocked stormwater drain overflowing onto 2nd Street',
    description: 'Silt accumulation near the junction culvert is causing stagnant water accumulation.',
    category_id: 'cat-drainage',
    category_name: 'Drainage & Sewerage',
    ward_id: 'ward-43-thoothukudi',
    ward_name: 'Millerpuram - Ward 43',
    district_name: 'Thoothukudi',
    address_text: 'Millerpuram 2nd Street Cross',
    status: 'Forwarded to Department',
    supports_count: 35,
    comments_count: 4,
    councillor_verified: true,
    department_name: 'Drainage & Sewerage Board',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

export function WardProfilePage() {
  const { id } = useParams();
  const [ward, setWard] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [w, c, m] = await Promise.all([
          wardService.getWardById(id),
          complaintService.getComplaints({ ward_id: id, limit: 6 }),
          wardService.getWardMembers(id),
        ]);
        setWard(w || LOCAL_WARD_FALLBACK);
        setComplaints(c.data?.length ? c.data : LOCAL_WARD_COMPLAINTS);
        setMembers(m || []);
      } catch {
        setWard({ ...LOCAL_WARD_FALLBACK, id });
        setComplaints(LOCAL_WARD_COMPLAINTS);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (isLoading) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;
  if (!ward) return <div className="p-12 text-center text-sm text-[#737373]">Ward record not found.</div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Wards' }, { label: ward.ward_name }]} />

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-orange-100 text-[#F97316]">
            Ward Number {ward.ward_number}
          </span>
          <span className="text-xs text-[#737373]">{ward.district_name} District</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#171717]">
          {ward.ward_name}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E7E5E4] text-xs">
          <div>
            <span className="font-semibold text-[#171717]">Elected Councillor: </span>
            <span className="text-[#737373]">{ward.councillor_name || 'Assigned Representative'}</span>
          </div>
          <div>
            <span className="font-semibold text-[#171717]">Local Body: </span>
            <span className="text-[#737373]">{ward.local_body_name}</span>
          </div>
          <div>
            <span className="font-semibold text-[#171717]">Approx. Population: </span>
            <span className="text-[#737373]">{ward.population_approx?.toLocaleString() || '12,000'} residents</span>
          </div>
        </div>
      </div>

      {/* Ward Complaints Feed */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#171717]">Active Grievances in this Ward</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {complaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
