import { Injectable } from '@nestjs/common';
import {
  CreatePayinInput,
  CreatePayoutInput,
  PaymentGatewayPort,
  WebhookVerifyInput,
} from '@src/domain/ports/paymentGateway.port';
import { AsyncResult, err, ok } from '@src/common/wrappers/response.wrapper';
import { Payment } from '@src/domain/entities/payment.entity';
import { ERRORS } from '@src/infrastructure/adapters/constants/errors';
import { SimpleException } from '@src/common/wrappers/types/simpleException.type';
import { Currency } from '@src/domain/enums/currency.enum';
import { PaymentStatus } from '@src/domain/enums/paymentsStatus.enum';

type Stored = { createdAt: number; amount: number; currency: string; provider: string };

@Injectable()
export class MockGatewayAdapter implements PaymentGatewayPort {
  private store = new Map<string, Stored>();

  private makeId(prefix: string) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }

  public async createPayIn(input: CreatePayinInput): AsyncResult<Payment> {
    if (input.currency !== Currency.TRY) {
      return err(new SimpleException(ERRORS.CURRENCY_NOT_FOUND));
    }

    const id = this.makeId('payin');
    this.store.set(id, {
      createdAt: Date.now(),
      amount: input.amount,
      currency: input.currency,
      provider: 'mock',
    });

    return ok(new Payment(id, 'mock', PaymentStatus.PENDING, input.amount, input.currency, id));
  }

  public async createPayOut(input: CreatePayoutInput): AsyncResult<Payment, SimpleException> {
    if (input.currency !== 'TRY') {
      return err(new SimpleException(ERRORS.CURRENCY_NOT_FOUND));
    }
    const id = this.makeId('payout');
    this.store.set(id, {
      createdAt: Date.now(),
      amount: input.amount,
      currency: input.currency,
      provider: 'mock',
    });
    return ok(new Payment(id, 'mock', PaymentStatus.PENDING, input.amount, input.currency, id));
  }

  public async getStatus(externalId: string): AsyncResult<Payment, SimpleException> {
    const rec = this.store.get(externalId);
    if (!rec) {
      return ok(new Payment(externalId, 'mock', PaymentStatus.FAILED, 0, 'TRY', externalId));
    }

    const ageMs = Date.now() - rec.createdAt;
    const status = ageMs > 5000 ? 'succeeded' : 'pending';
    return ok(
      new Payment(externalId, rec.provider, status as PaymentStatus, rec.amount, rec.currency, externalId),
    );
  }

  public async verifyWebhook(_input: WebhookVerifyInput): AsyncResult<{ event: string; data: any }> {
    return ok({ event: 'mock.event', data: { ok: true } });
  }
}
