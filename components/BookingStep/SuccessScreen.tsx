import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Trans } from "@lingui/react/macro";
import { Service } from "../../types/Service";

type Props = {
  formData: { email: string };
  selectedService: Service;
  selectedDateTime: { date: string; time: string };
  formatDate: (d: string) => string;
  onBookAnother: () => void;
  onReturnHome: () => void;
};

const SuccessScreen: React.FC<Props> = ({
  formData,
  selectedService,
  selectedDateTime,
  formatDate,
  onBookAnother,
  onReturnHome,
}) => {
  return (
    <View className="items-center justify-center py-8 px-4 w-full">
      <View className="w-20 h-20 rounded-full bg-green-100 border border-green-200/60 items-center justify-center mb-6">
        <Text className="text-green-500 dark:text-green-400 text-3xl font-bold">✓</Text>
      </View>
      <Text className="text-2xl font-bold text-center text-green-600 dark:text-green-400 mb-2">
        <Trans>Booking Confirmed!</Trans>
      </Text>
      <Text className="text-base-content text-center mb-6 px-4">
        <Trans>
          Your appointment has been successfully booked. A confirmation email
          with all details has been sent to
        </Trans>{" "}
        {formData.email}.
      </Text>

      <View className="border bg-base-200 p-4 rounded-lg w-full mb-4">
        <Text className="font-bold text-base-content mb-3">
          <Trans>Appointment Details</Trans>
        </Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-base-content">
              <Trans>Service:</Trans>
            </Text>
            <Text className="font-medium text-base-content">{selectedService.name}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-base-content">
              <Trans>Date:</Trans>
            </Text>
            <Text className="font-medium text-base-content">{formatDate(selectedDateTime.date)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-base-content">
              <Trans>Time:</Trans>
            </Text>
            <Text className="font-medium text-base-content">{selectedDateTime.time}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-base-content">
              <Trans>Duration:</Trans>
            </Text>
            <Text className="text-base-content font-medium">{selectedService.duration}</Text>
          </View>
          {selectedService.price ? (
            <View className="flex-row justify-between border-t border-green-200 dark:border-green-800 pt-2 mt-2">
              <Text className="text-green-600 dark:text-green-400 font-medium">
                <Trans>Total Paid:</Trans>
              </Text>
              <Text className="font-bold text-green-600 dark:text-green-400">${selectedService.price.toFixed(2)}</Text>
            </View>
          ) : (
            <View className="flex-row justify-between border-t border-green-200 dark:border-green-800 pt-2 mt-2">
              <Text className="text-gray-600 dark:text-gray-300 font-medium">
                <Trans>Price:</Trans>
              </Text>
              <Text className="font-bold text-green-600 dark:text-green-400">
                <Trans>Free</Trans>
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg w-full mb-6">
        <Text className="font-medium text-blue-800 dark:text-blue-300 mb-2">
          <Trans>What's Next?</Trans>
        </Text>
        <Text className="text-blue-700 dark:text-blue-300 text-sm mb-2">• <Trans>You'll receive a calendar invite shortly</Trans></Text>
        <Text className="text-blue-700 dark:text-blue-300 text-sm mb-2">• <Trans>We'll send a reminder 24 hours before your appointment</Trans></Text>
        <Text className="text-blue-700 dark:text-blue-300 text-sm">• <Trans>Need to reschedule? Contact us at least 24 hours in advance</Trans></Text>
      </View>

      <View className="flex-row space-x-3 w-full">
        <TouchableOpacity className="flex-1 bg-blue-600 py-3 px-4 rounded-lg bg-primary" onPress={onBookAnother}>
          <Text className="text-white text-center font-medium">
            <Trans>Book Another</Trans>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-gray-600 py-3 px-4 rounded-lg" onPress={onReturnHome}>
          <Text className="text-white text-center font-medium">
            <Trans>Return Home</Trans>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SuccessScreen;
