import { PaymentData, PaymentStatus } from '@/types/Payment/MercadoPago';
/**
 * Props for the useMercadoPago hook
 */
export interface UseMercadoPagoProps {
    /** Public key for MercadoPago */
    publicKey: string;
    /** Transaction amount */
    amount: number;
    /** User's email for payment */
    email: string;
    /** Callback for successful payment */
    onPaymentSuccess: (data: PaymentData) => Promise<void>;
    /** Optional loading state handler */
    onLoadingChange?: (isLoading: boolean) => void;
    /** Optional error handler */
    onError?: (error: Error) => void;
}

export interface CardTokenData {
    id: string;
    public_key: string;
    card_id: string | null;
    luhn_validation: boolean;
    status: string;
    date_used: string | null;
    card_number_length: number;
    date_created: string;
    first_six_digits: string;
    last_four_digits: string;
    security_code_length: number;
    expiration_month: number;
    expiration_year: number;
    date_last_updated: string;
    date_due: string;
    live_mode: boolean;
    cardholder: {
        identification: {
            number: string;
            type: string;
        };
        name: string;
    };
}

/**
* Return type for the useMercadoPago hook
*/
export interface IdentificationType {
    id: string;
    name: string;
}

export const IDENTIFICATION_TYPES: IdentificationType[] = [
    { id: 'CC', name: 'Cédula de Ciudadanía' },
    { id: 'CE', name: 'Cédula de Extranjería' },
    { id: 'NIT', name: 'NIT' },
    { id: 'Otro', name: 'Otro' }
];

export interface UseMercadoPagoReturn {
    /** Current status of the payment process */
    paymentStatus: PaymentStatus;
    /** Whether the payment is being processed */
    isLoading: boolean;
    /** Any error that occurred during payment processing */
    error: Error | null;
    /** Function to initialize the card form */
    initCardForm: (formElement: HTMLFormElement) => void;
    /** Function to process the payment */
    processPayment: (paymentData: PaymentData) => Promise<void>;
    /** MercadoPago instance */
    mpInstance: any;
    /** Available identification types for the current country */
    identificationTypes: IdentificationType[];
}
