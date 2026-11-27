// Frontend/src/pages/public/DistrictPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building, MapPin, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const LOCAL_DISTRICT_FALLBACK = {
  id: 'dist-thoothukudi',
  code: 'TN-69',
  name: 'Thoothukudi',
  headquarters: 'Thoothukudi',
};

const LOCAL_DISTRICT_WARDS = [
  { id: 'ward-43-thoothukudi', ward_number: 43, ward_name: 'Millerpuram', local_body_name: 'Thoothukudi Municipal Corporation' },
  { id: 'ward-12-thoothukudi', ward_number: 12, ward_name: 'Bryant Nagar', local_body_name: 'Thoothukudi Municipal Corporation' },
  { id: 'ward-18-thoothukudi', ward_number: 18, ward_name: 'Polpettai', local_body_name: 'Thoothukudi Municipal Corporation' },
];

export function DistrictPage() {
  const { id } = useParams();
  const [district, setDistrict] = useState(null);
  const [wards, setWards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setDistrict({ ...LOCAL_DISTRICT_FALLBACK, id });
    setWards(LOCAL_DISTRICT_WARDS);
    setIsLoading(false);
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