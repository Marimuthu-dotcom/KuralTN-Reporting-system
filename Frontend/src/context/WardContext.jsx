// Frontend/src/context/WardContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { wardService } from '../services/wardService';
import { districtService } from '../services/districtService';

export const WardContext = createContext(null);

const LOCAL_DISTRICTS = [
  { id: 'dist-thoothukudi', name: 'Thoothukudi', name_ta: 'தூத்துக்குடி', total_wards: 60 },
  { id: 'dist-chennai', name: 'Chennai', name_ta: 'சென்னை', total_wards: 200 },
  { id: 'dist-madurai', name: 'Madurai', name_ta: 'மதுரை', total_wards: 100 },
  { id: 'dist-coimbatore', name: 'Coimbatore', name_ta: 'கோயம்புத்தூர்', total_wards: 100 },
];

const LOCAL_WARDS = [
  {
    id: 'ward-43-thoothukudi',
    ward_number: 43,
    ward_name: 'Millerpuram',
    local_body_id: 'lb-thoothukudi-corp',
    local_body_name: 'Thoothukudi Municipal Corporation',
    district_id: 'dist-thoothukudi',
    district_name: 'Thoothukudi',
    councillor_name: 'Councillor M. Senthil Nathan',
  },
  {
    id: 'ward-12-thoothukudi',
    ward_number: 12,
    ward_name: 'Bryant Nagar',
    local_body_id: 'lb-thoothukudi-corp',
    local_body_name: 'Thoothukudi Municipal Corporation',
    district_id: 'dist-thoothukudi',
    district_name: 'Thoothukudi',
    councillor_name: 'Councillor R. Selvam',
  },
  {
    id: 'ward-115-chennai',
    ward_number: 115,
    ward_name: 'T. Nagar',
    local_body_id: 'lb-chennai-corp',
    local_body_name: 'Greater Chennai Corporation',
    district_id: 'dist-chennai',
    district_name: 'Chennai',
    councillor_name: 'Councillor S. Karthikeyan',
  },
  {
    id: 'ward-24-madurai',
    ward_number: 24,
    ward_name: 'Anna Nagar',
    local_body_id: 'lb-madurai-corp',
    local_body_name: 'Madurai Municipal Corporation',
    district_id: 'dist-madurai',
    district_name: 'Madurai',
    councillor_name: 'Councillor K. Meenakshi',
  },
];

const LOCAL_CATEGORIES = [
  { id: 'cat-roads', name: 'Road & Pothole Damage', estimated_sla_days: 7, is_active: true },
  { id: 'cat-water', name: 'Drinking Water Supply', estimated_sla_days: 3, is_active: true },
  { id: 'cat-drainage', name: 'Drainage & Sewerage', estimated_sla_days: 5, is_active: true },
  { id: 'cat-waste', name: 'Garbage & Waste Management', estimated_sla_days: 2, is_active: true },
  { id: 'cat-lights', name: 'Streetlights & Power', estimated_sla_days: 4, is_active: true },
];

export function WardProvider({ children }) {
  const [wards, setWards] = useState(LOCAL_WARDS);
  const [districts, setDistricts] = useState(LOCAL_DISTRICTS);
  const [categories, setCategories] = useState(LOCAL_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadGeoData() {
      try {
        const [wardsData, districtsData, categoriesData] = await Promise.all([
          wardService.getAllWards(),
          districtService.getAllDistricts(),
          wardService.getCategories(),
        ]);
        if (isMounted) {
          if (wardsData?.length) setWards(wardsData);
          if (districtsData?.length) setDistricts(districtsData);
          if (categoriesData?.length) setCategories(categoriesData);
        }
      } catch {
        // Keep local sample geographic data when database is unavailable
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadGeoData();
    return () => {
      isMounted = false;
    };
  }, []);

  const getWardById = (id) => wards.find((w) => w.id === id);
  const getCategoryById = (id) => categories.find((c) => c.id === id);

  const value = {
    wards,
    districts,
    categories,
    isLoading,
    getWardById,
    getCategoryById,
  };

  return <WardContext.Provider value={value}>{children}</WardContext.Provider>;
}
