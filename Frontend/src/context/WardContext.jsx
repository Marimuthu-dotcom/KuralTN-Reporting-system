// Frontend/src/context/WardContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { wardService } from '../services/wardService';
import { districtService } from '../services/districtService';

export const WardContext = createContext(null);

export function WardProvider({ children }) {
  const [wards, setWards] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
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
          setWards(wardsData || []);
          setDistricts(districtsData || []);
          setCategories(categoriesData || []);
        }
      } catch (err) {
        console.error('Failed to load geographic administrative data:', err);
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
