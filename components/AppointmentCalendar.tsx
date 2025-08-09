import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Trans } from "@lingui/react/macro";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react-native";
import { TimeSlot, AppointmentCalendarProps } from "../types/Calendar";

const AppointmentCalendar = ({
  selectedDate = new Date(),
  onDateChange = () => {},
  onTimeSlotSelect = () => {},
  availableDates = [],
  timeSlots = generateDefaultTimeSlots(),
  minDate = new Date(),
  maxDate = new Date(new Date().setMonth(new Date().getMonth() + 3)),
}: AppointmentCalendarProps) => {
  const colorScheme = useColorScheme();
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null,
  );

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    onDateChange(date);
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    if (timeSlot.available) {
      setSelectedTimeSlot(timeSlot);
      onTimeSlotSelect(timeSlot);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View className="p-4 rounded-lg shadow-sm bg-base-100">
      <Text className="text-xl font-bold mb-4 text-center text-base-content">
        <Trans>Select Date & Time</Trans>
      </Text>

      {/* Calendar Component */}
      <View className="mb-6 bg-base-200 p-4 rounded-lg">
        <Text className="text-center text-gray-600 dark:text-gray-300 mb-2">
          <Trans>Calendar component placeholder</Trans>
        </Text>
        <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
          <Trans>Selected:</Trans> {formatDate(currentDate)}
        </Text>
      </View>

      {/* Selected Date Display */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          className="p-2"
          onPress={() => {
            const prevDay = new Date(currentDate);
            prevDay.setDate(prevDay.getDate() - 1);
            if (prevDay >= minDate) handleDateChange(prevDay);
          }}
        >
          <ChevronLeft size={24} color="text-gray-400 dark:text-gray-500" />
        </TouchableOpacity>

        <Text className="text-lg font-semibold text-center text-base-content">
          {formatDate(currentDate)}
        </Text>

        <TouchableOpacity
          className="p-2"
          onPress={() => {
            const nextDay = new Date(currentDate);
            nextDay.setDate(nextDay.getDate() + 1);
            if (nextDay <= maxDate) handleDateChange(nextDay);
          }}
        >
          <ChevronRight size={24} color="text-gray-400 dark:text-gray-500" />
        </TouchableOpacity>
      </View>

      {/* Time Slots */}
      <Text className="text-lg font-semibold mb-2 text-base-content">
        <Trans>Available Time Slots</Trans>
      </Text>
      <ScrollView className="max-h-48">
        <View className="flex-row flex-wrap justify-between">
          {timeSlots.map((slot) => (
            <TouchableOpacity
              key={slot.id}
              className={`m-1 p-3 rounded-md flex-row items-center ${slot.available ? "bg-primary dark:bg-primary/30" : "bg-gray-100 dark:bg-slate-800"} ${selectedTimeSlot?.id === slot.id ? "border-2 border-primary dark:border-primary" : ""}`}
              onPress={() => handleTimeSlotSelect(slot)}
              disabled={!slot.available}
            >
              <Clock size={16} />
              <Text
                className={`ml-2 ${slot.available ? "text-primary-content" : "text-gray-400 dark:text-gray-500"} ${selectedTimeSlot?.id === slot.id ? "font-bold" : ""}`}
              >
                {slot.time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View className="mt-4 flex-row justify-between">
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-primary dark:bg-primary/30 mr-2" />
          <Text className="text-sm text-base-content">
            <Trans>Available</Trans>
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-gray-400 mr-2" />
          <Text className="text-sm text-base-content">
            <Trans>Unavailable</Trans>
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full border-2 border-primary dark:border-primary mr-2" />
          <Text className="text-sm text-base-content">
            <Trans>Selected</Trans>
          </Text>
        </View>
      </View>
    </View>
  );
};

// Helper function to generate default time slots
function generateDefaultTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startHour = 9; // 9 AM
  const endHour = 17; // 5 PM

  for (let hour = startHour; hour <= endHour; hour++) {
    // Add :00 slot
    slots.push({
      id: `slot-${hour}-00`,
      time: `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? "AM" : "PM"}`,
      available: Math.random() > 0.3, // Randomly make some slots unavailable
    });

    // Add :30 slot
    if (hour < endHour) {
      slots.push({
        id: `slot-${hour}-30`,
        time: `${hour % 12 === 0 ? 12 : hour % 12}:30 ${hour < 12 ? "AM" : "PM"}`,
        available: Math.random() > 0.3, // Randomly make some slots unavailable
      });
    }
  }

  return slots;
}

export default AppointmentCalendar;
