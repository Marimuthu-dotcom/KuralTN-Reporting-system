// Frontend/src/pages/councillor/DepartmentAssignmentsPage.jsx
import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../hooks/useAuth';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Briefcase, Building, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/common/Badge';

import { useLanguage } from '../../hooks/useLanguage';

export function DepartmentAssignmentsPage() {
  const { user } = useAuth();
  const { isTamil } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'pending_verification'

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await complaintService.getComplaints({ ward_id: user?.ward_id, limit: 100 });
      setComplaints(res.data || []);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const receivedComplaints = complaints.filter((c) => c.councillor_verified || c.department_received);
  const pendingComplaints = complaints.filter((c) => !c.councillor_verified && !c.department_received);

  const displayList = activeTab === 'received' ? receivedComplaints : pendingComplaints;

  // Group complaints by managing statutory department
  const grouped = {};
  displayList.forEach((c) => {
    const dept = isTamil
      ? (c.department_name_ta || c.department?.name_ta || 'நகராட்சி பொது நிர்வாகம்')
      : (c.department_name || c.department?.name || 'General Municipal Administration');
    if (!grouped[dept]) grouped[dept] = [];
    grouped[dept].push(c);
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: isTamil ? 'கவுன்சிலர் அறை' : 'Councillor', to: '/councillor' },
          { label: isTamil ? 'துறை வாரியாகப் பிரித்தல்' : 'Department Triage' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#171717]">
            {isTamil ? 'துறை வாரியான பணிப் பகிர்வு & ஒருங்கிணைப்பு' : 'Departmental Triage & Coordination'}
          </h1>
          <p className="text-xs text-[#737373] mt-1">
            {isTamil
              ? 'வார்டு புகார்களை சரிபார்த்து சம்பந்தப்பட்ட அரசுத் துறைகளுக்கு வழிநடத்துதல்'
              : 'Accountable civic middleware: Verifying citizen issues and dispatching them to executive engineering wings'}
          </p>
        </div>
      </div>

      {/* Protocol Notice Banner */}
      <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-2xl flex items-start gap-3 text-xs text-[#171717] shadow-2xs">
        <span className="text-lg shrink-0">🏛️</span>
        <div className="leading-relaxed">
          <strong className="text-[#C2410C] block">Civic Middleware Architecture & Accountability Rule:</strong>
          Citizen complaints do not directly bypass local governance. The elected Ward Councillor inspects field conditions and clicks <strong>"Proceed"</strong> before complaints are officially transmitted to department handlers (e.g. Roads, Water, SWM, TANGEDCO).
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E7E5E4] gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'received'
              ? 'border-[#F97316] text-[#F97316]'
              : 'border-transparent text-[#737373] hover:text-[#171717]'
          }`}
        >
          <span>✓ {isTamil ? 'துறையால் பெறப்பட்ட புகார்கள்' : 'Received & Actionable by Departments'}</span>
          <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-[#171717] text-[10px]">
            {receivedComplaints.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pending_verification')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'pending_verification'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-[#737373] hover:text-[#171717]'
          }`}
        >
          <span>🛡️ {isTamil ? 'கவுன்சிலர் சரிபார்ப்பில் உள்ளவை' : 'Pending Councillor Verification (Middleware Queue)'}</span>
          {pendingComplaints.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {pendingComplaints.length}
            </span>
          )}
        </button>
      </div>

      {/* Grouped Department Blocks */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-12 text-center text-xs text-[#737373]">
          {activeTab === 'received'
            ? 'No grievances are currently in the active department execution phase.'
            : '✓ All citizen complaints have been verified and proceeded to departments! None are currently waiting in the middleware queue.'}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dept, items]) => (
            <div key={dept} className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#F97316]" />
                  <h2 className="text-base font-bold text-[#171717]">{dept}</h2>
                </div>
                <Badge variant={activeTab === 'received' ? 'primary' : 'warning'}>
                  {items.length} {isTamil ? 'புகார்கள்' : 'issues'}
                </Badge>
              </div>

              <div className="divide-y divide-[#E7E5E4]">
                {items.map((c) => (
                  <div key={c.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 bg-neutral-900 text-white rounded">
                          {c.reference_id}
                        </span>
                        <span className="font-bold text-[#171717]">{c.title}</span>
                      </div>
                      <div className="text-[#737373] mt-1">
                        📍 {c.address_text} &bull; Status: <span className="font-semibold text-[#171717]">{c.status}</span>
                        {c.councillor_verified && (
                          <span className="text-[#15803D] ml-2 font-semibold">
                            &bull; Verified by Councillor
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/councillor/complaints/${c.id}`}
                        className="px-3 py-1.5 rounded-lg border border-[#E7E5E4] font-semibold text-[#171717] hover:border-[#F97316] hover:text-[#F97316] flex items-center gap-1"
                      >
                        <span>{activeTab === 'received' ? 'Manage' : 'Verify & Proceed'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
