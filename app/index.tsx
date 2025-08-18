import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Trans } from "@lingui/react/macro";
import ServiceSelection from "../components/ServiceSelection";
import useCalendar from "hooks/useCalendar";
import AppointmentCalendar from "../components/AppointmentCalendar";
import BookingForm from "../components/BookingForm";
import { Service } from "@/types/Service.types";
import { BookingFormData } from "@/types/Booking.types";
import { SERVICES } from "@/config/services.config";

const Services: Service[] = SERVICES;

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const {
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedTime,
    createBooking,
    isBooking,
  } = useCalendar();

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleTimeSlotSelect = useCallback((timeSlot: { time: string, date?: Date, isAvailable?: boolean }) => {
    if (timeSlot.date) {
      setSelectedDate(new Date(timeSlot.date));
    }
    if (timeSlot.time) {
      setSelectedTime(timeSlot.time);
      setCurrentStep(3);
    }
  }, [setSelectedTime, setSelectedDate]);

  const handleBackToService = () => {
    setSelectedService(null);
    setSelectedTime('');
    setCurrentStep(1);
  };

  const handleBookAnother = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate(new Date());
    setSelectedTime('');
  };

  const handleReturnHome = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate(new Date());
    setSelectedTime('');
  };

  const handleBookingComplete = async (formData: BookingFormData) => {
    if (!selectedService) {
      alert("Please select a service");
      return;
    }
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }
    if (!selectedTime) {
      alert("Please select a time");
      return;
    }

    try {
      const result = await createBooking({
        ...formData,
        serviceName: selectedService.name,
      });

      if (!result || !result.success) {
        throw new Error(result?.error || 'Failed to create booking');
      }
      return { success: true };
    } catch (error) {
      console.error("Error creating booking:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return { success: false, error: errorMessage };
    }
  };

  return (
    <View className="flex-1 bg-base-100">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="w-full max-w-4xl mx-auto px-4 py-6">
          <Text className="text-2xl font-bold mb-6 text-center text-base-content">
            <Trans>Book Your Appointment</Trans>
          </Text>

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

          {currentStep === 1 && (
            <ServiceSelection
              services={Services}
              onSelectService={handleServiceSelect}
            />
          )}

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
              <AppointmentCalendar onTimeSlotSelect={handleTimeSlotSelect} />
            </View>
          )}

          {currentStep === 3 && selectedService && selectedDate && selectedTime && (
            <BookingForm
              selectedService={selectedService}
              onBack={handleBackToService}
              onSubmit={async (formData) => {
                const result = await handleBookingComplete(formData);
                if (result?.success) {
                  return { status: 'success' as const };
                } else {
                  return { status: 'error' as const, error: result?.error };
                }
              }}
              selectedDateTime={{
                date: selectedDate.toISOString(),
                time: selectedTime
              }}
              isBooking={isBooking}
              onBookAnother={handleBookAnother}
              onReturnHome={handleReturnHome}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
    width: '100%',
  },
});
