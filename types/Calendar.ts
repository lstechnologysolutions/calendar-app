export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface AppointmentCalendarProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  onTimeSlotSelect?: (timeSlot: TimeSlot) => void;
  availableDates?: Date[];
  timeSlots?: TimeSlot[];
  minDate?: Date;
  maxDate?: Date;
}
