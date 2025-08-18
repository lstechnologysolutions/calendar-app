import { useState, useEffect, useCallback } from 'react';
import { BookingFormData } from '@/types/Booking.types';

export const usePersistentForm = (onChange: (key: keyof BookingFormData, value: string) => void) => {
  const STORAGE_KEY = 'bookingFormData';
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Update each field individually to trigger form validation
        Object.entries(parsedData).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            onChange(key as keyof BookingFormData, value);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load form data from localStorage', error);
    } finally {
      setIsInitialized(true);
    }
  }, [onChange]);

  // Save to localStorage whenever form data changes
  const handleFieldChange = useCallback((key: keyof BookingFormData, value: string) => {
    onChange(key, value);
    
    // Only save to localStorage after initial load to prevent race conditions
    if (isInitialized) {
      try {
        const currentData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const newData = { ...currentData, [key]: value };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      } catch (error) {
        console.error('Failed to save form data to localStorage', error);
      }
    }
  }, [onChange, isInitialized]);

  return { handleFieldChange };
};

export default usePersistentForm;
