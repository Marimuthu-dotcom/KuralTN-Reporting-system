// Frontend/src/pages/public/ComplaintFeedPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ComplaintList } from '../../components/complaints/ComplaintList';
import { ComplaintFilters } from '../../components/complaints/ComplaintFilters';
import { ComplaintSearch } from '../../components/complaints/ComplaintSearch';
import { Pagination } from '../../components/common/Pagination';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { useDebounce } from '../../hooks/useDebounce';
import { useLanguage } from '../../hooks/useLanguage';

const LOCAL_FEED_COMPLAINTS = [
  {
    id: 'comp-007',
    reference_id: 'CIV-2026-00007',
    title: 'Non-functional LED streetlights along Millerpuram Main Road',
    description: 'Four consecutive streetlamp poles near the bus shelter have been out for 6 nights.',
    category_id: 'cat-lights',
    category_name: 'Streetlights & Power',
    department_id: 'dept-elec',
    department_name: 'Street Lighting & Electrical Wing',
    department_name_ta: 'தெருவிளக்கு & மின்சாரப் பிரிவு',
    district_id: 'dist-thoothukudi',
    district_name: 'Thoothukudi',
    ward_id: 'ward-43-thoothukudi',
    ward_name: 'Millerpuram - Ward 43',
    address_text: 'Millerpuram Main Road, near Bus Stop',
    status: 'In Progress',
    supports_count: 42,
    comments_count: 6,
    councillor_verified: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'comp-006',
    reference_id: 'CIV-2026-00006',
    title: 'Blocked stormwater drain overflowing onto 2nd Street',
    description: 'Silt accumulation near the junction culvert is causing stagnant water accumulation.',
    category_id: 'cat-drainage',
    category_name: 'Drainage & Sewerage',
    department_id: 'dept-drain',
    department_name: 'Drainage & Sewerage Board',
    department_name_ta: 'பாதாள சாக்கடை வாரியம்',
    district_id: 'dist-thoothukudi',
    district_name: 'Thoothukudi',
    ward_id: 'ward-43-thoothukudi',
    ward_name: 'Millerpuram - Ward 43',
    address_text: 'Millerpuram 2nd Street Cross',
    status: 'Forwarded to Department',
    supports_count: 35,
    comments_count: 4,
    councillor_verified: true,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'comp-002',
    reference_id: 'CIV-2026-00002',
    title: 'Irregular drinking water pressure in Bryant Nagar North',
    description: 'Morning supply pressure has dropped significantly over the past four days.',
    category_id: 'cat-water',
    category_name: 'Drinking Water Supply',
    department_id: 'dept-water',
    department_name: 'Drinking Water Supply Wing',
    department_name_ta: 'குடிநீர் வழங்கல் பிரிவு',
    district_id: 'dist-thoothukudi',
    district_name: 'Thoothukudi',
    ward_id: 'ward-12-thoothukudi',
    ward_name: 'Bryant Nagar - Ward 12',
    address_text: 'Bryant Nagar 3rd Cross',
    status: 'Pending Councillor Verification',
    supports_count: 28,
    comments_count: 3,
    councillor_verified: false,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'comp-003',
    reference_id: 'CIV-2026-00003',
    title: 'Overflowing community waste bin near T. Nagar Market lane',
    description: 'Daily garbage collection vehicle missed two consecutive rounds in the market lane.',
    category_id: 'cat-waste',
    category_name: 'Garbage & Waste Management',
    department_id: 'dept-swm',
    department_name: 'Solid Waste Management',
    department_name_ta: 'திடக்கழிவு மேலாண்மை',
    district_id: 'dist-chennai',
    district_name: 'Chennai',
    ward_id: 'ward-115-chennai',
    ward_name: 'T. Nagar - Ward 115',
    address_text: 'Usman Road Side Lane, T. Nagar',
    status: 'Resolution Proposed',
    verification_state: 'AWAITING_CITIZEN_CONFIRMATION',
    supports_count: 19,
    comments_count: 5,
    councillor_verified: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'comp-001',
    reference_id: 'CIV-2026-00001',
    title: 'Deep pothole near Bryant Nagar School junction',
    description: 'Damaged bitumen edge near the school entrance repaired and verified by local commuters.',
    category_id: 'cat-roads',
    category_name: 'Road & Pothole Damage',
    department_id: 'dept-pw',
    department_name: 'Highways & Roads Engineering',
    department_name_ta: 'நெடுஞ்சாலை மற்றும் சாலைப் பொறியியல்',
    district_id: 'dist-thoothukudi',
    district_name: 'Thoothukudi',
    ward_id: 'ward-12-thoothukudi',
    ward_name: 'Bryant Nagar - Ward 12',
    address_text: 'Bryant Nagar 4th Main Road',
    status: 'Resolved',
    verification_state: 'CONFIRMED_RESOLVED',
    supports_count: 51,
    comments_count: 9,
    councillor_verified: true,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
];

export function ComplaintFeedPage() {
  const [searchParams] = useSearchParams();
  const { t, isTamil } = useLanguage();

  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [districtId, setDistrictId] = useState(searchParams.get('district_id') || '');
  const [wardId, setWardId] = useState(searchParams.get('ward_id') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || '');
  const [departmentId, setDepartmentId] = useState(searchParams.get('department_id') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const debouncedSearch = useDebounce(search, 350);

  const filterLocal = () => {
    const q = debouncedSearch.trim().toLowerCase();
    let list = LOCAL_FEED_COMPLAINTS.filter((c) => {
      if (districtId && c.district_id !== districtId) return false;
      if (wardId && c.ward_id !== wardId) return false;
      if (categoryId && c.category_id !== categoryId) return false;
      if (departmentId && c.department_id !== departmentId) return false;
      if (status && c.status !== status) return false;
      if (q) {
        const hay = `${c.title} ${c.description} ${c.reference_id} ${c.address_text}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sortBy === 'most_supported') {
      list = [...list].sort((a, b) => (b.supports_count || 0) - (a.supports_count || 0));
    } else if (sortBy === 'oldest') {
      list = [...list].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    return list;
  };

  const fetchComplaints = () => {
    setIsLoading(true);
    const fallback = filterLocal();
    setComplaints(fallback);
    setTotal(fallback.length);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, [debouncedSearch, districtId, wardId, categoryId, departmentId, status, sortBy, page]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    if (key === 'district_id') {
      setDistrictId(value);
      setWardId(''); // Reset ward when district changes
    } else if (key === 'ward_id') setWardId(value);
    else if (key === 'category_id') setCategoryId(value);
    else if (key === 'department_id') setDepartmentId(value);
    else if (key === 'status') setStatus(value);
    else if (key === 'sortBy') setSortBy(value);
  };

  const handleResetFilters = () => {
    setDistrictId('');
    setWardId('');
    setCategoryId('');
    setDepartmentId('');
    setStatus('');
    setSortBy('newest');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t('navPublicFeed') }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
            {isTamil ? 'பொது மக்கள் குறைப் பட்டியல்' : 'Public Civic Grievances Feed'}
          </h2>
          <p className="text-xs text-[#737373] mt-1">
            {isTamil
              ? 'தமிழ்நாடு உள்ளாட்சி அமைப்புகளில் பதிவு செய்யப்பட்ட மக்கள் குறைகள் மற்றும் தீர்வுகள்'
              : 'Browse and support verified issues logged across Tamil Nadu local bodies'}
          </p>
        </div>

        <div className="w-full sm:w-80">
          <ComplaintSearch
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder={
              isTamil
                ? 'புகார் எண், தெரு, அடையாளம் தேடுக...'
                : 'Search by keyword, street, landmark, or ref...'
            }
          />
        </div>
      </div>

      <ComplaintFilters
        filters={{
          district_id: districtId,
          ward_id: wardId,
          category_id: categoryId,
          department_id: departmentId,
          status,
          sortBy,
        }}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <ComplaintList
        complaints={complaints}
        isLoading={isLoading}
        emptyTitle={isTamil ? 'புகார்கள் எதுவும் கிடைக்கவில்லை' : 'No complaints found'}
        emptyDescription={
          isTamil
            ? 'தேர்ந்தெடுத்த மாவட்டம், வார்டு அல்லது வடிகட்டிகளை மாற்றிப் பார்க்கவும்.'
            : 'Try adjusting your district, ward, or category filters.'
        }
      />

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / 10) || 1}
        totalItems={total}
        limit={10}
        onPageChange={setPage}
      />
    </div>
  );
}