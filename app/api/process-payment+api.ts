import { MercadoPagoConfig, Payment } from 'mercadopago';
import { 
  PaymentRequest, 
} from '@/types/Payment/mercadoPago.types';

export async function POST(request: Request) {
  if (request.method !== 'POST') {
    return Response.json({ message: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const paymentData: PaymentRequest = body;

    if (!paymentData.token || !paymentData.payer?.email || !paymentData.payer.identification?.number) {
      return Response.json({ 
        message: 'Missing required fields',
        required: ['token', 'payer.email', 'payer.identification.number']
      }, { status: 400 });
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
      options: { timeout: 5000 }
    });

    const payment = new Payment(client);

    const result = await payment.create({
      body: {
        token: paymentData.token,
        description: paymentData.description,
        installments: paymentData.installments,
        payment_method_id: paymentData.payment_method_id,
        transaction_amount: paymentData.transaction_amount,
        payer: {
          email: paymentData.payer.email,
          identification: paymentData.payer.identification
        }
      }
    });

    if (result.status === 'approved' || result.status === 'pending') {
      return Response.json({
        success: true,
        paymentId: result.id,
        status: result.status,
        statusDetail: result.status_detail
      }, { status: 200 });
    }

    return Response.json({
      success: false,
      message: 'Payment was not processed successfully',
      status: result.status,
      statusDetail: result.status_detail
    }, { status: 400 });

  } catch (error: any) {
    console.error('Error processing payment:', error);
    
    if (error.response?.data) {
      const errorData = error.response.data;
      console.error('MercadoPago API Error:', {
        status: error.status,
        error: errorData,
        cause: error.cause || []
      });
      
      let errorMessage = 'Error al procesar el pago';
      if (errorData.cause && errorData.cause.length > 0) {
        errorMessage = errorData.cause
          .map((cause: any) => cause.description || cause.code || 'Error desconocido')
          .join('. ');
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
      
      return Response.json({
        success: false,
        message: errorMessage,
        error: errorData,
        status: error.status || 500
      }, { status: error.status || 500 });
    }

    console.error('Unexpected error:', error);
    return Response.json({
      success: false,
      message: 'Error interno del servidor. Por favor, intente nuevamente más tarde.',
      error: error.message || 'Error desconocido',
      status: 500
    }, { status: 500 });
  }
}
