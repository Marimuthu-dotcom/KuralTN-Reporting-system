// Frontend/src/pages/public/WardProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building, Users, Shield, MapPin, CheckCircle, Clock } from 'lucide-react';
import { wardService } from '../../services/wardService';
import { complaintService } from '../../services/complaintService';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

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
        setWard(w);
        setComplaints(c.data || []);
        setMembers(m || []);
      } catch (err) {
        console.error('Failed to load ward profile:', err);
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
