/**
 * Payment-related types and interfaces for the application.
 * This file consolidates all payment-related type definitions in one place.
 */

/**
 * Represents the status of a payment operation.
 * Used across the payment flow to track the current state.
 */
export type PaymentStatus = 'idle' | 'loading' | 'processing' | 'success' | 'error' | 'ready' | 'validating';

/**
 * Simplified payment status used in web forms.
 * Maps to the core PaymentStatus but with fewer states for simpler UI handling.
 */
export type WebPaymentStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Represents which field in the card form is currently focused.
 * Used for styling and accessibility in the credit card input form.
 */
export type Focused = 'number' | 'name' | 'expiry' | 'cvc';

/**
 * Represents the data required to process a payment.
 */
export interface PaymentData {
  /** Unique token representing the payment source */
  token: string;
  /** Description of the payment */
  description: string;
  /** Number of installments for the payment */
  installments: number;
  /** Payment method ID (e.g., 'visa', 'master') */
  payment_method_id: string;
  /** Transaction amount (can be string or number) */
  transaction_amount: string | number;
  /** Optional issuer ID for credit card payments */
  issuer_id?: string | number;
  
  /** Card details */
  card_number?: string;
  security_code?: string;
  card_expiration_month?: string;
  card_expiration_year?: string;
  cardholder_name?: string;
  cardholder_identification?: {
    type: string;
    number: string;
  };
  
  /** Payer information */
  payer: {
    /** Payer's email */
    email: string;
    
    /** Payer's identification */
    identification: {
      /** Type of identification (e.g., 'DNI', 'CPF') */
      type: string;
      
      /** Identification number */
      number: string;
    };
    
    /** Cardholder information */
    cardholder_name?: string;
  };
  
  /** The following fields are used in the frontend for form handling */
  email?: string;
  documentType?: string;
  documentNumber?: string;
  type?: string;
  number?: string;
  issuer?: string;
  /** Device fingerprint for fraud prevention */
  device_fingerprint?: string;
}

/**
 * Represents the data for a card form submission.
 * This is a subset of PaymentData used specifically for form handling.
 */
export interface CardFormData
  extends Pick<
    PaymentData,
    | 'token'
    | 'issuer_id'
    | 'payment_method_id'
    | 'transaction_amount'
    | 'installments'
    | 'payer'
    | 'description'
  > {
  cardNumber?: string;
  cardholderName?: string;
  cardExpirationMonth?: string;
  cardExpirationYear?: string;
  securityCode?: string;
}

/**
 * Represents the state of a payment form.
 */
export interface PaymentFormState {
  /** User's email */
  email: string;
  /** Card number */
  cardNumber: string;
  /** Cardholder name */
  cardholderName: string;
  /** Cardholder email (duplicate of email for form handling) */
  cardholderEmail: string;
  /** Card expiration month (MM) */
  cardExpirationMonth: string;
  /** Card expiration year (YYYY) */
  cardExpirationYear: string;
  /** Card expiration date (MM/YY) - legacy, consider removing if not used */
  expiryDate: string;
  /** Card security code (CVV) */
  securityCode: string;
  /** User's document number */
  documentNumber: string;
  /** Type of document (e.g., 'DNI', 'CPF') */
  documentType: string;
  /** Document type (duplicate of documentType, consider consolidating) */
  docType: string;
  /** Document number (duplicate of documentNumber, consider consolidating) */
  docNumber: string;
  /** Type of identification (e.g., 'DNI', 'CPF') */
  identificationType: string;
  /** Identification number */
  identificationNumber: string;
  /** Card issuer (e.g., 'visa', 'master') */
  issuer: string;
  /** Number of installments */
  installments: string;
}

/**
 * Props for the PaymentCardForm component.
 */
