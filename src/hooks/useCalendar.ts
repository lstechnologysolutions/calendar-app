import { useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { Alert } from 'react-native';
import { ClientCalendarService } from '@/lib/services/calendarClientService';
import { BusyTimeSlot, CALENDAR_ID, TIME_SLOT_DURATION } from '@/types/Calendar';
import { generateTimeSlots, createISODateTime } from '@/utils/dateUtils';

export const useCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [busySlots, setBusySlots] = useState<BusyTimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
  const calendarService = useMemo(() => {
    const service = ClientCalendarService.getInstance();
    if (!service) {
      setInitializationError('Failed to initialize calendar service');
    }
    return service;
  }, []);

  const fetchBusySlotsForDate = useCallback(async (date: Date) => {
    if (!date) return;
    
    try {
      setIsLoading(true);
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await calendarService.fetchBusySlots(dateStr, CALENDAR_ID);
      
      if (response.success && Array.isArray(response.data)) {
        setBusySlots(response.data);
      } else {
        console.error('Invalid response format:', response);
        setBusySlots([]);
      }
    } catch (error) {
      console.error('Error fetching busy slots:', error);
      Alert.alert('Error', 'Failed to fetch available time slots. Please try again.');
      setBusySlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [calendarService]);

  const handleDateSelect = useCallback(async (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    await fetchBusySlotsForDate(date);
  }, [fetchBusySlotsForDate]);

  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
  }, []); 

  const createBooking = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!selectedTime) {
      console.warn('No time selected for booking');
      return { success: false, error: 'No time selected for booking' };
    }
    
    try {
      setIsBooking(true);
      console.log(`Starting booking process for ${selectedTime} on ${format(selectedDate, 'PPP')}`);
      
      const startTime = createISODateTime(selectedDate, selectedTime);
      const endTime = new Date(new Date(startTime).getTime() + TIME_SLOT_DURATION * 60 * 1000).toISOString();
      
      console.log('Creating calendar event with:', { startTime, endTime, calendarId: CALENDAR_ID });
      
      const result = await calendarService.createCalendarEvent(
        'Appointment',
        startTime,
        endTime,
        CALENDAR_ID
      );
      
      if (result) {
        console.log('Event created successfully, refreshing busy slots');
        await fetchBusySlotsForDate(selectedDate);
        return { success: true };
      } else {
        console.warn('Event creation returned false');
        return { success: false, error: 'Failed to create calendar event' };
      }
    } catch (error: any) {
      console.error('Error in createBooking:', error);
      
      let errorMessage = 'We were unable to book your appointment. ';
      
      if (error.message?.includes('network') || error.message?.includes('NetworkError')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.message?.includes('401') || error.message?.includes('auth')) {
        errorMessage += 'Your session has expired. Please sign in again.';
      } else if (error.message?.includes('403') || error.message?.includes('permission')) {
        errorMessage += 'You do not have permission to create this event.';
      } else if (error.message?.includes('400') || error.message?.includes('invalid')) {
        errorMessage += 'The selected time slot is no longer available.';
      } else {
        errorMessage += 'Please try again later or contact support if the problem persists.';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsBooking(false);
    }
  }, [selectedDate, selectedTime, calendarService, fetchBusySlotsForDate]);

  // Generate available time slots for the selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    return generateTimeSlots(selectedDate, busySlots);
  }, [selectedDate, busySlots]);

  return {
    // State
    selectedDate,
    selectedTime,
    busySlots,
    isLoading,
    isBooking,
    initializationError,
    timeSlots,
    
    // Actions
    setSelectedDate: handleDateSelect,
    setSelectedTime: handleTimeSelect,
    createBooking,
    fetchBusySlotsForDate,
  };
};

export default useCalendar;
