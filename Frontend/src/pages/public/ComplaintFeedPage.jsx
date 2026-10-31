// Frontend/src/pages/public/ComplaintFeedPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { ComplaintList } from '../../components/complaints/ComplaintList';
import { ComplaintFilters } from '../../components/complaints/ComplaintFilters';
import { ComplaintSearch } from '../../components/complaints/ComplaintSearch';
import { Pagination } from '../../components/common/Pagination';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { useDebounce } from '../../hooks/useDebounce';
import { useLanguage } from '../../hooks/useLanguage';

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

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const res = await complaintService.getComplaints({
        search: debouncedSearch,
        district_id: districtId,
        ward_id: wardId,
        category_id: categoryId,
        department_id: departmentId,
        status,
        sortBy,
        page,
        limit: 10,
      });

      setComplaints(res.data || []);
      setTotal(res.pagination?.total || (res.data || []).length);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setIsLoading(false);
    }
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
