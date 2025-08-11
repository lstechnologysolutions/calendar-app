import { format, parseISO, isWithinInterval, addMinutes, addHours, isBefore, isAfter } from 'date-fns';

export const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export interface TimeSlot {
  start: Date;
  end: Date;
  formattedTime: string;
  isAvailable: boolean;
}

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

export const formatLongDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

export const generateTimeSlots = (date: Date, busySlots: { start: string; end: string }[] = []): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startTime = new Date(date);
  startTime.setHours(9, 0, 0, 0); // Start at 9:00 AM
  
  const endTime = new Date(date);
  endTime.setHours(17, 0, 0, 0); // End at 5:00 PM

  let currentSlot = new Date(startTime);
  
  while (currentSlot < endTime) {
    const slotEnd = addMinutes(new Date(currentSlot), 60); // 1-hour slots
    const formattedTime = formatTime(currentSlot);

    const isAvailable = !busySlots.some(busySlot => {
      const busyStart = parseISO(busySlot.start);
      const busyEnd = parseISO(busySlot.end);
      
      return (
        isWithinInterval(currentSlot, { start: busyStart, end: busyEnd }) ||
        isWithinInterval(slotEnd, { start: busyStart, end: busyEnd }) ||
        (isBefore(currentSlot, busyStart) && isAfter(slotEnd, busyEnd))
      );
    });

    slots.push({
      start: new Date(currentSlot),
      end: slotEnd,
      formattedTime,
      isAvailable,
    });

    currentSlot = addHours(currentSlot, 1); // Move to next hour
  }

  return slots;
};

export const isSlotInPast = (date: Date, time: string): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  const slotDate = new Date(date);
  slotDate.setHours(hours, minutes, 0, 0);
  
  return slotDate < new Date();
};

export const createISODateTime = (date: Date, time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  
  return newDate.toISOString();
};
