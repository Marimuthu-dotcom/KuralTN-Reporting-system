import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { Select } from '../common/Select';
import { useWard } from '../../hooks/useWard';
import { useLanguage } from '../../hooks/useLanguage';
import { departmentService } from '../../services/departmentService';

export function ComplaintFilters({
  filters = {},
  onChange,
  onReset,
  className = '',
}) {
  const { districts, wards, categories } = useWard();
  const { t, getCategoryTitle, getStatusLabel, isTamil } = useLanguage();
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    departmentService.getDepartments()
      .then((data) => setDepartments(data || []))
      .catch((err) => console.error('Failed to load departments:', err));
  }, []);

  const statusOptions = [
    { value: '', label: t('allStatuses') },
    { value: 'Submitted', label: getStatusLabel('Submitted') },
    { value: 'Acknowledged', label: getStatusLabel('Acknowledged') },
    { value: 'Under Review', label: getStatusLabel('Under Review') },
    { value: 'In Progress', label: getStatusLabel('In Progress') },
    { value: 'Resolution Proposed', label: isTamil ? 'தீர்வு முன்மொழியப்பட்டது' : 'Resolution Proposed' },
    { value: 'Resolved', label: getStatusLabel('Resolved') },
    { value: 'Closed', label: getStatusLabel('Closed') },
  ];

  const sortOptions = [
    { value: 'newest', label: t('newestFirst') },
    { value: 'oldest', label: t('oldestFirst') },
    { value: 'most_supported', label: t('mostSupported') },
  ];

  const hasActiveFilters =
    Boolean(filters.district_id) ||
    Boolean(filters.ward_id) ||
    Boolean(filters.category_id) ||
    Boolean(filters.department_id) ||
    Boolean(filters.status);

  // Filter wards by selected district if any
  const filteredWards = filters.district_id
    ? wards.filter((w) => w.district_id === filters.district_id)
    : wards;

  return (
    <div className={`bg-white rounded-2xl border border-[#E7E5E4] p-4 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E7E5E4]">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717] uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-[#F97316]" />
          <span>{isTamil ? 'வடிகட்டிகள் & வார்டு எல்லை' : 'Filters & Ward Scope'}</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-[#F97316] font-semibold hover:underline cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>{isTamil ? 'அனைத்தையும் நீக்குக' : 'Reset filters'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Select
          label={isTamil ? 'அரசுத் துறை' : 'Department'}
          value={filters.department_id || ''}
          placeholder={isTamil ? 'அனைத்து துறைகள்' : 'All Departments'}
          options={departments.map((dept) => ({
            value: dept.id,
            label: isTamil ? dept.name_ta : dept.name,
          }))}
          onChange={(e) => onChange('department_id', e.target.value)}
        />

        <Select
          label={isTamil ? 'மாவட்டம்' : 'District'}
          value={filters.district_id || ''}
          placeholder={t('allDistricts')}
          options={districts.map((d) => ({ value: d.id, label: d.name }))}
          onChange={(e) => onChange('district_id', e.target.value)}
        />

        <Select
          label={isTamil ? 'வார்டு' : 'Ward'}
          value={filters.ward_id || ''}
          placeholder={t('allWards')}
          options={filteredWards.map((w) => ({
            value: w.id,
            label: `${w.ward_name} (Ward ${w.ward_number})`,
          }))}
          onChange={(e) => onChange('ward_id', e.target.value)}
        />

        <Select
          label={isTamil ? 'பிரச்சனை வகை' : 'Category'}
          value={filters.category_id || ''}
          placeholder={t('allCategories')}
          options={categories.map((c) => ({
            value: c.id,
            label: getCategoryTitle(c.id, c.name),
          }))}
          onChange={(e) => onChange('category_id', e.target.value)}
        />

        <Select
          label={t('status')}
          value={filters.status || ''}
          placeholder={t('allStatuses')}
          options={statusOptions}
          onChange={(e) => onChange('status', e.target.value)}
        />

        <Select
          label={t('sortBy')}
          value={filters.sortBy || 'newest'}
          options={sortOptions}
          onChange={(e) => onChange('sortBy', e.target.value)}
        />
      </div>
    </div>
  );
}
