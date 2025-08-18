import { useState, useEffect, useRef, useCallback } from 'react';
import useScript from './useScript';
import { formConfig } from '@/config/mercadoPagoForm.config';
import { 
    UseMercadoPagoProps, 
    UseMercadoPagoReturn, 
    IDENTIFICATION_TYPES,
} from '@/types/hooks/useMercadoPago.types';
import { PaymentData, PaymentStatus } from '@/types/Payment/mercadoPago.types';
import { getFormattedAmounts } from '@/utils/currencyUtils';
import { paymentService } from '@/lib/services/payment/paymentClientService';

export const useMercadoPago = (options: UseMercadoPagoProps): UseMercadoPagoReturn => {
    const { publicKey, amount, onPaymentSuccess, onError, onLoadingChange } = options;
    const [isLoading, setIsLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
    const [error, setError] = useState<Error | null>(null);
    const [mpInstance, setMpInstance] = useState<any>(null);
    const [isReady, setIsReady] = useState(false);
    const [identificationTypes, setIdentificationTypes] = useState<Array<{id: string, name: string}>>(IDENTIFICATION_TYPES);
    const formRef = useRef<HTMLFormElement | null>(null);
    const cardFormRef = useRef<any>(null);

    const { MercadoPago: MercadoPagoClass, isScriptLoadSucceed, error: scriptError } = useScript(
        'https://sdk.mercadopago.com/js/v2',
        'MercadoPago'
    );

    useEffect(() => {
        const fetchIdentificationTypes = async () => {
            if (!mpInstance) return;
            
            try {
                const types = await mpInstance.getIdentificationTypes();
                if (types && types.length > 0) {
                    setIdentificationTypes(types);
                }
            } catch (err) {
                console.error('Error fetching identification types:', err);
            }
        };

        fetchIdentificationTypes();
    }, [mpInstance]);

    useEffect(() => {
        if (isScriptLoadSucceed && MercadoPagoClass && !mpInstance) {
            try {
                const mp = new MercadoPagoClass(publicKey, {
                   locale: "en-US",
                });
                setMpInstance(mp);
                setIsReady(true);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to initialize MercadoPago');
                setError(error);
                onError?.(error);
            }
        }
    }, [isScriptLoadSucceed, MercadoPagoClass, publicKey, onError]);

    useEffect(() => {
        if (scriptError) {
            setError(scriptError);
            onError?.(scriptError);
        }
    }, [scriptError, onError]);

    useEffect(() => {
        onLoadingChange?.(isLoading);
    }, [isLoading, onLoadingChange]);
    const initCardForm = useCallback((formElement: HTMLFormElement) => {
        if (!mpInstance) {
            return;
        }

        if (!isScriptLoadSucceed) {
            return;
        }

        if (isLoading) {
            return;
        }

        try {
            formRef.current = formElement;
            const cardForm = mpInstance.cardForm({
                amount: amount.toString(),
                autoMount: true,
                form: formConfig,
                callbacks: {
                    onFormMounted: (error: any) => {
                        if (error) {
                            console.error('Error mounting card form:', error);
                            setError(new Error('Error al cargar el formulario de pago'));
                            return;
                        }
                        console.log('Card form mounted successfully');
                    },
                    onSubmit: async (event: Event) => {
                        event.preventDefault();
                        if (isLoading) {
                            return;
                        }

                        setIsLoading(true);
                        setError(null);

                        try {
                            const formData = cardForm.getCardFormData();
                            if (!formData) {
                                throw new Error('No se pudo obtener los datos del formulario');
                            }

                            const defaultIdType = identificationTypes.length > 0 ? identificationTypes[0].id : 'CC';
                            const tokenData = {
                                cardNumber: formData.cardNumber?.replace(/\s/g, '') || '',
                                cardholderName: formData.cardholderName || '',
                                cardExpirationMonth: formData.cardExpirationMonth || '',
                                cardExpirationYear: formData.cardExpirationYear || '',
                                securityCode: formData.securityCode || '',
                                identificationType: formData.identificationType || defaultIdType,
                                identificationNumber: formData.identificationNumber || ''
                            };

                            console.log('Creating card token with data:', {
                                ...tokenData,
                                cardNumber: tokenData.cardNumber ? `${tokenData.cardNumber.substring(0, 4)}...${tokenData.cardNumber.slice(-4)}` : 'missing',
                                securityCode: tokenData.securityCode ? '***' : 'missing'
                            });
                            
                            const tokenCreationTime = new Date();
                            console.log('Token creation started at:', tokenCreationTime.toISOString());
                            
                            try {
                                const tokenResponse = await mpInstance.createCardToken(tokenData);
                                const tokenReceivedTime = new Date();
                                const tokenAgeMs = tokenReceivedTime.getTime() - tokenCreationTime.getTime();
                                
                                console.log('Token data received:', {
                                    ...tokenResponse,
                                    tokenAgeMs,
                                    receivedAt: tokenReceivedTime.toISOString()
                                });
                                
                                if (!tokenResponse || !tokenResponse.id) {
                                    throw new Error('Invalid token response format: ' + JSON.stringify(tokenResponse));
                                }
                                
                                if (typeof tokenResponse.id !== 'string' || tokenResponse.id.length < 10) {
                                    throw new Error('Invalid token format received');
                                }
                                
                                const tokenWithTimestamp = {
                                    ...tokenResponse,
                                    _createdAt: tokenReceivedTime.toISOString(),
                                    _expiresAt: new Date(tokenReceivedTime.getTime() + (7 * 60 * 1000)).toISOString() // 7 minutes from now
                                };
                                
                                return tokenWithTimestamp;
                            } catch (err) {
                                const errorTime = new Date();
                                const errorDuration = errorTime.getTime() - tokenCreationTime.getTime();
                                console.error('Error creating card token:', {
                                    error: err,
                                    errorTime: errorTime.toISOString(),
                                    durationMs: errorDuration,
                                    tokenData: {
                                        ...tokenData,
                                        cardNumber: tokenData.cardNumber ? '***' + tokenData.cardNumber.slice(-4) : 'missing',
                                        securityCode: '***'
                                    }
                                });
                                
                                const error = err instanceof Error ? err : new Error('Error al procesar el pago: ' + String(err));
                                setError(error);
                                onError?.(error);
                                return Promise.reject(error);
                            } finally {
                                setIsLoading(false);
                            }
                        } catch (err) {
                            console.error('Error in payment submission:', err);
                            const error = err instanceof Error ? err : new Error('Error al procesar los datos del formulario');
                            setError(error);
                            onError?.(error);
                            setIsLoading(false);
                            return Promise.reject(error);
                        }
                    },
                    onError: (error: any) => {
                        console.error('Card form error:', error);
                        const errorMessage = error?.cause?.[0]?.description || 'Error en el formulario de pago';
                        const formError = new Error(errorMessage);
                        setError(formError);
                        onError?.(formError);
                    },
                    onCardTokenReceived: (errorData: any, token: any) => {
                        console.log('Card token received:', token);
                        console.log('Error data:', errorData);
                        if (errorData && errorData.error.fieldErrors.length !== 0) {
                            errorData.error.fieldErrors.forEach((errorMessage: any) => {
                                alert(errorMessage)
                            });
                        }
                        return token;
                    },
                },
            });

            cardFormRef.current = cardForm;

            return () => {
                if (cardFormRef.current) {
                    try {
                        cardFormRef.current.unmount();
                    } catch (err) {
                        console.error('Error unmounting card form:', err);
                    }
                    cardFormRef.current = null;
                }
            };
        } catch (err) {
            console.error('Error initializing card form:', err);
            const error = err instanceof Error ? err : new Error('Error al inicializar el formulario de pago');
            setError(error);
        }
        
    }, [mpInstance, amount, isLoading, onError]);
    const processPayment = useCallback(async (formData: any, onSuccess?: (result: any) => void, onErrorCallback?: (error: Error) => void) => {
        if (!mpInstance) {
            throw new Error('MercadoPago instance is not initialized');
        }
        
        try {
            const selectedType = identificationTypes.find(t => t.id === formData.identificationType) || 
                               (identificationTypes.length > 0 ? identificationTypes[0] : null);
            
            if (!selectedType) {
                throw new Error('No se encontraron tipos de identificación disponibles');
            }
            
            const identificationNumber = (formData.documentNumber || formData.identificationNumber || '').replace(/\D/g, '');
            
            if (!identificationNumber) {
                throw new Error('El número de identificación es requerido');
            }

            try {
                // Validate amount
                const usdAmount = Number(amount);
                if (isNaN(usdAmount) || !isFinite(usdAmount) || usdAmount <= 0) {
                    throw new Error('El monto debe ser un número positivo');
                }
                
                // Format amount
                const formattedAmounts = getFormattedAmounts(usdAmount);
                const copAmount = formattedAmounts.copValue;
                const numericAmount = parseFloat(copAmount.toFixed(2));

                // Create card token
                const tokenResponse = await mpInstance.createCardToken({
                    cardNumber: (formData.cardNumber || '').replace(/\s/g, ''),
                    cardholderName: formData.cardholderName || '',
                    cardExpirationMonth: formData.cardExpirationMonth || '',
                    cardExpirationYear: formData.cardExpirationYear?.length === 2 
                        ? `20${formData.cardExpirationYear}` 
                        : formData.cardExpirationYear || '',
                    securityCode: formData.securityCode || '',
                    cardholder: {
                        identification: {
                            type: selectedType.id,
                            number: identificationNumber
                        },
                        name: formData.cardholderName || ''
                    }
                });
                
                if (!tokenResponse?.id) {
                    throw new Error('No se pudo generar el token de pago');
                }
                
                // Determine payment method
                const paymentMethodId = tokenResponse.payment_method_id || 
                    (tokenResponse.first_six_digits ? 
                        (tokenResponse.first_six_digits.startsWith('4') ? 'visa' : 
                         tokenResponse.first_six_digits.startsWith('5') ? 'master' : 
                         tokenResponse.first_six_digits.startsWith('3') ? 'amex' : 'master') 
                    : 'master');

                // Create payment data
                const paymentData: PaymentData = {
                    token: tokenResponse.id,
                    description: 'Pago de servicio',
                    installments: 1,
                    payment_method_id: paymentMethodId,
                    transaction_amount: numericAmount,
                    payer: {
                        email: options.email || 'test@test.com',
                        identification: {
                            type: selectedType.id,
                            number: identificationNumber
                        },
                        cardholder_name: formData.cardholderName || ''
                    },
                    card_number: formData.cardNumber?.replace(/\s+/g, '') || '',
                    security_code: formData.securityCode || '',
                    card_expiration_month: formData.cardExpirationMonth?.toString() || '',
                    card_expiration_year: formData.cardExpirationYear?.toString() || '',
                    email: options.email,
                    documentType: selectedType.id,
                    documentNumber: identificationNumber,
                    type: selectedType.id,
                    number: identificationNumber,
                    issuer: paymentMethodId,
                    // Store additional metadata in a way that won't conflict with PaymentData
                    additionalData: {
                        token_created: new Date().toISOString(),
                        request_id: `client_${Date.now()}`
                    }
                };

                console.log('Sending payment request:', {
                    amount: numericAmount,
                    paymentMethod: paymentMethodId,
                    timestamp: new Date().toISOString()
                });

                // Process payment
                const result = await paymentService.processPayment(paymentData);
                
                if (!result) {
                    throw new Error('No se recibió respuesta del servidor de pago');
                }
                
                // Create a success response that matches the expected PaymentData type
                const successResponse: PaymentData = {
                    token: paymentData.token,
                    description: paymentData.description,
                    installments: paymentData.installments,
                    payment_method_id: paymentMethodId,
                    transaction_amount: numericAmount,
                    payer: paymentData.payer,
                    // Include any additional fields from the result
                    ...(result as any)
                };

                // Call the success callback with the response
                const callbackResponse = {
                    ...successResponse,
                    success: true,
                    status: 'approved',
                    id: (result as any)?.id || `payment_${Date.now()}`
                };

                if (onSuccess) {
                    onSuccess(callbackResponse);
                } else if (onPaymentSuccess) {
                    onPaymentSuccess(callbackResponse);
                }
                
                return callbackResponse;
                
            } catch (err) {
                console.error('Payment processing error:', err);
                const error = err instanceof Error ? err : new Error('Error al procesar el pago');
                
                if (onErrorCallback) {
                    onErrorCallback(error);
                } else if (onError) {
                    onError(error);
                }
                
                throw error;
            } finally {
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error in processPayment:', error);
            if (onErrorCallback) {
                onErrorCallback(error instanceof Error ? error : new Error(String(error)));
            } else if (onError) {
                onError(error instanceof Error ? error : new Error(String(error)));
            }
            throw error;
        }
    }, [mpInstance, amount, onPaymentSuccess, onError, options, identificationTypes]);

    return {
        paymentStatus,
        isLoading,
        error,
        initCardForm,
        mpInstance,
        processPayment,
        identificationTypes,
    };
};

export default useMercadoPago;
