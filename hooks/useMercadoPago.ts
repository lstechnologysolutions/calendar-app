import { useState, useEffect, useRef, useCallback } from 'react';
import useScript from './useScript';
import { formConfig } from '@/config/mercadoPagoFormConfig';
import { UseMercadoPagoProps, CardTokenData, UseMercadoPagoReturn, IDENTIFICATION_TYPES } from '@/types/hooks/useMercadoPago';
import { PaymentData, PaymentStatus } from '@/types/Payment/MercadoPago';
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

                            console.log('Creating card token with data:', tokenData);
                            
                            return mpInstance.createCardToken(tokenData)
                                .then((tokenData: CardTokenData) => {
                                    console.log('Token data received:', tokenData);
                                    if (tokenData && tokenData.id) {
                                        return tokenData;
                                    }
                                    throw new Error('No se pudo generar el token de pago: ' + JSON.stringify(tokenData));
                                })
                                .catch((err: Error) => {
                                    console.error('Error creating card token:', err);
                                    const error = err instanceof Error ? err : new Error('Error al procesar el pago: ' + String(err));
                                    setError(error);
                                    onError?.(error);
                                    return Promise.reject(error);
                                })
                                .finally(() => {
                                    setIsLoading(false);
                                });
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
            onError?.(error);
        }
    }, [mpInstance, amount, isLoading, onError]);

    const processPayment = useCallback(async (formData: any, onSuccess?: (result: any) => void, onErrorCallback?: (error: Error) => void) => {
        if (!mpInstance) {
            const error = new Error('MercadoPago instance is not initialized');
            console.error(error.message);
            setError(error);
            onError?.(error);
            throw error;
        }
        
        setIsLoading(true);
        setError(null);
        
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

            const cardNumber = (formData.cardNumber || '').replace(/\s/g, '');
            const cardholderName = formData.cardholderName || '';
            const cardExpirationMonth = formData.cardExpirationMonth || '';
            const cardExpirationYear = formData.cardExpirationYear || '';
            const securityCode = formData.securityCode || '';

            const tokenData = await mpInstance.createCardToken({
                cardNumber: cardNumber,
                cardholderName: cardholderName,
                cardExpirationMonth: cardExpirationMonth,
                cardExpirationYear: cardExpirationYear.length === 2 ? `20${cardExpirationYear}` : cardExpirationYear,
                securityCode: securityCode,
                cardholder: {
                    identification: {
                        type: selectedType.id,
                        number: identificationNumber
                    },
                    name: cardholderName
                }
            });
            
            if (!tokenData?.id) {
                throw new Error('No se pudo generar el token de pago');
            }
            
            let paymentMethodId = tokenData.payment_method_id;
            
            if (!paymentMethodId && tokenData.first_six_digits) {
                const firstDigit = tokenData.first_six_digits.charAt(0);
                if (firstDigit === '4') {
                    paymentMethodId = 'visa';
                } else if (firstDigit === '5') {
                    paymentMethodId = 'master';
                } else if (firstDigit === '3') {
                    paymentMethodId = 'amex';
                }
            }
            
            if (!paymentMethodId) {
                paymentMethodId = 'master';
            }
            
            let numericAmount: number;
            let copAmount: number;
            
            try {

                const usdAmount = Number(amount);
                
                if (isNaN(usdAmount) || !isFinite(usdAmount) || usdAmount <= 0) {
                    throw new Error('El monto debe ser un número positivo');
                }
                
                const formattedAmounts = getFormattedAmounts(usdAmount);
                copAmount = formattedAmounts.copValue;
                
                numericAmount = parseFloat(copAmount.toFixed(2));
                
            } catch (error) {
                throw new Error('Error al procesar el monto. Por favor intente nuevamente.');
            }

            const paymentData = {
                transaction_amount: numericAmount,
                token: tokenData.id,
                description: 'Pago de servicio',
                payment_method_id: paymentMethodId,
                payer: {
                    email: options.email || 'test@test.com',
                    identification: {
                        type: selectedType.id,
                        number: identificationNumber
                    }
                },
                binary_mode: true,
                statement_descriptor: 'PAGO*SERVICIO'
            };

            const response = await paymentService.processPayment(paymentData);

            if (response.error) {
                throw new Error(response.error);
            }

            const result = response.data;
            console.log('Payment result from server:', result);

            if (result.success && (result.status === 'approved' || result.status === 'in_process')) {
                // Only call one of the success callbacks, not both
                //TODO: SIMPLY THIS 
                if (onSuccess) {
                    console.log('Calling onSuccess callback with result:', result);
                    onSuccess(result);
                } else if (onPaymentSuccess) {
                    console.log('Calling onPaymentSuccess callback with result:', result);
                    onPaymentSuccess(result);
                }
            } else {
                throw new Error(result.error || result.message || 'El pago no fue aprobado');
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error al procesar el pago');
            setError(error);
            onErrorCallback?.(error) || onError?.(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [mpInstance, amount, onPaymentSuccess, onError]);

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
