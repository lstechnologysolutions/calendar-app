import React, { useMemo, useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList } from "react-native";
import { Trans } from "@lingui/react/macro";
import { User, Phone, Mail, AlertCircle, ChevronDown, Search, Loader2 } from "lucide-react-native";
import { countryCodes } from "@/config/countryCodes";
import { BookingFormData, SelectedDateTime } from "@/types/Booking";

export type PersonalInfoFormProps = {
  formData: BookingFormData;
  errors: Record<string, string>;
  onChange: (key: keyof BookingFormData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  selectedServicePrice?: number | null;
  submitError?: string | null;
  onShowValidationSummary: (show: boolean, message?: string) => void;
  selectedDateTime: SelectedDateTime;  
  isBooking: boolean;
};

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  formData,
  errors,
  onChange,
  onNext,
  onBack,
  selectedServicePrice,
  onShowValidationSummary,
  selectedDateTime,
  isBooking,
}) => {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  
  const handleNext = useCallback(async () => {
    // Clear any previous validation errors
    onShowValidationSummary(false);

    // Validate required fields
    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      onShowValidationSummary(true, 'Please fill in all required fields');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim() || !emailRegex.test(formData.email)) {
      onShowValidationSummary(true, 'Please enter a valid email address');
      return;
    }

    // Validate phone number (basic validation)
    if (!formData.phone?.trim() || formData.phone.replace(/\D/g, '').length < 7) {
      onShowValidationSummary(true, 'Please enter a valid phone number');
      return;
    }

    try {
      setIsLoading(true);
      // Call onNext which will be handled by the parent component
      onNext();
    } catch (error) {
      console.error('Error during booking:', error);
      onShowValidationSummary(true, 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  }, [formData, onNext, onShowValidationSummary]);

  const filteredCountries = useMemo(
    () =>
      countryCodes.filter(
        (country) =>
          country.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
          country.code.includes(countrySearchQuery),
      ),
    [countrySearchQuery],
  );

  return (
    <View className="space-y-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-base-content">
          <Trans>Personal Information</Trans>
        </Text>
      </View>

      <View className="space-y-2">
        <Text className="text-sm font-medium text-base-content">
          <Trans>First Name</Trans>
        </Text>
        <View
          className={`flex-row items-center border rounded-lg p-3 bg-base-100 ${errors.firstName ? "border-red-500" : "border-base-200"}`}
        >
          <User size={20} />
          <TextInput
            className="flex-1 ml-2"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChangeText={(text) => onChange("firstName", text)}
          />
        </View>
        {errors.firstName ? (
          <View className="flex-row items-center mt-1">
            <AlertCircle size={16} color="#ef4444" />
            <Text className="text-red-500 text-sm ml-1">{errors.firstName}</Text>
          </View>
        ) : null}
      </View>

      <View className="space-y-2">
        <Text className="text-sm font-medium text-base-content">
          <Trans>Last Name</Trans>
        </Text>
        <View
          className={`flex-row items-center border rounded-lg p-3 bg-base-100 ${errors.lastName ? "border-red-500" : "border-base-200"}`}
        >
          <User size={20} />
          <TextInput
            className="flex-1 ml-2"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChangeText={(text) => onChange("lastName", text)}
          />
        </View>
        {errors.lastName ? (
          <View className="flex-row items-center mt-1">
            <AlertCircle size={16} color="#ef4444" />
            <Text className="text-red-500 text-sm ml-1">{errors.lastName}</Text>
          </View>
        ) : null}
      </View>

      <View className="space-y-2">
        <Text className="text-sm font-medium text-base-content">
          <Trans>Email</Trans>
        </Text>
        <View
          className={`flex-row items-center border rounded-lg p-3 bg-base-100 ${errors.email ? "border-red-500" : "border-base-200"}`}
        >
          <Mail size={20} />
          <TextInput
            className="flex-1 ml-2"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => onChange("email", text)}
          />
        </View>
        {errors.email ? (
          <View className="flex-row items-center mt-1">
            <AlertCircle size={16} color="#ef4444" />
            <Text className="text-red-500 text-sm ml-1">{errors.email}</Text>
          </View>
        ) : null}
      </View>

      <View className="space-y-2">
        <Text className="text-sm font-medium text-base-content">
          <Trans>Phone</Trans>
        </Text>
        <View
          className={`flex-row items-center border rounded-lg bg-base-100 ${errors.phone ? "border-red-500" : "border-base-200"}`}
        >
          <TouchableOpacity
            className="flex-row items-center px-3 py-3 border-r border-base-200"
            onPress={() => setShowCountryPicker(true)}
          >
            <Text className="text-base-content mr-1">{formData.countryCode}</Text>
            <ChevronDown size={20} />
          </TouchableOpacity>
          <Phone size={20} className="ml-3" />
          <TextInput
            className="flex-1 ml-2 mr-3"
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => onChange("phone", text)}
          />
        </View>
        {errors.phone ? (
          <View className="flex-row items-center mt-1">
            <AlertCircle size={16} color="#ef4444" />
            <Text className="text-red-500 text-sm ml-1">{errors.phone}</Text>
          </View>
        ) : null}
      </View>

      <View className="space-y-2">
        <Text className="text-sm font-medium text-base-content">
          <Trans>Additional Notes (Optional)</Trans>
        </Text>
        <View className="border border-base-200 rounded-lg p-3 bg-base-100">
          <TextInput
            className="h-20"
            placeholder="Any special requests or information"
            multiline
            textAlignVertical="top"
            value={formData.notes}
            onChangeText={(text) => onChange("notes", text)}
          />
        </View>
      </View>

      <View className="space-y-2">
        <View className="bg-base-200 dark:bg-base-300 p-3 rounded-lg border border-base-300 dark:border-base-400">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-sm font-medium text-base-content/70"><Trans>Date & Time</Trans></Text>
            <Text className="text-sm font-medium text-base-content">{selectedDateTime.date} • {selectedDateTime.time}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium text-base-content/70"><Trans>Service</Trans></Text>
            <Text className="text-sm font-medium text-base-content">{selectedServicePrice ? `$${selectedServicePrice.toFixed(2)}` : <Trans>Free</Trans>}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          className={`py-4 rounded-xl flex-row items-center justify-center ${
            isBooking || isLoading ? 'bg-primary/70 dark:bg-primary/50' : 'bg-primary dark:bg-primary/80'
          }`}
          onPress={handleNext}
          disabled={isBooking || isLoading}
          activeOpacity={0.9}
        >
          {isLoading ? (
            <View className="flex-row items-center">
              <Text className="text-white font-semibold text-base">
                <Trans>Processing...</Trans>
              </Text>
            </View>
          ) : (
            <View className="items-center">
              <Text className="text-white font-semibold text-base">
                {selectedServicePrice && selectedServicePrice > 0 ? (
                  <Trans>Continue to Payment</Trans>
                ) : (
                  <Trans>Confirm Appointment</Trans>
                )}
              </Text>
              <Text className="text-white/90 text-xs mt-1">
                <Trans>You'll receive a confirmation email</Trans>
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>


      <TouchableOpacity
        className="py-3 px-4 rounded-lg border border-base-200 mt-2 bg-base-200"
        onPress={onBack}
      >
        <Text className="text-center font-medium text-base-content">
          <Trans>Back to Time Selection</Trans>
        </Text>
      </TouchableOpacity>

      <Modal visible={showCountryPicker} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-base-100">
          <View className="flex-row items-center justify-between p-4 border-b border-base-200">
            <Text className="text-lg font-semibold text-base-content">
              <Trans>Select Country</Trans>
            </Text>
            <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
              <Text className="text-blue-600 font-medium">
                <Trans>Done</Trans>
              </Text>
            </TouchableOpacity>
          </View>

          <View className="p-4">
            <View className="flex-row items-center border border-base-200 rounded-lg p-3 bg-base-100">
              <Search size={20} />
              <TextInput
                className="flex-1 ml-2"
                placeholder="Search countries..."
                value={countrySearchQuery}
                onChangeText={setCountrySearchQuery}
              />
            </View>
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item, index) => `${item.code}-${item.country}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center justify-between p-4 border-b border-base-200"
                onPress={() => {
                  onChange("countryCode", item.code);
                  setShowCountryPicker(false);
                  setCountrySearchQuery("");
                }}
              >
                <View>
                  <Text className="font-medium text-base-content">{item.name}</Text>
                  <Text className="text-base-content text-sm">{item.code}</Text>
                </View>
                {formData.countryCode === item.code && (
                  <Text className="text-primary font-bold">✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

export default PersonalInfoForm;
