import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format, isToday } from 'date-fns';
import { TimeSlotProps, CalendarComponentProps } from '@/types/Calendar';
import { formatDate, isSlotInPast } from '@/utils/dateUtils';
import useCalendar from '@/hooks/useCalendar';
import { Trans } from "@lingui/react/macro";

const TimeSlot: React.FC<TimeSlotProps> = ({ time, isAvailable, isSelected, isPast = false, onPress }) => {
  const handlePress = () => {
    if (isAvailable && !isPast && onPress) {
      onPress(time);
    }
  };

  return (
    <TouchableOpacity
      className={`p-3 rounded-lg border-2 transition-colors duration-200 ${isSelected 
        ? 'bg-primary border-primary' 
        : isPast 
          ? 'bg-base-200 border-base-300 opacity-70' 
          : isAvailable 
            ? 'bg-base-100 border-base-300 hover:bg-base-200' 
            : 'bg-base-200 border-base-200 opacity-50'}`}
      onPress={handlePress}
      disabled={!isAvailable || isPast}
      activeOpacity={0.7}
    >
      <Text className={`text-sm font-medium ${isSelected 
        ? 'text-primary-content' 
        : isPast 
          ? 'text-base-content/50' 
          : isAvailable 
            ? 'text-base-content' 
            : 'text-base-content/50'}`}>
        {time}
        {isPast && ' (Past)'}
      </Text>
    </TouchableOpacity>
  );
};


const getNextWorkingDay = (date: Date): Date => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  // Skip weekends (0 = Sunday, 6 = Saturday)
  while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
};

