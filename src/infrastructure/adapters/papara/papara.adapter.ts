import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, retry } from 'rxjs';
import { Payment } from '@src/domain/entities/payment.entity';
import { ConfigType } from '@nestjs/config';
import { papara as paparaCfg } from '../../../common/config/providers.config';
import {
  CreatePayinInput,
  CreatePayoutInput,
  PaymentGatewayPort,
  WebhookVerifyInput,
} from '@src/domain/ports/paymentGateway.port';
import { AsyncResult, err, ok } from '@src/common/wrappers/response.wrapper';
import { Currency } from '@src/domain/enums/currency.enum';
import { ERRORS } from '@src/infrastructure/adapters/constants/errors';
import { SimpleException } from '@src/common/wrappers/types/simpleException.type';
import { PaymentStatus } from '@src/domain/enums/paymentsStatus.enum';
import { expoJitterBackoff } from '@src/interface/http/utils/expoJitterBackoff.util';

@Injectable()
export class PaparaAdapter implements PaymentGatewayPort {
  constructor(
    private readonly http: HttpService,
    @Inject(paparaCfg.KEY) private readonly cfg: ConfigType<typeof paparaCfg>,
  ) {}

  public async createPayIn(input: CreatePayinInput): AsyncResult<Payment> {
    if (input.currency !== Currency.TRY) {
      return err(new SimpleException(ERRORS.CURRENCY_NOT_FOUND));
    }

    const payload = {
      amount: input.amount,
      currency: input.currency,
      orderId: 'ord_' + Date.now(),
      description: input.description,
    };

    try {
      const { data } = await firstValueFrom(
        this.http
          .post(this.cfg.baseUrl + '/payments', payload, {
            headers: { ApiKey: this.cfg.apiKey, 'Content-Type': 'application/json' },
          })
          .pipe(retry({ count: 3, delay: expoJitterBackoff(3, 300, 4000) })),
      );

      return ok(
        new Payment(
          data.id ?? payload.orderId,
          'papara',
          data.status ?? PaymentStatus.PENDING,
          data.amount ?? input.amount,
          data.currency ?? input.currency,
          data.id,
        ),
      );
    } catch (e: any) {
      return err(e);
    }
  }

  public async createPayOut(input: CreatePayoutInput): AsyncResult<Payment> {
    if (input.currency !== Currency.TRY) {
      return err(new SimpleException(ERRORS.CURRENCY_NOT_FOUND));
    }

    const payload = {
      amount: input.amount,
      currency: input.currency,
      description: input.description,
      iban: input.receiver.iban,
      accountNumber: input.receiver.paparaAccountNo,
      email: input.receiver.email,
      phoneNumber: input.receiver.phone,
    };

    try {
      const { data } = await firstValueFrom(
        this.http
          .post(this.cfg.baseUrl + '/banking/withdrawal', payload, {
            headers: { ApiKey: this.cfg.apiKey, 'Content-Type': 'application/json' },
          })
          .pipe(retry({ count: 3, delay: expoJitterBackoff(3, 300, 4000) })),
      );

      return ok(
        new Payment(
          data.id ?? 'payout_' + Date.now(),
          'papara',
          data.status ?? PaymentStatus.PENDING,
          data.amount ?? input.amount,
          data.currency ?? input.currency,
          data.id,
        ),
      );
    } catch (e: any) {
      return err(e);
    }
  }

  public async getStatus(externalId: string): AsyncResult<Payment> {
    try {
      const { data } = await firstValueFrom(
        this.http
          .get(this.cfg.baseUrl + `/payments/${externalId}`, {
            headers: { ApiKey: this.cfg.apiKey },
          })
          .pipe(retry({ count: 3, delay: expoJitterBackoff(3, 300, 4000) })),
      );

      return ok(
        new Payment(
          data.id ?? externalId,
          'papara',
          data.status ?? PaymentStatus.PENDING,
          data.amount ?? 0,
          data.currency ?? Currency.TRY,
          data.id,
        ),
      );
    } catch (e: any) {
      return err(e);
    }
  }

  async verifyWebhook(_: WebhookVerifyInput): AsyncResult<{ event: string; data: any }> {
    return ok({ event: 'unknown', data: {} });
  }
}
