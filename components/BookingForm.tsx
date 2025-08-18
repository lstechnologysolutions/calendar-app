import React, { useRef, useState, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { AlertCircle } from "lucide-react-native";
import { BookingFormData, BookingFormProps } from "@/types/Booking.types";
import PersonalInfoForm from "./BookingStep/PersonalInfoForm";
import { DEFAULT_SERVICE } from "@/config/services.config";
import PaymentMethods from "./BookingStep/PaymentMethods";
import SuccessScreen from "./BookingStep/SuccessScreen";
import ErrorScreen from "./BookingStep/ErrorScreen";

const BookingForm = ({
  selectedService,
  onSubmit = async () => ({ status: 'success' as const }),
  onBack = () => {},
  onBookAnother = () => {},
  onReturnHome = () => {},
  selectedDateTime,
  isBooking = false,
}: BookingFormProps) => {
  const service = selectedService || DEFAULT_SERVICE;
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+1",
    notes: "",
    paymentMethod: "credit_card",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
    if (showValidationSummary) setShowValidationSummary(false);
    if (submitError) setSubmitError(null);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    const digitCount = cleanPhone.replace(/[^\d]/g, "").length;
    return digitCount >= 7 && digitCount <= 15;
  };

  const validateForm = (includePayment: boolean = true) => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    };

    let isValid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (formData.phone && !validatePhone(formData.countryCode + formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    if (includePayment && service && service.price && service.price > 0) {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required";
        isValid = false;
      } else if (formData.cardNumber.replace(/\s/g, "").length < 13) {
        newErrors.cardNumber = "Please enter a valid card number";
        isValid = false;
      }

      if (!formData.cardExpiry.trim()) {
        newErrors.cardExpiry = "Expiry date is required";
        isValid = false;
      } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
        newErrors.cardExpiry = "Please enter MM/YY format";
        isValid = false;
      }

      if (!formData.cardCvc.trim()) {
        newErrors.cardCvc = "CVC is required";
        isValid = false;
      } else if (formData.cardCvc.length < 3) {
        newErrors.cardCvc = "Please enter a valid CVC";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };



  const handleSubmit = useCallback(async () => {
    if (!service) {
      console.error('No service selected');
      return;
    }

    if (!validateForm(service.type === 'paid')) {
      setShowValidationSummary(true);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit(formData);
      
      if (result.status === 'success') {
        setCurrentStep(3);
      } else {
        const errorMessage = result.error || "Something went wrong while processing your request.";
        setSubmitError(errorMessage);
        setCurrentStep(4);
      }
    } catch (e) {
      console.error('Form submission error:', e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred. Please try again.";
      setSubmitError(errorMessage);
      setCurrentStep(4);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, service, onSubmit, validateForm]);


  return (
    <ScrollView ref={scrollRef} className="bg-base-100 p-4">
      <View className="bg-base-100 rounded-xl p-5 shadow-sm">
        {(showValidationSummary || submitError) && (
          <View
            className={`mb-4 p-3 rounded-lg border ${submitError ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"}`}
          >
            <View className="flex-row items-center">
              <AlertCircle size={18} color={submitError ? "#b45309" : "#ef4444"} />
              <Text
                className={`ml-2 ${submitError ? "text-yellow-800" : "text-red-700"} font-medium`}
              >
                {submitError ?? "There are problems with some fields. Please review the highlighted inputs below."}
              </Text>
            </View>
          </View>
        )}

        {currentStep < 3 && (
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <View
                className={`h-2 rounded-full ${currentStep >= 1 ? "bg-primary" : "bg-gray-200"}`}
              />
            </View>
            <View className="w-4" />
            <View className="flex-1">
              <View
                className={`h-2 rounded-full ${currentStep >= 2 ? "bg-primary" : "bg-gray-200"}`}
              />
            </View>
          </View>
        )}

        {currentStep === 1  && selectedDateTime && (
          <PersonalInfoForm
            formData={formData}
            errors={errors}
            selectedServicePrice={service.price ?? 0}
            onChange={(key, val) => updateFormData(key as string, val)}
            onNext={async () => {
              if (service.price && service.price > 0) {
                if (validateForm(false)) {
                  setCurrentStep(2);
                } else {
                  setShowValidationSummary(true);
                  setSubmitError("Please fix the errors highlighted below.");
                  scrollRef.current?.scrollTo({ y: 0, animated: true });
                }
              } else {
                await handleSubmit();
              }
            }}
            onBack={onBack}
            onShowValidationSummary={(show, message) => {
              setShowValidationSummary(show);
              if (message !== undefined) setSubmitError(message || null);
            }}
            selectedDateTime={selectedDateTime}
            isBooking={isBooking}
          />
        )}
        {currentStep === 2 && selectedDateTime && (
          <PaymentMethods
            formData={formData}
            errors={errors}
            isLoading={isSubmitting}
            onChange={(key, value) => updateFormData(key, value)}
            onPaymentSuccess={(paymentData) => {
              console.log('Payment successful:', paymentData);
              handleSubmit();
            }}
            onBack={() => setCurrentStep(1)}
            selectedService={service}
            selectedDateTime={selectedDateTime}
          />
        )}
        {currentStep === 3 && selectedDateTime && (
          <SuccessScreen
            formData={formData}
            selectedService={service}
            selectedDateTime={selectedDateTime}
            onBookAnother={onBookAnother}
            onReturnHome={onReturnHome}
          />
        )}
        {currentStep === 4 && selectedDateTime && (
          <ErrorScreen
            selectedService={service}
            selectedDateTime={selectedDateTime}
            isBooking={isBooking}
            onTryAgain={handleSubmit}
            onStartOver={() => {
              setCurrentStep(1);
              onBack();
            }}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default BookingForm;
