import { AsyncResult } from '@src/common/wrappers/response.wrapper';
import { Payment } from '@src/domain/entities/payment.entity';
import { Currency } from '@src/domain/enums/currency.enum';

export interface CreatePayinInput {
  amount: number;
  currency: Currency.TRY;
  description?: string;
}

export interface CreatePayoutInput {
  amount: number;
  currency: Currency.TRY;
  receiver: { iban?: string; paparaAccountNo?: string; email?: string; phone?: string };
  description?: string;
}

export interface WebhookVerifyInput {
  headers: Record<string, string | undefined>;
  rawBody: Buffer;
}

export interface PaymentGatewayPort {
  createPayin(input: CreatePayinInput): AsyncResult<Payment>;
  createPayout(input: CreatePayoutInput): AsyncResult<Payment>;
  getStatus(externalId: string): AsyncResult<Paymen>;
  verifyWebhook(input: WebhookVerifyInput): AsyncResult<{ event: string; data: any }>;
}