export interface PaymentCardFormProps {
  /** Transaction amount */
  amount: number;
  /** Callback for successful payment */
  onPaymentSuccess: (formData: PaymentData) => Promise<void>;
  /** Optional error handler */
  onError?: (error: Error) => void;
  /** Form ID (optional) */
  formId?: string;
  /** Public key for MercadoPago */
  publicKey: string;
  /** User's email */
  email: string;
}

export interface Payer {
  email: string;
  identification: {
    type: string;
    number: string;
  };
  cardholder_name?: string;
}

/**
 * Represents a payment request to the API.
 */
export interface PaymentRequest {
  token: string;
  description: string;
  installments: number;
  payment_method_id: string;
  transaction_amount: number;
  payer: Payer;
  // The following are for internal use in the form
  email?: string;
  documentType?: string;
  documentNumber?: string;
  type?: string;
  number?: string;
}

/**
 * Represents a payment preference request.
 */
export interface PreferenceRequest {
  title: string;
  unit_price: number;
  success_url: string;
  failure_url: string;
  pending_url: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Response from a payment operation.
 */
export interface PaymentResponse {
  success: boolean;
  status?: string;
  status_detail?: string;
  id?: string | number;
  error?: string;
  details?: any;
  // Add other fields that might be returned by the API
  [key: string]: any;
}

/**
 * Response from creating a payment preference.
 */
export interface PreferenceResponse {
  success: boolean;
  preferenceId?: string;
  init_point?: string;
  sandbox_init_point?: string;
  error?: string;
  // Add other fields that might be returned by the API
  [key: string]: any;
}

/**
 * Extends CardState with additional form fields for the payment form
 */
export type FormCardState = {
    expiryDate: string;
    securityCode: string;
    email: string;
    cardholderName: string;
    cardNumber: string;
    cardholderEmail: string;
    cardExpirationMonth: string;
    cardExpirationYear: string;
    cvc: string;
    documentNumber: string;
    documentType: string;
    docType: string;
    docNumber: string;
    identificationType: string;
    identificationNumber: string;
    issuer: string;
    installments: string;
    focus?: 'number' | 'name' | 'expiry' | 'cvc';
};

/**
 * Represents an installment option for payment
 */
export interface InstallmentOption {
    installments: number;
    recommended_message: string;
    installments_amount: number;
    total_amount: number;
}

/**
 * Represents the state of a card form in the MercadoPago payment flow.
 */
export interface CardState {
  cvc: string;
  cardExpirationMonth: string;
  cardExpirationYear: string;
  focus?: 'number' | 'name' | 'expiry' | 'cvc';
  cardholderName: string;
  cardNumber: string;
  issuer: string;
  documentNumber: string;
  documentType: string;
  installments: string;
  cardholderEmail: string;
  email?: string;
}

/**
 * Props for the MercadoPagoWebForm component
 */
export interface MercadoPagoWebFormProps {
  /** Transaction amount */
  amount: number;
  /** Current status of the payment process */
  paymentStatus: 'idle' | 'loading' | 'success' | 'error' | 'processing';
  /** Error message if any */
  errorMessage: string;
  /** Callback when form is submitted */
  onSubmit: (formData: any) => Promise<void>;
  /** Handler for input changes */
  onInputChange: (field: string, value: string) => void;
  /** Handler for input focus events */
  onInputFocus: (field: string) => void;
}

export const INITIAL_STATE_CARD: CardState & FormCardState = {
  email: '',
  cardNumber: '',
  cardholderName: '',
  cardholderEmail: '',
  cardExpirationMonth: '',
  cardExpirationYear: '',
  expiryDate: '',
  securityCode: '',
  cvc: '',
  documentNumber: '',
  documentType: 'DNI',
  docType: 'DNI',
  docNumber: '',
  identificationType: 'DNI',
  identificationNumber: '',
  issuer: '',
  installments: '1',
  focus: 'number'
};

export interface CardFormFields {
  cardNumber: string;
  cardholderName: string;
  cardExpirationMonth: string;
  cardExpirationYear: string;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
  issuer: string;
  installments: string;
  email: string;
}