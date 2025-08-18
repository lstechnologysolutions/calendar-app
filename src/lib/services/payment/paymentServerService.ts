import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { getEnvVariable } from '@/utils/envUtils';
import { 
  PaymentData, 
  PreferenceRequest,
  PreferenceResponse,
  PaymentResponseWithMetadata
} from '@/types/Payment/mercadoPago.types';

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
  async processPayment(paymentData: PaymentData): Promise<PaymentResponseWithMetadata> {
    const paymentStartTime = new Date();
    const requestId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log the start of payment processing with masked sensitive data
    console.log(`[${requestId}] Starting payment processing at ${paymentStartTime.toISOString()}`);
    console.log(`[${requestId}] Payment data:`, {
      ...paymentData,
      token: paymentData.token ? `${paymentData.token.substring(0, 8)}...` : 'missing',
      payer: {
        ...paymentData.payer,
        identification: paymentData.payer?.identification ? {
          type: paymentData.payer.identification.type,
          number: paymentData.payer.identification.number ? '***' + paymentData.payer.identification.number.slice(-4) : 'missing'
        } : 'missing'
      }
    });

    try {
      // Validate required fields with detailed error messages
      const missingFields = [];
      if (!paymentData.token) missingFields.push('token');
      if (!paymentData.payment_method_id) missingFields.push('payment_method_id');
      if (!paymentData.payer?.email) missingFields.push('payer.email');
      
      if (missingFields.length > 0) {
        const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
        console.error(`[${requestId}] Validation error:`, errorMessage);
        throw new Error(errorMessage);
      }

      // Process card payment
      const isCardPayment = ['credit_card', 'debit_card'].includes(paymentData.payment_method_id);
      let cardNumber = '';
      
      if (isCardPayment) {
        // Get and clean card number
        cardNumber = (paymentData.card_number || '').replace(/\s+/g, '');
        
        // Basic card number validation
        if (cardNumber.length < 13 || cardNumber.length > 16) {
          throw new Error('Número de tarjeta inválido. Debe tener entre 13 y 16 dígitos.');
        }
        
        // Log BIN (first 6 digits) for debugging
        console.log(`[${requestId}] Processing card with BIN:`, cardNumber.substring(0, 6));
      }

      // Prepare payment request
      const paymentRequest: any = {
        transaction_amount: Number(paymentData.transaction_amount),
        token: paymentData.token,
        description: paymentData.description || 'Payment for service',
        installments: Number(paymentData.installments) || 1,
        payment_method_id: paymentData.payment_method_id,
        binary_mode: true,
        payer: {
          email: paymentData.payer.email.trim(),
          identification: {
            type: paymentData.payer.identification?.type || 'DNI',
            number: (paymentData.payer.identification?.number || '').toString().replace(/\D/g, '')
          },
          ...(paymentData.cardholder_name && { first_name: paymentData.cardholder_name })
        },
        metadata: {
          request_id: requestId,
          created_at: new Date().toISOString(),
          source: 'web'
        }
      };

      console.log(`[${requestId}] Sending payment request to MercadoPago:`, {
        ...paymentRequest,
        token: `${paymentRequest.token.substring(0, 8)}...`,
        payer: {
          ...paymentRequest.payer,
          identification: {
            ...paymentRequest.payer.identification,
            number: '***' + (paymentRequest.payer.identification.number || '').slice(-4)
          }
        }
      });

      // Process payment with MercadoPago
      const mpStartTime = Date.now();
      const payment = await paymentClient.create({ body: paymentRequest });
      const mpEndTime = Date.now();
      const processingTime = mpEndTime - mpStartTime;

      // Safely log payment response with null checks
      const paymentResponseLog: Record<string, unknown> = {
        status: payment.status,
        status_detail: payment.status_detail,
        payment_id: payment.id,
        payment_method: payment.payment_method_id,
        transaction_amount: payment.transaction_amount,
        installments: payment.installments
      };

      // Add payer info if available
      if (payment.payer) {
        paymentResponseLog.payer = {
          email: payment.payer.email ? '***' + String(payment.payer.email).substring(3) : 'missing',
          identification: payment.payer.identification ? {
            type: payment.payer.identification.type || 'missing',
            number: payment.payer.identification.number 
              ? '***' + String(payment.payer.identification.number).slice(-4) 
              : 'missing'
          } : 'missing'
        };
      } else {
        paymentResponseLog.payer = 'missing';
      }

      console.log(`[${requestId}] MercadoPago API response received in ${processingTime}ms`, paymentResponseLog);

      const response: PaymentResponseWithMetadata = {
        success: true,
        status: payment.status || 'pending',
        status_detail: payment.status_detail || 'pending',
        id: payment.id?.toString() || '',
        metadata: {
          request_id: requestId,
          processing_time_ms: processingTime
        }
      };

      return response;

    } catch (error: unknown) {
      const errorTime = new Date();
      const processingTime = errorTime.getTime() - paymentStartTime.getTime();
      const errorObj = error as Record<string, unknown>;
      
      // Prepare error details
      const errorDetails = {
        name: errorObj.name,
        message: errorObj.message,
        stack: typeof errorObj.stack === 'string' ? errorObj.stack.split('\n').slice(0, 3).join('\n') + '...' : 'No stack trace',
        code: errorObj.code,
        status: errorObj.status,
        statusCode: errorObj.statusCode,
        cause: errorObj.cause ? {
          code: (errorObj.cause as any)?.code,
          description: (errorObj.cause as any)?.description,
          data: (errorObj.cause as any)?.data
        } : undefined
      };
      
      console.error(`[${requestId}] Error processing payment after ${processingTime}ms:`, {
        error: errorDetails,
        timestamp: errorTime.toISOString()
      });
      
      // Log additional error details for debugging
      if (errorObj.cause) {
        console.error(`[${requestId}] Error cause:`, JSON.stringify(errorObj.cause, null, 2));
      }
      if (errorObj.response) {
        console.error(`[${requestId}] Error response:`, JSON.stringify(errorObj.response, null, 2));
      }

      const { errorMessage, errorStatus } = validateError(error as Error);
      const errorResponse: PaymentResponseWithMetadata = {
        success: false,
        error: errorMessage,
        status: errorStatus.toString(),
        details: (errorObj.cause || errorObj.response || errorObj.message) as string,
        metadata: {
          request_id: requestId,
          processing_time_ms: processingTime
        }
      };
      
      return errorResponse;
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
