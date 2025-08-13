import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Trans } from '@lingui/react/macro';
import { CreditCard, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { PriceDisplay } from '../../src/components/ui/PriceDisplay';
import { BookingFormData, SelectedDateTime } from '@/types/Booking';
import { Service } from '@/types/Service';
import { paymentService } from '@/lib/services/payment/paymentClientService';
import PaymentCardForm from '../Payment/PaymentCardForm';
import SuccessScreen from './SuccessScreen';



type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

export type PaymentMethodsProps = {
  formData: BookingFormData;
  errors: Record<string, string>;
  isLoading: boolean;
  isBooking?: boolean;
  onChange: (key: keyof BookingFormData, value: string) => void;
  onPaymentSuccess: (paymentData: any) => void;
  onBack: () => void;
  selectedService: Service | null;
  selectedDateTime: SelectedDateTime;
};

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  formData,
  errors,
  isLoading: isParentLoading,
  onPaymentSuccess,
  onBack,
  selectedService,
  selectedDateTime,
}) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handlePaymentError = useCallback((error: Error) => {
    console.error('Payment form error:', error);
    setPaymentStatus('error');
    setErrorMessage(error.message || 'Error initializing payment form.');
  }, []);

  const handlePaymentSuccess = useCallback(async (paymentData: any) => {
    console.log('processing payment...');
    if (!selectedService) return;
    setPaymentStatus('processing');

    try {
     /*  const { data, error } = await paymentService.processPayment({
        ...paymentData,
        description: `Booking for ${selectedService.name}`,
        amount: selectedService.price,
      });

      if (error) {
        throw new Error(error);
      } */

      setPaymentStatus('success');
      //onPaymentSuccess(data);
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message || 'Failed to process payment. Please try again.');
    }
  }, [selectedService, onPaymentSuccess]);

  // Early return if no service is selected
  if (!selectedService) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color="#d32f2f" />
          <Text style={styles.errorText}>
            <Trans>No service selected. Please go back and select a service.</Trans>
          </Text>
        </View>
      </View>
    );
  }

  // Show success state
  if (paymentStatus === 'success') {
    return (
      <View style={styles.successContainer}>
        <SuccessScreen 
          formData={formData}
          selectedService={selectedService}
          selectedDateTime={selectedDateTime}
          onBookAnother={() => {}}
          onReturnHome={() => {}}
          />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>
          <Trans>Payment Information</Trans>
        </Text>
      </View>

      {errorMessage ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color="#d32f2f" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <View className="bg-base-200 p-4 rounded-lg mb-4 border border-base-200">
        <Text className="font-medium text-base-content">
          <Trans>Booking Summary</Trans>
        </Text>
        <Text className="text-base-content/70 mt-1">
          {selectedService.name} ({selectedService.duration})
        </Text>
        <Text className="text-base-content/70">
          {selectedDateTime.date} at {selectedDateTime.time}
        </Text>
        <View className="mt-2">
          <PriceDisplay 
            amount={selectedService.price} 
            variant="large" 
            showFree={false}
          />
        </View>
      </View>


      <View style={styles.content}>
        {paymentStatus === 'processing' ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>
              <Trans>Processing your payment...</Trans>
            </Text>
          </View>
        ) : selectedService.price !== null ? (
          <View style={{ width: '100%' }}>
            <PaymentCardForm
              amount={selectedService.price}
              onPaymentSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              publicKey={process.env.EXPO_PUBLIC_MERCADOPAGO_PUBLIC_KEY || ''}
              formId="form-checkout"
              email={formData.email}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#fff0f0',
    padding: 12,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    marginLeft: 8,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    color: '#2e7d32',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
});

export default PaymentMethods;
