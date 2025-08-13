import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Calendar as CalendarIcon, Scissors as ScissorsIcon, Info as InfoIcon } from "lucide-react-native";
import { Trans } from "@lingui/react/macro";
import { Service } from "@/types/Service";
import { SelectedDateTime } from "@/types/Booking";
import { PriceDisplay } from "../../src/components/ui/PriceDisplay";

type Props = {
  formData: { email: string };
  selectedService: Service;
  selectedDateTime: SelectedDateTime;
  isBooking?: boolean;
  onBookAnother: () => void;
  onReturnHome: () => void;
};

const SuccessScreen: React.FC<Props> = ({
  formData,
  selectedService,
  selectedDateTime,
  onBookAnother,
  onReturnHome,
}) => {
  return (
    <View className="items-center justify-center py-6 px-4 w-full">
      {/* Success Header */}
      <View className="items-center mb-6">
        <View className="w-24 h-24 rounded-full bg-green-50 dark:bg-green-900/30 border-4 border-green-100 dark:border-green-800/50 items-center justify-center mb-4">
          <View className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-800/40 items-center justify-center">
            <Text className="text-green-600 dark:text-green-400 text-4xl font-bold">✓</Text>
          </View>
        </View>
        <Text className="text-2xl font-bold text-center text-green-600 dark:text-green-400 mb-2">
          <Trans>Booking Confirmed!</Trans>
        </Text>
        <Text className="text-base-content/80 text-center px-4">
          <Trans>A confirmation has been sent to</Trans>{" "}
          <Text className="font-medium text-base-content">{formData.email}</Text>
        </Text>
      </View>

      {/* Appointment Card */}
      <View className="w-full bg-base-100 rounded-xl shadow-sm border border-base-300 dark:border-base-700 p-5 mb-6">
        <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-base-200 dark:border-base-700">
          <Text className="text-lg font-bold text-base-content">
            <Trans>Appointment Details</Trans>
          </Text>
          <View className="px-2 py-1 bg-green-50 dark:bg-green-900/30 rounded-full">
            <Text className="text-xs font-medium text-green-600 dark:text-green-400">
              <Trans>CONFIRMED</Trans>
            </Text>
          </View>
        </View>

        <View className="space-y-4">
          <View className="flex-row items-start">
            <View className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mr-3">
              <CalendarIcon size={20} className="text-blue-600 dark:text-blue-400" />
            </View>
            <View>
              <Text className="text-sm text-base-content/60"><Trans>Date & Time</Trans></Text>
              <Text className="font-medium text-base-content">
                {selectedDateTime.date} • {selectedDateTime.time}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg mr-3">
              <ScissorsIcon size={20} className="text-purple-600 dark:text-purple-400" />
            </View>
            <View>
              <Text className="text-sm text-base-content/60"><Trans>Service</Trans></Text>
              <Text className="font-medium text-base-content">{selectedService.name}</Text>
              <Text className="text-sm text-base-content/60">{selectedService.duration} min</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between pt-3 mt-2 border-t border-base-200 dark:border-base-700">
            <Text className="font-medium text-base-content">
              <Trans>Total</Trans>
            </Text>
            <View className="items-end">
              <PriceDisplay 
                amount={selectedService.price} 
                variant="large"
                showFree={true}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Next Steps */}
      <View className="w-full bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4 mb-6">
        <View className="flex-row items-center mb-3">
          <InfoIcon size={18} className="text-blue-600 dark:text-blue-400 mr-2" />
          <Text className="font-medium text-blue-800 dark:text-blue-300">
            <Trans>What's Next?</Trans>
          </Text>
        </View>
        <View className="space-y-2 pl-2">
          <View className="flex-row items-start">
            <View className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 mr-2" />
            <Text className="text-blue-700 dark:text-blue-300 text-sm flex-1">
              <Trans>You'll receive a calendar invite shortly</Trans>
            </Text>
          </View>
          <View className="flex-row items-start">
            <View className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 mr-2" />
            <Text className="text-blue-700 dark:text-blue-300 text-sm flex-1">
              <Trans>We'll send a reminder 24 hours before your appointment</Trans>
            </Text>
          </View>
          <View className="flex-row items-start">
            <View className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 mr-2" />
            <Text className="text-blue-700 dark:text-blue-300 text-sm flex-1">
              <Trans>Need to reschedule? Contact us at least 24 hours in advance</Trans>
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="w-full space-y-3">
        <TouchableOpacity
          className="bg-primary/70 dark:bg-primary/50 py-4 px-6 rounded-xl shadow-sm"
          onPress={onBookAnother}
        >
          <Text className="text-base-content text-center font-semibold text-base dark:text-base-content/60">
            <Trans>Book Another Appointment</Trans>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-3.5 px-6 rounded-xl border border-base-300 bg-base-100 dark:bg-base-200"
          onPress={onReturnHome}
        >

          <TouchableOpacity
            onPress={() => window.open('https://lstech.solutions' , '_blank')}
          >
            <Text className="text-base-content text-center font-medium dark:text-base-content/60">
              <Trans>Return to Home</Trans>
            </Text>
          </TouchableOpacity>

        </TouchableOpacity>


      </View>
    </View>
  );
};

export default SuccessScreen;
