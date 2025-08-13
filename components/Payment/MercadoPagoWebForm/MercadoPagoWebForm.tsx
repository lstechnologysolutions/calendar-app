import React, { useState } from "react";
import Card from "react-credit-cards";
import "react-credit-cards/es/styles-compiled.css";
import { cn } from "@/lib/utils";
import { MercadoPagoWebFormProps, INITIAL_STATE_CARD, FormCardState, InstallmentOption } from '@/types/Payment/MercadoPago';
import { FormInput, InstallmentSelect } from './CustomFormComponents';
import { IDENTIFICATION_TYPES } from "@/types/hooks/useMercadoPago";

export default function MercadoPagoWebForm({
    amount = 0,
    paymentStatus,
    errorMessage,
    onSubmit,
    onInputChange,
    onInputFocus,
}: MercadoPagoWebFormProps) {
    const [formData, setFormData] = useState<FormCardState >({
        ...INITIAL_STATE_CARD,
        securityCode: '',
        expiryDate: '',
        email: '',
        focus: 'number'
    });

    const installmentOptions: InstallmentOption[] = [
        {
            installments: 1,
            recommended_message: `1 cuota de $${amount.toFixed(2)}`,
            installments_amount: amount,
            total_amount: amount
        },
        {
            installments: 3,
            recommended_message: `3 cuotas de $${(amount / 3).toFixed(2)}`,
            installments_amount: amount / 3,
            total_amount: amount
        },
        {
            installments: 6,
            recommended_message: `6 cuotas de $${(amount / 6).toFixed(2)}`,
            installments_amount: amount / 6,
            total_amount: amount
        }
    ];

    const handleInputChange = (field: keyof FormCardState, value: string) => {
        const newState = {
            ...formData,
            [field]: value,
        } as FormCardState;

        if (field === 'email' || field === 'cardholderEmail') {
            newState.email = value;
            newState.cardholderEmail = value;
        }
        else if (field === 'cardNumber') {
            const cardNumber = value.replace(/\D/g, '');
            if (cardNumber.length >= 6) {
                const firstDigit = cardNumber[0];
                if (firstDigit === '4') newState.issuer = 'visa';
                else if (firstDigit === '5') newState.issuer = 'master';
                else if (firstDigit === '3') newState.issuer = 'amex';
            }
        }
        else if (field === 'expiryDate') {
            const [month, year] = value.split('/');
            if (month) newState.cardExpirationMonth = month;
            if (year) newState.cardExpirationYear = year.slice(-2); // Take last 2 digits of year
        }

        setFormData(newState);
        onInputChange(field as string, value);
    };

    const handleInstallmentChange = (value: string) => {
        handleInputChange('installments', value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (paymentStatus === 'loading') {
            return;
        }

        try {
            if (!formData.cardholderEmail?.trim()) {
                throw new Error('Por favor ingresa tu correo electrónico');
            }

            // Prepare the payment data with all required fields
            const paymentData = {
                ...formData,
                email: formData.cardholderEmail.trim(),
                // Ensure we have all required fields for the payment
                cardNumber: formData.cardNumber.replace(/\s+/g, ''), // Remove spaces from card number
                securityCode: formData.securityCode,
                cardExpirationMonth: formData.cardExpirationMonth || formData.expiryDate.split('/')[0],
                cardExpirationYear: formData.cardExpirationYear || formData.expiryDate.split('/')[1]?.slice(-2),
                installments: formData.installments || '1',
                issuer: formData.issuer || 'visa', // Default to visa if not detected
                docType: formData.documentType || 'DNI', // Default to DNI if not set
                docNumber: formData.documentNumber || ''
            };

            await onSubmit(paymentData);
        } catch (error) {
            console.error('Form submission error:', error);
            throw error;
        }
    };

    const formatCardNumber = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{4})(?=\d)/g, '$1 ')
            .trim();
    };

    const handleCardNumberChange = (value: string) => {
        // Format the card number with spaces
        const formatted = formatCardNumber(value);
        handleInputChange('cardNumber', formatted);
    };

    const handleExpirationChange = (value: string) => {
        // Auto-insert slash for MM/YY format
        let formatted = value.replace(/\D/g, '');
        if (formatted.length > 2) {
            formatted = `${formatted.slice(0, 2)}/${formatted.slice(2, 4)}`;
        }
        handleInputChange('expiryDate', formatted);
    };

    const handleSecurityCodeChange = (value: string) => {
        // Limit to 3-4 digits
        const formatted = value.replace(/\D/g, '').slice(0, 4);
        handleInputChange('securityCode', formatted);
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-sm border border-border">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Pago con Tarjeta</h2>

            <div className="mb-6">
                <div className="relative">
                    <Card
                        cvc={formData.cvc}
                        expiry={formData.cardExpirationMonth + formData.cardExpirationYear}
                        name={formData.cardholderName}
                        number={formData.cardNumber}
                        focused={formData.focus}
                        issuer={formData.issuer}
                    />
                    {formData.issuer && (
                        <div className="absolute top-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded text-sm font-medium">
                            {formData.issuer}
                        </div>
                    )}
                </div>
            </div>

            {errorMessage && (
                <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md">
                    {errorMessage}
                </div>
            )}

            {paymentStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    Pago procesado exitosamente
                </div>
            )}

            <form
                id="form-checkout"
                className="space-y-4"
                onSubmit={handleSubmit}
            >
                <div className="space-y-4">
                    {/* Email */}
                    <FormInput
                        label="Correo electrónico"
                        type="email"
                        id="form-checkout__cardholderEmail"
                        name="cardholderEmail"
                        value={formData.cardholderEmail}
                        onChange={(value) => handleInputChange('cardholderEmail', value)}
                        onFocus={() => onInputFocus('email')}
                        placeholder="tucorreo@ejemplo.com"
                        required
                        disabled={paymentStatus === 'loading'}
                    />

                    {/* Card Number */}
                    <FormInput
                        label="Número de tarjeta"
                        name="cardNumber"
                        type="text"
                        id="form-checkout__cardNumber"
                        value={formData.cardNumber}
                        onChange={handleCardNumberChange}
                        onFocus={() => onInputFocus('number')}
                        placeholder="1234 5678 9012 3456"
                        disabled={paymentStatus === 'loading'}
                    />

                    {/* Cardholder Name */}
                    <FormInput
                        label="Nombre del titular"
                        name="cardholderName"
                        type="text"
                        id="form-checkout__cardholderName"
                        value={formData.cardholderName || ''}
                        onChange={(value) => handleInputChange('cardholderName', value)}
                        onFocus={() => onInputFocus('name')}
                        placeholder="Como aparece en la tarjeta"
                        required
                        disabled={paymentStatus === 'loading'}
                    />

                    {/* Expiration Date and Security Code */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <FormInput
                                label="Vencimiento (MM/AA)"
                                name="expiryDate"
                                type="text"
                                id="form-checkout__expiryDate"
                                value={formData.expiryDate}
                                onChange={handleExpirationChange}
                                onFocus={() => onInputFocus('expiry')}
                                placeholder="MM/AA"
                                maxLength={5}
                                disabled={paymentStatus === 'loading'}
                            />
                        </div>
                        <div>
                            <FormInput
                                label="Código de seguridad"
                                name="securityCode"
                                type="password"
                                id="form-checkout__securityCode"
                                value={formData.securityCode}
                                onChange={handleSecurityCodeChange}
                                onFocus={() => onInputFocus('cvc')}
                                placeholder="CVC"
                                maxLength={4}
                                disabled={paymentStatus === 'loading'}
                            />
                        </div>
                    </div>

                    {/* Issuer Display */}
                    {formData.issuer && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-md border">
                            <p className="text-sm font-medium text-gray-700">Emisor: {formData.issuer}</p>
                        </div>
                    )}

                    <div className="mb-4">
                        <InstallmentSelect
                            options={installmentOptions}
                            value={formData.installments || ''}
                            onChange={handleInstallmentChange}
                            label="Número de cuotas"
                            optionsLabel="Seleccione el número de cuotas"
                        />
                    </div>
                </div>

                {/* Document Type and Number */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="form-checkout__identificationType" className="block text-sm font-medium text-foreground/80 mb-1">
                            Tipo de documento
                        </label>
                        <select
                            id="form-checkout__identificationType"
                            name="documentType"
                            className={cn(
                                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                                'text-foreground',
                                errorMessage && 'border-red-500 focus-visible:ring-red-500',
                                (paymentStatus === 'loading') && 'opacity-50 cursor-not-allowed'
                            )}
                            value={formData.documentType}
                            onChange={(e) => handleInputChange('documentType', e.target.value)}
                            onFocus={() => onInputFocus('documentType')}
                            required
                            disabled={paymentStatus === 'loading'}
                        >
                            {IDENTIFICATION_TYPES.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.id}: {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <FormInput
                            label="Número de documento"
                            name="documentNumber"
                            type="text"
                            id="form-checkout__identificationNumber"
                            value={formData.documentNumber}
                            onChange={(value) => handleInputChange('documentNumber', value)}
                            onFocus={() => onInputFocus('documentNumber')}
                            placeholder="12345678"
                            required
                            disabled={paymentStatus === 'loading'}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        className={cn(
                            'w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                            (paymentStatus === 'loading') ? 'opacity-70 cursor-not-allowed' : ''
                        )}
                        disabled={paymentStatus === 'loading'}
                    >
                        {paymentStatus === 'loading' ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Procesando...
                            </>
                        ) : (
                            `Pagar ${amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`
                        )}
                    </button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">Procesando pago...</p>
            </form>
        </div>
    );
}