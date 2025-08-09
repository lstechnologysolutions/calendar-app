import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
} from "react-native";
import { Trans } from "@lingui/react/macro";
import {
  AlertCircle,
} from "lucide-react-native";
import { Service } from "../types/Service";
import {
  BookingFormData,
  BookingSubmitPayload,
  SelectedDateTime,
} from "../types/Booking";
import PersonalInfoForm from "./BookingStep/PersonalInfoForm";
import PaymentMethods from "./BookingStep/PaymentMethods";
import SuccessScreen from "./BookingStep/SuccessScreen";
import ErrorScreen from "./BookingStep/ErrorScreen";

type BookingFormProps = {
  selectedService?: Service;
  selectedDateTime?: SelectedDateTime;
  onSubmit?: (formData: BookingSubmitPayload) => void;
  onBack?: () => void;
};

// Country codes are imported from a centralized config file

const BookingForm = ({
  selectedService = {
    id: "1",
    name: "Consultation",
    duration: "30 min",
    price: 0,
    description: "Initial consultation to discuss your needs",
    type: "free",
  },
  selectedDateTime = {
    date: "2023-06-15",
    time: "10:00 AM",
  },
  onSubmit = () => {},
  onBack = () => {},
}: BookingFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
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

  // Global validation summary and submit error banner
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
    // Clear global banners as user corrects input
    if (showValidationSummary) setShowValidationSummary(false);
    if (submitError) setSubmitError(null);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Remove all non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    // Check if it has at least 7 digits (minimum for most countries)
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
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!validatePhone(formData.countryCode + formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    // Validate payment fields if it's a paid service and we're including payment validation
    if (includePayment && selectedService.price && selectedService.price > 0) {
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

  const handleSubmit = () => {
    if (!validateForm()) {
      setShowValidationSummary(true);
      setSubmitError("Please fix the errors highlighted below.");
      // Bring the summary banner into view
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call with random success/failure
      setTimeout(() => {
        setIsLoading(false);
        const random = Math.random();
        if (random > 0.8) {
          // 20% chance of failure
          setSubmitError("We couldn't complete your payment. Please try again.");
          setCurrentStep(4); // Error step view
        } else {
          setCurrentStep(3); // Success step
        }
        onSubmit({ ...formData, status: random > 0.8 ? "error" : "success" });
      }, 1500);
    } catch (e) {
      setIsLoading(false);
      setSubmitError("Something went wrong while processing your request.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  

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
        {/* Progress indicator */}
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

        {/* Form steps */}
        {currentStep === 1 && (
          <PersonalInfoForm
            formData={formData}
            errors={errors}
            selectedServicePrice={selectedService.price ?? 0}
            onChange={(key, val) => updateFormData(key as string, val)}
            onNext={() => {
              if (selectedService.price && selectedService.price > 0) {
                if (validateForm(false)) {
                  setCurrentStep(2);
                } else {
                  setShowValidationSummary(true);
                  setSubmitError("Please fix the errors highlighted below.");
                  scrollRef.current?.scrollTo({ y: 0, animated: true });
                }
              } else {
                handleSubmit();
              }
            }}
            onBack={onBack}
            onShowValidationSummary={(show, message) => {
              setShowValidationSummary(show);
              if (message !== undefined) setSubmitError(message || null);
            }}
          />
        )}
        {currentStep === 2 && (
          <PaymentMethods
            formData={formData}
            errors={errors}
            isLoading={isLoading}
            onChange={(key, val) => updateFormData(key as string, val)}
            onPay={handleSubmit}
            onBack={() => setCurrentStep(1)}
            selectedService={selectedService}
            selectedDateTime={selectedDateTime}
            formatDate={formatDate}
          />
        )}
        {currentStep === 3 && (
          <SuccessScreen
            formData={formData}
            selectedService={selectedService}
            selectedDateTime={selectedDateTime}
            formatDate={formatDate}
            onBookAnother={() => {
              setCurrentStep(1);
              onBack();
            }}
            onReturnHome={() => {
              setCurrentStep(1);
              onBack();
            }}
          />
        )}
        {currentStep === 4 && (
          <ErrorScreen
            selectedService={selectedService}
            selectedDateTime={selectedDateTime}
            formatDate={formatDate}
            onTryAgain={() => setCurrentStep(1)}
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
