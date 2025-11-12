// MonCash Payment Provider Stub
// This is a placeholder implementation for MonCash integration

export interface MonCashConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

export interface CreatePaymentParams {
  amountCents: number;
  orderId: string;
}

export interface PaymentResponse {
  paymentToken: string;
  paymentUrl: string;
  transactionId: string;
}

export interface VerifyPaymentParams {
  transactionId: string;
}

export interface PaymentStatus {
  status: "PENDING" | "PAID" | "FAILED";
  transactionId: string;
  amount: number;
}

export class MonCashProvider {
  private config: MonCashConfig;

  constructor(config: MonCashConfig) {
    this.config = config;
  }

  /**
   * Create a new payment
   * TODO: Implement actual MonCash API integration
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
    // Stub implementation
    console.log("MonCash createPayment called with:", params);
    
    return {
      paymentToken: `mock_token_${Date.now()}`,
      paymentUrl: `${this.config.baseUrl}/payment?token=mock_token`,
      transactionId: `txn_${Date.now()}`,
    };
  }

  /**
   * Verify a payment
   * TODO: Implement actual MonCash API integration
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<PaymentStatus> {
    // Stub implementation
    console.log("MonCash verifyPayment called with:", params);
    
    return {
      status: "PENDING",
      transactionId: params.transactionId,
      amount: 0,
    };
  }

  /**
   * Get access token
   * TODO: Implement OAuth flow
   */
  private async getAccessToken(): Promise<string> {
    // Stub implementation
    return "mock_access_token";
  }
}

// Export singleton instance
export const monCash = new MonCashProvider({
  clientId: process.env.MONCASH_CLIENT_ID || "",
  clientSecret: process.env.MONCASH_CLIENT_SECRET || "",
  baseUrl: process.env.MONCASH_BASE_URL || "https://sandbox.moncashbutton.digicelgroup.com",
});
