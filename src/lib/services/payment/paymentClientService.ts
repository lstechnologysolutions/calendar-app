type ApiResponse<T = any> = {
  data?: T;
  error?: string;
  status: number;
};

export const paymentService = {
  async processPayment(paymentData: any): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'payment',
          data: paymentData
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error processing payment');
      }
      
      return { data, status: response.status };
    } catch (error) {
      console.error('Payment processing error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500 
      };
    }
  },
  
  async createPreference(preferenceData: any): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/payment/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'preference',
          data: preferenceData
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error creating preference');
      }
      
      return { data, status: response.status };
    } catch (error) {
      console.error('Error creating preference:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500 
      };
    }
  },
  
  async getPaymentMethods(): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/payment/methods');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error fetching payment methods');
      }
      
      return { data, status: response.status };
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500 
      };
    }
  }
};
