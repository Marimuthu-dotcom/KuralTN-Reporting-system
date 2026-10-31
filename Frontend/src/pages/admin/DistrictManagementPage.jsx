// Frontend/src/pages/admin/DistrictManagementPage.jsx
import React from 'react';
import { useWard } from '../../hooks/useWard';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Building, MapPin } from 'lucide-react';

export function DistrictManagementPage() {
  const { districts, wards } = useWard();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Districts & Geography' }]} />

      <div>
        <h1 className="text-2xl font-black text-[#171717]">Administrative Geography (Tamil Nadu)</h1>
        <p className="text-xs text-[#737373] mt-1">
          Districts, Urban Local Bodies, Municipal Corporations, and Ward territorial demarcations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {districts.map((d) => {
          const districtWards = wards.filter((w) => w.district_id === d.id);

          return (
            <div key={d.id} className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#F97316]">{d.code}</span>
                <span className="text-xs text-[#737373]">HQ: {d.headquarters}</span>
              </div>

              <h3 className="text-lg font-bold text-[#171717]">{d.name}</h3>

              <div className="pt-3 border-t border-[#E7E5E4] text-xs text-[#737373] space-y-1">
                <div>State: Tamil Nadu</div>
                <div>Configured Wards: <strong>{districtWards.length}</strong></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
