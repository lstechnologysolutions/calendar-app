import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { getEnvVariable } from '@/utils/envUtils';
import { 
  PaymentData, 
  PaymentResponse, 
  PreferenceRequest,
  PreferenceResponse,
} from '@/types/Payment/MercadoPago';

// Validate required environment variables
const mercadoPagoAccessToken = getEnvVariable('MERCADOPAGO_ACCESS_TOKEN');
if (!mercadoPagoAccessToken) {
  throw new Error('MERCADOPAGO_ACCESS_TOKEN is not defined in environment variables');
}

// Initialize MercadoPago client
const client = new MercadoPagoConfig({ 
  accessToken: mercadoPagoAccessToken
});

// Initialize API clients
const paymentClient = new Payment(client);
const preferenceClient = new Preference(client);

/**
 * Validate and extract error information from MercadoPago errors
 */
const validateError = (error: any): { errorMessage: string; errorStatus: number } => {
  console.error('MercadoPago Error:', error);
  
  // Default error message and status
  let errorMessage = 'Error al procesar el pago. Por favor, intente nuevamente.';
  let errorStatus = 500;

  if (error.cause && Array.isArray(error.cause)) {
    // Handle API errors
    const apiError = error.cause[0];
    if (apiError) {
      errorMessage = apiError.description || errorMessage;
      errorStatus = apiError.status || errorStatus;
    }
  } else if (error.message) {
    // Handle general errors
    errorMessage = error.message;
  }

  return { errorMessage, errorStatus };
};

export const paymentService = {
  /**
   * Process a payment using MercadoPago
   */
  async processPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      console.log('Processing payment with data:', JSON.stringify(paymentData, null, 2));
  
      // Validate required fields
      if (!paymentData.token) {
        throw new Error('Missing required field: token');
      }

      if (!paymentData.payment_method_id) {
        throw new Error('Missing required field: payment_method_id');
      }
      if (!paymentData.payer?.email) {
        throw new Error('Missing required field: payer.email');
      }

      // Extract and clean card data if this is a card payment
      const isCardPayment = ['credit_card', 'debit_card'].includes(paymentData.payment_method_id);
      let cardNumber = '';
      
      if (isCardPayment) {
        // Get and clean card number
        cardNumber = (paymentData.card_number || '').replace(/\s+/g, '');
        
        // Basic card number validation
        if (cardNumber.length < 13 || cardNumber.length > 16) {
          throw new Error('Número de tarjeta inválido. Debe tener entre 13 y 16 dígitos.');
        }
        
        // Validate card BIN (first 6 digits)
        const bin = cardNumber.substring(0, 6);
        console.log('Processing card with BIN:', bin);
      }

      // Convert issuer_id to number if it's a string
      const issuerId = paymentData.issuer_id ? 
        (typeof paymentData.issuer_id === 'string' ? parseInt(paymentData.issuer_id, 10) : paymentData.issuer_id) : 
        undefined;

      // Build the payment request
      const paymentRequest: any = {
        transaction_amount: Number(paymentData.transaction_amount),
        token: paymentData.token,
        description: paymentData.description || 'Payment for service',
        installments: Number(paymentData.installments) || 1,
        payment_method_id: paymentData.payment_method_id,
        binary_mode: true,
        ...(issuerId && { issuer_id: issuerId }),
        payer: {
          email: paymentData.payer.email.trim(),
          identification: {
            type: paymentData.payer.identification?.type || 'DNI',
            number: (paymentData.payer.identification?.number || '').toString().replace(/\D/g, '')
          },
          ...(paymentData.cardholder_name && { first_name: paymentData.cardholder_name })
        },
      };

      // Add card data if this is a card payment
      if (isCardPayment && cardNumber) {
        paymentRequest.payment_method = {
          card: {
            cardholder: {
              name: paymentData.cardholder_name || paymentData.payer.identification?.number || '',
              identification: {
                type: paymentData.payer.identification?.type || 'DNI',
                number: (paymentData.payer.identification?.number || '').toString().replace(/\D/g, '')
              }
            },
            expiration_month: paymentData.card_expiration_month?.toString().padStart(2, '0') || '',
            expiration_year: paymentData.card_expiration_year?.toString().slice(-2) || '',
            security_code: paymentData.security_code || '',
            card_number: cardNumber
          }
        };
        
        // Add device fingerprint if available
        if (paymentData.device_fingerprint) {
          paymentRequest.device_fingerprint = paymentData.device_fingerprint;
        }
      }

      console.log('Sending payment request to MercadoPago:', JSON.stringify(paymentRequest, null, 2));
      
      const payment = await paymentClient.create({ body: paymentRequest });
      console.log('Payment response from MercadoPago:', JSON.stringify(payment, null, 2));

      return {
        success: true,
        status: payment.status,
        status_detail: payment.status_detail,
        id: payment.id,
      };
    } catch (error: any) {
      console.error('Error processing payment:', error);
      
      // Log additional error details for debugging
      if (error.cause) {
        console.error('Error cause:', JSON.stringify(error.cause, null, 2));
      }
      if (error.response) {
        console.error('Error response:', JSON.stringify(error.response, null, 2));
      }
      
      const { errorMessage, errorStatus } = validateError(error);
      return {
        success: false,
        error: errorMessage,
        status: errorStatus.toString(),
        details: error.cause || error.response || error.message,
      };
    }
  },

  /**
   * Validate and extract error information from MercadoPago errors
   */
  validateError(error: any) {
    let errorMessage = 'Unknown error occurred during payment processing';
    let errorStatus = 400;

    if (error.cause) {
      const sdkErrorMessage = error.cause[0]?.description;
      errorMessage = sdkErrorMessage || errorMessage;
      errorStatus = error.status || errorStatus;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return { 
      errorMessage: errorMessage.toString(), 
      errorStatus: typeof errorStatus === 'number' ? errorStatus : 400 
    };
  },

  /**
   * Create a payment preference
   */
  async createPreference(preferenceData: PreferenceRequest): Promise<PreferenceResponse> {
    try {
      // Generate a unique ID for this item
      const itemId = `item_${Date.now()}`;
      
      const preferenceRequest = {
        items: [
          {
            id: itemId,
            title: preferenceData.title,
            quantity: 1,
            unit_price: Number(preferenceData.unit_price),
            currency_id: 'USD',
            description: preferenceData.title,
            category_id: 'services',
          },
        ],
        back_urls: {
          success: preferenceData.success_url,
          failure: preferenceData.failure_url,
          pending: preferenceData.pending_url,
        },
        auto_return: 'approved',
        binary_mode: true, // Prevents payments in pending state
        statement_descriptor: 'SERVICE_BOOKING', // Will appear on customer's credit card statement
      };

      const preference = await preferenceClient.create({
        body: preferenceRequest,
      });

      return {
        success: true,
        preferenceId: preference.id,
        init_point: preference.init_point || '',
        sandbox_init_point: preference.sandbox_init_point || ''
      };
    } catch (error: any) {
      console.error('Error creating preference:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment preference',
      };
    }
  },

  /**
   * Initialize MercadoPago SDK
   */
  initialize(): { success: boolean; publicKey: string } {
    // This method is kept for backward compatibility
    // The SDK is now initialized when the module is loaded
    return {
      success: true,
      publicKey: process.env.EXPO_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '',
    };
  }
};
