// Frontend/src/pages/public/DistrictPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building, MapPin, ArrowRight } from 'lucide-react';
import { districtService } from '../../services/districtService';
import { wardService } from '../../services/wardService';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function DistrictPage() {
  const { id } = useParams();
  const [district, setDistrict] = useState(null);
  const [wards, setWards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const d = await districtService.getDistrictById(id);
        const allWards = await wardService.getAllWards();
        setDistrict(d);
        setWards(allWards.filter((w) => w.district_id === id));
      } catch (err) {
        console.error('Failed to load district data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (isLoading) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;
  if (!district) return <div className="p-12 text-center text-sm text-[#737373]">District record not found.</div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Districts' }, { label: district.name }]} />

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-8 shadow-xs space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-orange-100 text-[#F97316]">
          District Code: {district.code}
        </span>
        <h1 className="text-3xl font-black text-[#171717]">{district.name} District</h1>
        <p className="text-xs text-[#737373]">Headquarters: {district.headquarters}, Tamil Nadu</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#171717]">Wards in {district.name}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wards.map((w) => (
            <Link
              key={w.id}
              to={`/wards/${w.id}`}
              className="bg-white rounded-xl border border-[#E7E5E4] p-5 hover:border-[#F97316] transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-[#737373] uppercase">
                  Ward {w.ward_number}
                </span>
                <h3 className="text-sm font-bold text-[#171717] mt-1">{w.ward_name}</h3>
                <p className="text-xs text-[#737373] mt-1">{w.local_body_name}</p>
              </div>
              <div className="pt-3 border-t border-[#E7E5E4] mt-3 flex items-center justify-between text-xs font-semibold text-[#F97316]">
                <span>View Ward Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
