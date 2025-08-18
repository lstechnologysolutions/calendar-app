import { paymentService } from '@/lib/services/payment/paymentServerService';
import { 
  PaymentRequest, 
  PreferenceRequest 
} from '@/types/Payment/mercadoPago.types';

// Initialize payment service
paymentService.initialize();

export async function POST(request: Request) {
  try {
    // Parse the request body
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return Response.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return Response.json(
        { error: 'Missing required fields: type and data are required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'payment': {
        const paymentData = data as PaymentRequest;
        result = await paymentService.processPayment(paymentData);
        break;
      }
      
      case 'preference': {
        const preferenceData = data as PreferenceRequest;
        result = await paymentService.createPreference(preferenceData);
        break;
      }
      
      default:
        return Response.json(
          { error: 'Invalid type. Must be either "payment" or "preference"' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return Response.json(
        { error: result.error || 'An error occurred' },
        { status: 400 }
      );
    }

    return Response.json(result);
  } catch (error: any) {
    console.error('Payment API error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
