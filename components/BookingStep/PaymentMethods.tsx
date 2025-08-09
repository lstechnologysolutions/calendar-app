import React from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Trans } from "@lingui/react/macro";
import { CreditCard, AlertCircle } from "lucide-react-native";
import { BookingFormData } from "../../types/Booking";
import { Service } from "../../types/Service";

export type PaymentMethodsProps = {
  formData: BookingFormData;
  errors: Record<string, string>;
  isLoading: boolean;
  onChange: (key: keyof BookingFormData, value: string) => void;
  onPay: () => void;
  onBack: () => void;
  selectedService: Service;
  selectedDateTime: { date: string; time: string };
  formatDate: (dateString: string) => string;
};

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  formData,
  errors,
  isLoading,
  onChange,
  onPay,
  onBack,
  selectedService,
  selectedDateTime,
  formatDate,
}) => {
  // Auto-format expiry to MM/YY as user types
  const formatExpiry = (input: string) => {
    const digits = input.replace(/[^0-9]/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };
  return (
    <View className="space-y-4">
      <Text className="text-xl font-bold mb-4 text-base-content">
        <Trans>Payment Information</Trans>
      </Text>

      <View className="bg-base-200 p-4 rounded-lg mb-4 border border-base-200">
        <Text className="font-medium text-base-content">
          <Trans>Booking Summary</Trans>
        </Text>
        <Text className="text-base-content/70 mt-1">
          {selectedService.name} ({selectedService.duration})
        </Text>
        <Text className="text-base-content/70">
          {formatDate(selectedDateTime.date)} at {selectedDateTime.time}
        </Text>
        <Text className="font-bold mt-2 text-base-content">${selectedService.price?.toFixed(2)}</Text>
      </View>

      <View className="space-y-2">
        <Text className="text-sm font-medium text-base-content">
          <Trans>Card Number</Trans>
        </Text>
        <View
          className={`flex-row items-center border rounded-lg p-3 bg-base-100 ${errors.cardNumber ? "border-red-500" : "border-base-200"}`}
        >
          <CreditCard size={20} />
          <TextInput
            className="flex-1 ml-2"
            placeholder="1234 5678 9012 3456"
            keyboardType="number-pad"
            maxLength={19}
            value={formData.cardNumber}
            onChangeText={(text) => onChange("cardNumber", text)}
          />
        </View>
        {errors.cardNumber ? (
          <View className="flex-row items-center mt-1">
            <AlertCircle size={16} color="#ef4444" />
            <Text className="text-red-500 text-sm ml-1">{errors.cardNumber}</Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row space-x-4">
        <View className="flex-1 space-y-2">
          <Text className="text-sm font-medium text-base-content">
            <Trans>Expiry Date</Trans>
          </Text>
          <View className={`border rounded-lg p-3 bg-base-100 ${errors.cardExpiry ? "border-red-500" : "border-base-200"}`}>
            <TextInput
              placeholder="MM/YY"
              keyboardType="number-pad"
              maxLength={5}
              value={formData.cardExpiry}
              onChangeText={(text) => onChange("cardExpiry", formatExpiry(text))}
            />
          </View>
          {errors.cardExpiry ? (
            <View className="flex-row items-center mt-1">
              <AlertCircle size={12} color="#ef4444" />
              <Text className="text-red-500 text-xs ml-1">{errors.cardExpiry}</Text>
            </View>
          ) : null}
        </View>

        <View className="flex-1 space-y-2">
          <Text className="text-sm font-medium text-base-content">
            <Trans>CVC</Trans>
          </Text>
          <View className={`border rounded-lg p-3 bg-base-100 ${errors.cardCvc ? "border-red-500" : "border-base-200"}`}>
            <TextInput
              placeholder="123"
              keyboardType="number-pad"
              maxLength={3}
              secureTextEntry
              value={formData.cardCvc}
              onChangeText={(text) => onChange("cardCvc", text)}
            />
          </View>
          {errors.cardCvc ? (
            <View className="flex-row items-center mt-1">
              <AlertCircle size={12} color="#ef4444" />
              <Text className="text-red-500 text-xs ml-1">{errors.cardCvc}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <TouchableOpacity className="bg-primary py-3 px-4 rounded-lg mt-4" onPress={onPay} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="rgb(var(--color-primary-content))" />
        ) : (
          <Text className="text-primary-content text-center font-medium">
            <Trans>Pay</Trans> ${selectedService.price?.toFixed(2)} <Trans>& Confirm</Trans>
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="py-3 px-4 rounded-lg border border-base-200 mt-2 bg-base-200" onPress={onBack} disabled={isLoading}>
        <Text className="text-base-content text-center font-medium">
          <Trans>Back to Personal Info</Trans>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentMethods;
