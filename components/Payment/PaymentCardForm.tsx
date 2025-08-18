import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useMercadoPago } from '../../hooks/useMercadoPago';
import { formatCurrency } from '@/utils/currencyUtils';
import { PaymentCardFormProps, WebPaymentStatus } from '@/types/Payment/mercadoPago.types';
import MercadoPagoWebForm from './MercadoPagoWebForm/MercadoPagoWebForm';

const PaymentCardForm: React.FC<PaymentCardFormProps> = ({
    amount,
    onPaymentSuccess,
    onError,
    publicKey,
    email = '',
}) => {
    const [localEmail, setLocalEmail] = useState(email);

    const {
        isLoading,
        error,
        initCardForm,
        processPayment,
    } = useMercadoPago({
        publicKey,
        amount,
        email: localEmail || email,
        onPaymentSuccess,
        onError,
        onLoadingChange: (loading: boolean) => {
            console.log('Loading state changed:', loading);
        }
    });
    
    const paymentStatus: WebPaymentStatus = isLoading ? 'loading' : 'idle';

    useEffect(() => {
        if (email && email !== localEmail) {
            setLocalEmail(email);
        }
    }, [email, localEmail]);

    const handleSubmit = useCallback(async (formData: any) => {
        try {
            const paymentData = {
                ...formData,
                email: localEmail || email
            };
            await processPayment(paymentData);
        } catch (error) {
            console.error('Payment submission error:', error);
            if (onError) {
                onError(error instanceof Error ? error : new Error('Error al procesar el pago'));
            }
        }
    }, [processPayment, onError, localEmail, email]);

    const handleInputChange = useCallback((field: string, value: string) => {
        if (field === 'email' || field === 'cardholderEmail') {
            setLocalEmail(value);
        }
    }, [initCardForm]);

    if (Platform.OS === 'web') {
        return (
            <View style={styles.container}>
                <MercadoPagoWebForm 
                    amount={amount}
                    paymentStatus={paymentStatus}
                    errorMessage={error?.message || ''}
                    onSubmit={handleSubmit}
                    onInputChange={handleInputChange}
                    onInputFocus={() => {}} // Dummy handler since it's required but not used
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.mobileContainer}>
                <Text style={styles.amountText}>
                    Monto: {formatCurrency(amount)}
                </Text>
                <Text style={styles.mobileText}>
                    El formulario de pago se mostrará aquí en la versión móvil
                </Text>
            </View>
        </View>
    );
};

export default PaymentCardForm;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxWidth: 600,
        marginVertical: 10,
        minHeight: 400,
    },
    formContainer: {
        width: '100%',
        minHeight: 400,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: 8,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#333',
    },
    errorContainer: {
        backgroundColor: '#ffebee',
        padding: 20,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#f44336',
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 15,
        lineHeight: 22,
    },
    mobileContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    amountText: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    mobileText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    }
});