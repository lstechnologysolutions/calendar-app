/**
 * Payment-related utility functions
 */

/**
 * Determines the card type based on the card number
 * @param cardNumber The card number (with or without spaces)
 * @returns The card type (e.g., 'visa', 'master', 'amex')
 */
export const getCardType = (cardNumber: string): string => {
  // Remove all non-digit characters
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  // Card type detection patterns
  const patterns = {
    visa: /^4/,
    master: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
  };

  // Check each pattern
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleanNumber)) {
      return type;
    }
  }
  
  // Default to visa if no match found (you might want to handle this differently)
  return 'visa';
};

import { PaymentFormState } from '@/types/Payment/MercadoPago.types';

export const validateField = <K extends keyof PaymentFormState>(
  field: K,
  value: PaymentFormState[K]
): string => {
  const stringValue = String(value || '').trim();
  
  switch (field) {
    case 'email':
      if (!stringValue) return 'El correo electrónico es requerido';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
        return 'Ingresa un correo electrónico válido';
      }
      return '';
      
    case 'cardNumber':
      if (!stringValue) return 'El número de tarjeta es requerido';
      if (!/^\d{13,19}$/.test(stringValue.replace(/\s+/g, ''))) {
        return 'El número de tarjeta debe tener entre 13 y 19 dígitos';
      }
      return '';
      
    case 'cardholderName':
      if (!stringValue) return 'El nombre del titular es requerido';
      if (stringValue.length < 3) {
        return 'El nombre debe tener al menos 3 caracteres';
      }
      return '';
      
    case 'expiryDate':
      if (!stringValue) return 'La fecha de vencimiento es requerida';
      if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(stringValue)) {
        return 'Formato de fecha inválido (MM/YY)';
      }
      return '';
      
    case 'securityCode':
      if (!stringValue) return 'El código de seguridad es requerido';
      if (!/^\d{3,4}$/.test(stringValue)) {
        return 'El código de seguridad debe tener 3 o 4 dígitos';
      }
      return '';
      
    case 'documentType':
      if (!stringValue) return 'El tipo de documento es requerido';
      return '';
      
    case 'documentNumber':
      if (!stringValue) return 'El número de documento es requerido';
      if (!/^\d{7,12}$/.test(stringValue)) {
        return 'El número de documento debe tener entre 7 y 12 dígitos';
      }
      return '';
      
    case 'installments':
      if (!stringValue) return 'Debes seleccionar el número de cuotas';
      return '';
      
    default:
      return '';
  }
};
