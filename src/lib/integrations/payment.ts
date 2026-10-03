import type { PaymentMethod } from "@prisma/client";

export type PaymentStartInput = {
  orderNumber: string;
  amount: number;
  customerName: string;
  customerPhone: string;
};

export type PaymentStartResult = {
  provider: string;
  providerReference?: string;
  redirectUrl?: string;
};

export interface PaymentProvider {
  method: PaymentMethod;
  startPayment(input: PaymentStartInput): Promise<PaymentStartResult>;
  verifyWebhook(payload: string, signature?: string | null): Promise<{ providerReference: string; status: "PAID" | "FAILED" | "REFUNDED" }>;
}

export class PaymentConfigurationError extends Error {}

class CashOnDeliveryProvider implements PaymentProvider {
  method: PaymentMethod = "COD";

  async startPayment(input: PaymentStartInput) {
    return { provider: "COD", providerReference: input.orderNumber };
  }

  async verifyWebhook(): Promise<{ providerReference: string; status: "PAID" | "FAILED" | "REFUNDED" }> {
    throw new Error("COD does not use payment webhooks.");
  }
}

class UnconfiguredPaymentProvider implements PaymentProvider {
  constructor(public method: PaymentMethod) {}

  async startPayment(): Promise<PaymentStartResult> {
    throw new PaymentConfigurationError(`${this.method} is not configured. Add the provider credentials before enabling it.`);
  }

  async verifyWebhook(): Promise<{ providerReference: string; status: "PAID" | "FAILED" | "REFUNDED" }> {
    throw new PaymentConfigurationError(`${this.method} is not configured.`);
  }
}

export function paymentProviderFor(method: PaymentMethod): PaymentProvider {
  if (method === "COD") return new CashOnDeliveryProvider();
  return new UnconfiguredPaymentProvider(method);
}
