import React from "react";
import { View, Text } from "react-native";
import { Trans } from "@lingui/react/macro";
import CalendarComponent from "../src/components/Calendar/CalendarComponent";

interface AppointmentCalendarProps {
  onTimeSlotSelect?: (timeSlot: { time: string }) => void;
}

const AppointmentCalendar = ({
  onTimeSlotSelect = () => {},
}: AppointmentCalendarProps) => {

  return (
    <View className="p-4 rounded-lg shadow-sm bg-base-100">
      <Text className="text-xl font-bold mb-4 text-center text-base-content">
        <Trans>Select Date & Time</Trans>
      </Text>

      <View className="mb-6">
        <CalendarComponent onTimeSlotSelect={onTimeSlotSelect} />
      </View>
    </View>
  );
};



export default AppointmentCalendar;