const CalendarComponent: React.FC<CalendarComponentProps> = ({ onTimeSlotSelect }) => {
  const today = new Date();
  const {
    selectedDate,
    isLoading,
    isBooking,
    timeSlots,
    setSelectedDate,
    setSelectedTime,
    fetchBusySlotsForDate,
    initializationError,
  } = useCalendar();

  useEffect(() => {
    fetchBusySlotsForDate(selectedDate);
  }, [fetchBusySlotsForDate, selectedDate]);

  const handleDateSelect = (dateString: string) => {
    console.log(`Date selected: ${dateString}`);
    const newDate = new Date(dateString);
    setSelectedDate(newDate);
    setSelectedTime('');
    fetchBusySlotsForDate(newDate);
  };

  const [tentativeSelectedTime, setTentativeSelectedTime] = React.useState<string>('');

  const handleTimeSelect = (time: string) => {
    console.log(`Time tentatively selected: ${time}`);
    setTentativeSelectedTime(time);
  };

  useEffect(() => {
    const day = selectedDate.getDay();
    if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
      fetchBusySlotsForDate(selectedDate);
    } else {
      const nextWorkingDay = getNextWorkingDay(selectedDate);
      setSelectedDate(nextWorkingDay);
    }
  }, [selectedDate, fetchBusySlotsForDate]);
  
  const markedDates = useMemo(() => {
    const marked: any = {
      [formatDate(selectedDate)]: { selected: true, selectedColor: '#4F46E5' },
    };
    
    if (!isToday(selectedDate)) {
      marked[formatDate(today)] = { marked: true, dotColor: '#4F46E5' };
    }
    
    return marked;
  }, [selectedDate, today]);

  const handleInternalTimeSlotSelect = (timeSlot: { time: string }) => {
    handleTimeSelect(timeSlot.time);
  };

  if (initializationError) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-base-100">
        <Text className="text-xl font-bold text-error mb-4 text-center">
          Calendar Service Unavailable
        </Text>
        <Text className="text-base text-base-content/90 mb-3 text-center leading-6">
          We're having trouble connecting to the calendar service. Please try again later.
        </Text>
        <Text className="text-sm text-base-content/70 mt-2 text-center">
          If the problem persists, please contact support.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <ActivityIndicator size="large" className="text-base-content" />
        <Text className="mt-4 text-base-content/80">Loading availability...</Text>
      </View>
    );
  }

  return (
    <View className="w-full space-y-6">
      <View className="mb-5 rounded-2xl bg-base-100 p-4 shadow-sm">
        <Calendar
          className="rounded-xl"
          current={formatDate(selectedDate)}
          onDayPress={(day) => {
            const selected = new Date(day.dateString);
            // If weekend is selected, move to next working day
            if (selected.getDay() === 0 || selected.getDay() === 6) {
              const nextWorkingDay = getNextWorkingDay(selected);
              setSelectedDate(nextWorkingDay);
            } else {
              handleDateSelect(day.dateString);
            }
          }}
          markedDates={markedDates}
          minDate={formatDate(today)}
          disableAllTouchEventsForDisabledDays={true}
          disableAllTouchEventsForInactiveDays={true}
          enableSwipeMonths={true}
          firstDay={1}
          renderArrow={(direction) => (
            <View className="flex-1 items-center justify-center p-2">
              <Text className="text-lg font-semibold text-base-content/80">
                {direction === 'left' ? '←' : '→'}
              </Text>
            </View>
          )}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: 'hsl(var(--bc)/0.6)',
            selectedDayBackgroundColor: 'hsl(var(--p))',
            selectedDayTextColor: 'hsl(var(--pc))',
            todayTextColor: 'hsl(var(--p))',
            dayTextColor: 'hsl(var(--bc))',
            textDisabledColor: 'hsl(var(--bc)/0.3)',
            monthTextColor: 'hsl(var(--bc)/0.6)',
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 15,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 13,
          }}
        />
      </View>

      <View className="mx-5 rounded-2xl bg-base-100 p-5 shadow-sm">
        <Text className="mb-4 text-center text-2xl font-bold text-base-content">
          <Trans>Choose a Time</Trans>
        </Text>
        <Text className="mb-4 text-lg font-semibold text-base-content">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        {isLoading ? (
          <View className="py-4">
            <ActivityIndicator size="small" color="hsl(var(--p))" />
          </View>
        ) : timeSlots.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            className="flex-grow-0 pb-2"
            contentContainerStyle={{
              paddingVertical: 4,
              paddingRight: 16,
              paddingLeft: 4,
            }}
            indicatorStyle="default"
            contentInset={{ right: 16 }}
            snapToInterval={102}
            decelerationRate="fast"
            snapToAlignment="start"
          >
            {timeSlots.map((slot) => (
              <TimeSlot
                key={slot.formattedTime}
                time={slot.formattedTime}
                isAvailable={slot.isAvailable}
                isSelected={slot.formattedTime === tentativeSelectedTime}
                isPast={isSlotInPast(selectedDate, slot.formattedTime)}
                onPress={handleTimeSelect}
              />
            ))}
          </ScrollView>
        ) : (
          <View className="items-center py-6">
            <Text className="mb-4 text-base-content/80">
              No available time slots for this date
            </Text>
            <TouchableOpacity 
              className="rounded-lg bg-primary/10 px-4 py-2"
              onPress={() => {
                // Find next available day with time slots
                const nextDay = getNextWorkingDay(selectedDate);
                setSelectedDate(nextDay);
              }}
            >
              <Text className="text-primary">Check next available date</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        className={`mx-5 mb-6 rounded-lg px-6 py-3 ${!tentativeSelectedTime || isBooking 
          ? 'bg-primary/50 cursor-not-allowed' 
          : 'bg-primary'}`}
        disabled={!tentativeSelectedTime || isBooking}
        onPress={() => {
          if (tentativeSelectedTime) {
            setSelectedTime(tentativeSelectedTime);
            if (onTimeSlotSelect) {
              onTimeSlotSelect({ time: tentativeSelectedTime });
            }
          }
        }}
      >
        {isBooking ? (
          <ActivityIndicator color="hsl(var(--pc))" />
        ) : (
          <Text className="text-center font-medium text-primary-content">
            Confirm Booking
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CalendarComponent;
