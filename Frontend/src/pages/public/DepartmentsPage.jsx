// Frontend/src/pages/public/DepartmentsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  ChevronRight,
  Shield,
  FileText,
  Activity,
} from 'lucide-react';
import { departmentService } from '../../services/departmentService';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { useLanguage } from '../../hooks/useLanguage';

export function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { t, isTamil } = useLanguage();

  const fetchDepartments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data || []);
    } catch (err) {
      console.error('Failed to load civic departments:', err);
      setError(
        isTamil
          ? 'அரசுத் துறைகள் தகவலை ஏற்றுவதில் பிழை ஏற்பட்டது.'
          : 'Failed to load civic departments directory.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.name_ta?.toLowerCase().includes(q) ||
      d.code?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.description_ta?.toLowerCase().includes(q) ||
      d.head_officer?.toLowerCase().includes(q)
    );
  });

  const totalComplaintsAll = departments.reduce((acc, d) => acc + (d.metrics?.total || 0), 0);
  const totalResolvedAll = departments.reduce((acc, d) => acc + (d.metrics?.resolved || 0), 0);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title={isTamil ? 'பிழை ஏற்பட்டது' : 'Unable to Load Departments'}
        message={error}
        onRetry={fetchDepartments}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <Breadcrumbs items={[{ label: isTamil ? 'அரசு துறைகள்' : 'Civic Departments' }]} />

      {/* Header section */}
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-[#F97316] text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-[#F97316]" />
            <span>{isTamil ? 'தமிழ்நாடு நகராட்சி நிர்வாகக் கட்டமைப்பு' : 'Statutory Civic Administration'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            {isTamil ? 'தமிழ்நாடு நகராட்சி & அரசுத் துறைகள் வழிகாட்டி' : 'Tamil Nadu Civic Departments & Authorities'}
          </h1>

          <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
            {isTamil
              ? 'சாலைகள், குடிநீர், பாதாள சாக்கடை, தெருவிளக்குகள் மற்றும் திடக்கழிவு மேலாண்மை உள்ளிட்ட மக்கள் குறைகளை நிர்வகிக்கும் அனைத்து அரசுத் துறைகளின் அதிகாரப்பூர்வ பட்டியல். ஒவ்வொரு துறைக்கும் ஒதுக்கப்பட்ட பொறுப்புகள் மற்றும் தொடர்பு எண்களை அறியலாம்.'
              : 'Official statutory wings of municipal corporations, municipalities, and boards across Tamil Nadu responsible for civic problem execution, field audits, and verified resolution.'}
          </p>

          {/* Aggregate Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
            <div className="p-3 bg-neutral-50 rounded-xl border border-[#E7E5E4]">
              <span className="block text-[11px] font-semibold text-[#737373]">
                {isTamil ? 'மொத்த துறைகள்' : 'Authorized Departments'}
              </span>
              <span className="text-lg font-black text-[#171717]">{departments.length}</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-[#E7E5E4]">
              <span className="block text-[11px] font-semibold text-[#737373]">
                {isTamil ? 'கண்காணிக்கப்படும் புகார்கள்' : 'Logged Grievances'}
              </span>
              <span className="text-lg font-black text-[#F97316]">{totalComplaintsAll}</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-[#E7E5E4] col-span-2 sm:col-span-1">
              <span className="block text-[11px] font-semibold text-[#737373]">
                {isTamil ? 'சரிபார்க்கப்பட்ட தீர்வுகள்' : 'Verified Resolutions'}
              </span>
              <span className="text-lg font-black text-[#15803D]">{totalResolvedAll}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isTamil
                ? 'துறை பெயர், குறியீடு அல்லது அதிகாரி தேடுக...'
                : 'Search department by name, code, or officer...'
            }
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#F97316] shadow-2xs"
          />
        </div>

        <span className="text-xs text-[#737373] font-medium self-end sm:self-center">
          {isTamil
            ? `${filteredDepartments.length} துறைகள் காட்டப்படுகின்றன`
            : `Showing ${filteredDepartments.length} departments`}
        </span>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDepartments.map((dept) => {
          const isSelected = dept.metrics?.total > 0;
          return (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-[#E7E5E4] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Department Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center font-bold text-lg shrink-0">
                      🏛️
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#171717] leading-snug">
                        {isTamil ? dept.name_ta : dept.name}
                      </h3>
                      <div className="text-[11px] text-[#737373] font-medium">
                        {isTamil ? dept.name : dept.name_ta}
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-neutral-100 text-[#171717] border border-neutral-200 shrink-0">
                    {dept.code}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-[#737373] leading-relaxed mb-4">
                  {isTamil ? dept.description_ta : dept.description}
                </p>

                {/* Categories Badge List */}
                {dept.categories && dept.categories.length > 0 && (
                  <div className="mb-4">
                    <span className="block text-[10px] font-bold text-[#737373] uppercase tracking-wider mb-1.5">
                      {isTamil ? 'நிர்வகிக்கும் குறை வகைகள்:' : 'Managed Grievance Categories:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.categories.map((c) => (
                        <span
                          key={c.id}
                          className="px-2 py-0.5 rounded-md bg-orange-50 text-[#C2410C] border border-orange-200/60 text-[10px] font-semibold"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Department Details table */}
                <div className="space-y-2 py-3 border-t border-b border-[#E7E5E4] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#737373] text-[11px]">
                      {isTamil ? 'நோடல் அதிகாரி:' : 'Nodal Officer:'}
                    </span>
                    <span className="font-bold text-[#171717] text-right truncate max-w-[220px]">
                      {dept.head_officer}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#737373] text-[11px]">
                      {isTamil ? 'உதவி எண் (Helpline):' : 'Helpline:'}
                    </span>
                    <a
                      href={`tel:${dept.emergency_helpline || dept.contact_phone}`}
                      className="font-bold text-[#F97316] hover:underline"
                    >
                      {dept.emergency_helpline || dept.contact_phone}
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#737373] text-[11px]">
                      {isTamil ? 'வழக்கமான காலக்கெடு:' : 'Citizen Charter SLA:'}
                    </span>
                    <span className="font-bold text-[#15803D]">
                      ~{dept.sla_standard_days} {isTamil ? 'வேலை நாட்கள்' : 'Working Days'}
                    </span>
                  </div>
                </div>

                {/* Live Activity Counters */}
                <div className="grid grid-cols-3 gap-2 my-3 text-center">
                  <div className="p-2 bg-neutral-50 rounded-lg">
                    <span className="block text-[10px] text-[#737373]">
                      {isTamil ? 'மொத்தம்' : 'Total'}
                    </span>
                    <span className="text-xs font-black text-[#171717]">
                      {dept.metrics?.total || 0}
                    </span>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <span className="block text-[10px] text-amber-800">
                      {isTamil ? 'நடப்பில்' : 'In Progress'}
                    </span>
                    <span className="text-xs font-black text-[#B45309]">
                      {dept.metrics?.inProgress || 0}
                    </span>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <span className="block text-[10px] text-green-800">
                      {isTamil ? 'தீர்வு கண்டவை' : 'Resolved'}
                    </span>
                    <span className="text-xs font-black text-[#15803D]">
                      {dept.metrics?.resolved || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button: View Complaints */}
              <div className="pt-3">
                <Link
                  to={`/complaints?department_id=${dept.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-[#F97316] text-[#F97316] hover:text-white rounded-xl font-bold text-xs transition-colors shadow-2xs group"
                >
                  <span>
                    {isTamil
                      ? `${dept.code} துறை புகார்களைப் பார்க்க`
                      : `View ${dept.code} Complaints Feed`}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
