import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Trans } from "@lingui/react/macro";
import { Service } from "@/types/Service";
import { SelectedDateTime } from "@/types/Booking";

type Props = {
  selectedService: Service;
  selectedDateTime: SelectedDateTime;
  formatDate: (d: string) => string;
  isBooking?: boolean;
  onTryAgain: () => void;
  onStartOver: () => void;
  onContactSupport?: () => void;
};

const ErrorScreen: React.FC<Props> = ({
  selectedService,
  selectedDateTime,
  formatDate,
  onTryAgain,
  onStartOver,
  onContactSupport,
}) => {
  const handleSupport = () => {
    if (onContactSupport) return onContactSupport();
    // Fallback simple alert
    alert("Support contact: support@bookingapp.com or call (555) 123-4567");
  };

  return (
    <View className="items-center justify-center py-8">
      <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-6">
        <Text className="text-red-500 text-3xl font-bold">✕</Text>
      </View>
      <Text className="text-2xl font-bold text-center text-red-600 mb-2">
        <Trans>Booking Failed</Trans>
      </Text>
      <Text className="text-gray-600 text-center mb-6 px-4">
        <Trans>
          We're sorry, but there was an issue processing your booking. This
          could be due to a payment problem or a technical error.
        </Trans>
      </Text>

      <View className="bg-red-50 border border-red-200 p-4 rounded-lg w-full mb-4">
        <Text className="font-bold text-red-800 mb-3">
          <Trans>Attempted Booking</Trans>
        </Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600"><Trans>Service:</Trans></Text>
            <Text className="font-medium">{selectedService.name}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600"><Trans>Date:</Trans></Text>
            <Text className="font-medium">{formatDate(selectedDateTime.date)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600"><Trans>Time:</Trans></Text>
            <Text className="font-medium">{selectedDateTime.time}</Text>
          </View>
        </View>
      </View>

      <View className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg w-full mb-6">
        <Text className="font-medium text-yellow-800 mb-2">
          <Trans>What You Can Do:</Trans>
        </Text>
        <Text className="text-yellow-700 text-sm mb-2">• <Trans>Check your payment method and try again</Trans></Text>
        <Text className="text-yellow-700 text-sm mb-2">• <Trans>Try selecting a different time slot</Trans></Text>
        <Text className="text-yellow-700 text-sm mb-2">• <Trans>Contact our support team for assistance</Trans></Text>
        <Text className="text-yellow-700 text-sm">• <Trans>Your time slot is still available for the next 10 minutes</Trans></Text>
      </View>

      <View className="flex-row space-x-3 w-full">
        <TouchableOpacity className="flex-1 bg-blue-600 py-3 px-4 rounded-lg" onPress={onTryAgain}>
          <Text className="text-white text-center font-medium">
            <Trans>Try Again</Trans>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-gray-600 py-3 px-4 rounded-lg" onPress={onStartOver}>
          <Text className="text-white text-center font-medium">
            <Trans>Start Over</Trans>
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="mt-4 py-2 px-4" onPress={handleSupport}>
        <Text className="text-blue-600 text-center font-medium underline">
          <Trans>Contact Support</Trans>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ErrorScreen;
