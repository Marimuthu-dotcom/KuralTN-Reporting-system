// Frontend/src/hooks/useWard.js
import { useContext } from 'react';
import { WardContext } from '../context/WardContext';

export function useWard() {
  const context = useContext(WardContext);
  if (!context) {
    throw new Error('useWard must be used within a WardProvider');
  }
  return context;
}
