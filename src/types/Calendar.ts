export interface TimeSlotProps {
  id?: string;
  time: string;
  isAvailable: boolean;
  isSelected?: boolean;
  isPast?: boolean;
  onPress?: (time: string) => void;
}


export interface AppointmentCalendarProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  onTimeSlotSelect?: (timeSlot: TimeSlotProps) => void;
  availableDates?: Date[];
  timeSlots?: TimeSlotProps[];
  minDate?: Date;
  maxDate?: Date;
}

export interface BusyTimeSlot {
  start: string;
  end: string;
}

export interface CalendarEvent {
  summary: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
}

export interface GoogleCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

export const CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar'];
export const CALENDAR_ID = process.env.EXPO_PUBLIC_CALENDAR_ID || 'primary';
export const TIME_SLOT_DURATION = 60;
export const API_BASE_URL = '/api/calendar';

export interface CalendarServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ICalendarService {
  fetchBusySlots(
    date: string, 
    calendarId?: string
  ): Promise<CalendarServiceResponse<BusyTimeSlot[]>>;
  
  createCalendarEvent(
    summary: string,
    startTime: string,
    endTime: string,
    calendarId?: string
  ): Promise<CalendarServiceResponse<{ eventId?: string; htmlLink?: string }>>;
}

export interface CalendarComponentProps {
  onTimeSlotSelect?: (timeSlot: { time: string }) => void;
}