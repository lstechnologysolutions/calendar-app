import React from "react";
import { View, Text, TouchableOpacity, useColorScheme, ScrollView } from "react-native";
import { Trans } from "@lingui/react/macro";
import { Service } from "@/types/Service.types";
import { useSafeAreaInsets } from "react-native-safe-area-context";


type Props = {
  selectedService: Service;
  selectedDateTime: { date: string; time: string };
  isBooking?: boolean;
  onTryAgain: () => void;
  onStartOver: () => void;
  onContactSupport?: () => void;
};

const ErrorScreen: React.FC<Props> = ({
  selectedService,
  selectedDateTime,
  onTryAgain,
  onStartOver,
  onContactSupport,
}) => {
  const handleSupport = () => {
    if (onContactSupport) return onContactSupport();
    // Fallback simple alert
    alert("Support contact: support@bookingapp.com or call (555) 123-4567");
  };

  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  // Theme colors
  const theme = {
    background: isDark ? 'bg-gray-900' : 'bg-white',
    text: isDark ? 'text-gray-100' : 'text-gray-800',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    errorCard: isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200',
    warningCard: isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200',
    errorText: isDark ? 'text-red-400' : 'text-red-600',
    warningText: isDark ? 'text-yellow-300' : 'text-yellow-800',
    buttonPrimary: isDark ? 'bg-blue-600' : 'bg-blue-600',
    buttonSecondary: isDark ? 'bg-gray-700' : 'bg-gray-600',
    link: isDark ? 'text-blue-400' : 'text-blue-600'
  };

  return (
    <ScrollView 
      className={`flex-1 ${theme.background} pt-6`}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 16,
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center'
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center">
        <View className={`w-20 h-20 rounded-full ${isDark ? 'bg-red-900/40' : 'bg-red-100'} items-center justify-center mb-6`}>
          <Text className={`${isDark ? 'text-red-400' : 'text-red-500'} text-3xl font-bold`}>✕</Text>
        </View>
        
        <Text className={`text-2xl font-bold text-center ${theme.errorText} mb-2`}>
          <Trans>Booking Failed</Trans>
        </Text>
        
        <Text className={`${theme.textSecondary} text-center mb-6 px-2`}>
          <Trans>
            We're sorry, but there was an issue processing your booking. This
            could be due to a payment problem or a technical error.
          </Trans>
        </Text>
      </View>

      <View className={`border ${theme.errorCard} p-4 rounded-lg w-full mb-4`}>
        <Text className={`font-bold ${isDark ? 'text-red-300' : 'text-red-800'} mb-3`}>
          <Trans>Attempted Booking</Trans>
        </Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className={theme.textSecondary}><Trans>Service:</Trans></Text>
            <Text className={`font-medium ${theme.text}`}>{selectedService.name}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className={theme.textSecondary}><Trans>Date:</Trans></Text>
            <Text className={`font-medium ${theme.text}`}>{selectedDateTime.date}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className={theme.textSecondary}><Trans>Time:</Trans></Text>
            <Text className={`font-medium ${theme.text}`}>{selectedDateTime.time}</Text>
          </View>
        </View>
      </View>

      <View className={`border ${theme.warningCard} p-4 rounded-lg w-full mb-6`}>
        <Text className={`font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-800'} mb-2`}>
          <Trans>What You Can Do:</Trans>
        </Text>
        <View className="space-y-1.5">
          <Text className={`${isDark ? 'text-yellow-200/90' : 'text-yellow-700'} text-sm`}>• <Trans>Check your payment method and try again</Trans></Text>
          <Text className={`${isDark ? 'text-yellow-200/90' : 'text-yellow-700'} text-sm`}>• <Trans>Try selecting a different time slot</Trans></Text>
          <Text className={`${isDark ? 'text-yellow-200/90' : 'text-yellow-700'} text-sm`}>• <Trans>Contact our support team for assistance</Trans></Text>
          <Text className={`${isDark ? 'text-yellow-200/90' : 'text-yellow-700'} text-sm`}>• <Trans>Your time slot is still available for the next 10 minutes</Trans></Text>
        </View>
      </View>

      <View className="flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full">
        <TouchableOpacity 
          className={`flex-1 ${theme.buttonPrimary} py-3 px-4 rounded-lg`} 
          onPress={onTryAgain}
        >
          <Text className="text-white text-center font-medium">
            <Trans>Try Again</Trans>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 ${theme.buttonSecondary} py-3 px-4 rounded-lg`} 
          onPress={onStartOver}
        >
          <Text className="text-white text-center font-medium">
            <Trans>Start Over</Trans>
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        className="mt-4 py-2 px-4 items-center" 
        onPress={handleSupport}
      >
        <Text className={`${theme.link} text-center font-medium`}>
          <Trans>Contact Support</Trans>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ErrorScreen;
