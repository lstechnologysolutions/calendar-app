import React, { useState } from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { Trans } from "@lingui/react/macro";
import ServiceSelection from "../components/ServiceSelection";
import AppointmentCalendar from "../components/AppointmentCalendar";
import BookingForm from "../components/BookingForm";
import { Service } from "../types/Service";
import { SelectedDateTime, BookingSubmitPayload } from "../types/Booking";
import { TimeSlot as CalendarTimeSlot } from "../types/Calendar";


// Mock data for services
const mockServices: Service[] = [
  {
    id: "1",
    name: "Initial Consultation",
    duration: "30 min",
    price: 0,
    description: "Free introductory meeting to discuss your needs",
    type: "free",
  },
  {
    id: "2",
    name: "Standard Session",
    duration: "60 min",
    price: 75,
    description: "Regular appointment session",
    type: "paid",
  },
  {
    id: "3",
    name: "Extended Session",
    duration: "90 min",
    price: 120,
    description: "In-depth consultation for complex issues",
    type: "paid",
  },
  {
    id: "4",
    name: "Quick Follow-up",
    duration: "15 min",
    price: 0,
    description: "Brief check-in after previous appointment",
    type: "free",
  },
];

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<SelectedDateTime | null>(null);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleTimeSlotSelect = (timeSlot: CalendarTimeSlot) => {
    // Compose a {date, time} pair for the booking form using the currently selected date
    const dateStr = selectedDate.toISOString().split("T")[0];
    setSelectedTimeSlot({ date: dateStr, time: timeSlot.time });
    setCurrentStep(3);
  };

  const handleBackToService = () => {
    // Return to service selection and clear selections
    setSelectedTimeSlot(null);
    setSelectedService(null);
    setCurrentStep(1);
  };

  const handleBookingComplete = (bookingData: BookingSubmitPayload) => {
    // Handle different booking outcomes
    if (bookingData.status === "success") {
      // Booking was successful - the BookingForm will show confirmation
      console.log("Booking successful:", bookingData);
    } else if (bookingData.status === "error") {
      // Booking failed - the BookingForm will show error page
      console.log("Booking failed:", bookingData);
    }
    // Don't reset immediately - let user see the confirmation/error page
  };

  const handleBack = () => {
    // From booking form (step 3), go back to time selection (step 2)
    if (currentStep === 3) {
      setSelectedTimeSlot(null); // clear time so user can reselect
      setCurrentStep(2);
      return;
    }
    // Generic back for other steps
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: "Book Appointment",
          headerShown: true,
        }}
      />

      <ScrollView className="flex-1 bg-base-100">

        <View className="p-4">
          <Text className="text-2xl font-bold mb-6 text-center text-base-content">
            <Trans>Book Your Appointment</Trans>
          </Text>

          {/* Progress indicator */}
          <View className="flex-row justify-between mb-8">
            <View className="items-center">
              <View
                className={`w-8 h-8 rounded-full ${currentStep >= 1 ? "bg-primary" : "bg-base-300"} items-center justify-center`}
              >
                <Text className="text-primary-content font-bold">1</Text>
              </View>
              <Text className="text-base-content text-xs mt-1">
                <Trans>Select Service</Trans>
              </Text>
            </View>
            <View className="flex-1 h-1 self-center mx-1 bg-base-300">
              <View
                className={`h-full ${currentStep >= 2 ? "bg-primary" : "bg-base-300"}`}
                style={{ width: "100%" }}
              />
            </View>
            <View className="items-center">
              <View
                className={`w-8 h-8 rounded-full ${currentStep >= 2 ? "bg-primary" : "bg-base-300"} items-center justify-center`}
              >
                <Text className="text-primary-content font-bold">2</Text>
              </View>
              <Text className="text-base-content text-xs mt-1">
                <Trans>Choose Time</Trans>
              </Text>
            </View>
            <View className="flex-1 h-1 self-center mx-1 bg-base-300">
              <View
                className={`h-full ${currentStep >= 3 ? "bg-primary" : "bg-base-300"}`}
                style={{ width: "100%" }}
              />
            </View>
            <View className="items-center">
              <View
                className={`w-8 h-8 rounded-full ${currentStep >= 3 ? "bg-primary" : "bg-base-300"} items-center justify-center`}
              >
                <Text className="text-primary-content font-bold">3</Text>
              </View>
              <Text className="text-base-content text-xs mt-1">
                <Trans>Your Details</Trans>
              </Text>
            </View>
          </View>

          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <ServiceSelection
              services={mockServices}
              onSelectService={handleServiceSelect}
            />
          )}

          {/* Step 2: Appointment Calendar */}
          {currentStep === 2 && (
            <View>
              <Text className="text-base-content text-lg font-semibold mb-4">
                Selected Service: {selectedService?.name} (
                {selectedService?.duration})
              </Text>
              <View className="mb-3">
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={handleBackToService}
                  className="self-start px-3 py-2 rounded-md bg-base-200 active:bg-base-300"
                >
                  <Text className="text-base-content">
                    <Trans>Back to service selection</Trans>
                  </Text>
                </TouchableOpacity>
              </View>
              <AppointmentCalendar
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onTimeSlotSelect={handleTimeSlotSelect}
              />
            </View>
          )}

          {/* Step 3: Booking Form */}
          {currentStep === 3 && (
            <View>
              <Text className="text-base-content text-lg font-semibold mb-2">
                Selected Service: {selectedService?.name} (
                {selectedService?.duration})
              </Text>
              <Text className="text-base-content text-md mb-4">
                Selected Time: {selectedTimeSlot?.date} at{" "}
                {selectedTimeSlot?.time}
              </Text>
              <BookingForm
                selectedService={selectedService || undefined}
                selectedDateTime={selectedTimeSlot || undefined}
                onSubmit={handleBookingComplete}
                onBack={handleBack}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
