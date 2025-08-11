import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Trans } from "@lingui/react/macro";
import { formatDate } from "@/utils/dateUtils";
import ServiceSelection from "../components/ServiceSelection";
import useCalendar from "@/hooks/useCalendar";
import AppointmentCalendar from "../components/AppointmentCalendar";
import BookingForm from "../components/BookingForm";
import { Service } from "@/types/Service";
import { BookingFormData } from "@/types/Booking";

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
  const {
    selectedDate,
    selectedTime,
    setSelectedTime,
    createBooking,
    isBooking,
  } = useCalendar();

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleTimeSlotSelect = useCallback((timeSlot: { time: string }) => {
    setSelectedTime(timeSlot.time);
    setCurrentStep(3);
  }, [setSelectedTime]);

  const handleBackToService = () => {
    setSelectedService(null);
    setSelectedTime('');
    setCurrentStep(1);
  };

  const handleBookingComplete = async (formData: BookingFormData) => {
    if (!selectedService || !selectedDate || !selectedTime) {
      console.error("Missing required booking information");
      return;
    }

    try {
      const result = await createBooking();
      
      if (result.success) {
        alert("Booking submitted successfully!");
        setCurrentStep(1);
        setSelectedService(null);
        setSelectedTime('');
      } else {
        throw new Error(result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create booking. Please try again.");
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
              services={mockServices}
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

          {currentStep === 3 && (
            <BookingForm
              selectedService={selectedService}
              onSubmit={handleBookingComplete}
              onBack={() => setCurrentStep(2)}
              selectedDateTime={{
                date: selectedDate ? formatDate(selectedDate) : '',
                time: selectedTime || ''
              }}
              isBooking={isBooking}
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
