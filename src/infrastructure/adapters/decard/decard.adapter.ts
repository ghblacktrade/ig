import { Inject, Injectable } from '@nestjs/common';
import {
  CreatePayinInput,
  CreatePayoutInput,
  PaymentGatewayPort,
  WebhookVerifyInput,
} from '@src/domain/ports/paymentGateway.port';
import { HttpService } from '@nestjs/axios';
import { HmacService } from '@src/hmacService/hmac.service';
import { ConfigType } from '@nestjs/config';
import { AsyncResult, err, ok } from '@src/common/wrappers/response.wrapper';
import { Payment } from '@src/domain/entities/payment.entity';
import { Currency } from '@src/domain/enums/currency.enum';
import { firstValueFrom, retry } from 'rxjs';
import { ERRORS } from '@src/infrastructure/adapters/constants/errors';
import { decard } from '@src/common/config/providers.config';
import { SimpleException } from '@src/common/wrappers/types/simpleException.type';
import { safeEqualUtil } from '@src/hmacService/utils/safeEqual.util';
import { DeCardSignatureService } from '@src/infrastructure/adapters/decard/decardSignature.service';
import { expoJitterBackoff } from '@src/interface/http/utils/expoJitterBackoff.util';
import { mapDecardStatus } from '@src/infrastructure/mappers/status.mapper';

@Injectable()
export class DeCardAdapter implements PaymentGatewayPort {
  constructor(
    private readonly http: HttpService,
    private readonly hmac: HmacService,
    private readonly signature: DeCardSignatureService,
    @Inject(decard.KEY)
    private readonly cfg: ConfigType<typeof decard>,
  ) {}

  private apiSignHeaderFromPayload(payload: Record<string, any>) {
    const sign = this.signature.buildApiSign(this.cfg.secret, payload);
    return { 'Api-sign': sign };
  }

  async createPayIn(input: CreatePayinInput): AsyncResult<Payment, SimpleException> {
    if (input.currency !== Currency.TRY) {
      return err(new SimpleException(ERRORS.CURRENCY_NOT_FOUND));
    }

    const url = this.cfg.baseUrl + '/rest/paymentgate/order/create/';
    const payload = {
      shop_key: this.cfg.shopKey,
      amount: Math.round(input.amount),
      order_currency: Currency.TRY,
      payment_currency: Currency.TRY,
      payment_method: 'online_bank_transfer',
      order_number: 'ord_' + Date.now(),
      payment_details: input.description ?? '',
      lang: 'EN',
    };

    const headers = {
      'Content-Type': 'application/json',
      ...this.apiSignHeaderFromPayload(payload),
    };

    try {
      const { data } = await firstValueFrom(
        this.http
          .post(url, payload, { headers })
          .pipe(retry({ count: 3, delay: expoJitterBackoff(3, 300, 4000) })),
      );

      const payment = new Payment(
        data?.token ?? payload.order_number,
        'decard',
        mapDecardStatus(data?.status),
        Number(data?.amount ?? payload.amount),
        String(data?.payment_currency ?? 'TRY'),
        data?.token ?? data?.id,
      );
      return ok(payment);
    } catch (e: any) {
      return err(e);
    }
  }

  async createPayOut(input: CreatePayoutInput): AsyncResult<Payment> {
    if (input.currency !== Currency.TRY) {
      return err(new SimpleException(ERRORS.CURRENCY_NOT_FOUND));
    }

    const url = this.cfg.baseUrl + '/rest/paymentgate/payout/create/';
    const payload = {
      shop_key: this.cfg.shopKey,
      amount: Math.round(input.amount),
      payment_currency: Currency.TRY,
      iban: input.receiver.iban,
      description: input.description ?? '',
    };
    const headers = {
      'Content-Type': 'application/json',
      ...this.apiSignHeaderFromPayload(payload),
    };

    try {
      const { data } = await firstValueFrom(
        this.http
          .post(url, payload, { headers })
          .pipe(retry({ count: 3, delay: expoJitterBackoff(3, 300, 4000) })),
      );

      const payment = new Payment(
        data?.token ?? 'payout_' + Date.now(),
        'decard',
        mapDecardStatus(data?.status),
        Number(data?.amount ?? payload.amount),
        String(data?.payment_currency ?? Currency.TRY),
        data?.token ?? data?.id,
      );

      return ok(payment);
    } catch (e: any) {
      return err(e);
    }
  }

  public async getStatus(externalId: string): AsyncResult<Payment> {
    const params: Record<string, any> = {
      shop_key: this.cfg.shopKey,
      order_token: externalId,
    };
    const headers = {
      'Content-Type': 'application/json',
      'Api-sign': this.signature.buildApiSign(this.cfg.secret, params),
    };
    const url = this.cfg.baseUrl + '/rest/paymentgate/order/info/';

    try {
      const search = new URLSearchParams(params).toString();
      const { data } = await firstValueFrom(
        this.http
          .get(`${url}?${search}`, { headers })
          .pipe(retry({ count: 3, delay: expoJitterBackoff(3, 300, 4000) })),
      );

      const it = Array.isArray(data) ? data[0] : data;

      const payment = new Payment(
        it?.token ?? externalId,
        'decard',
        mapDecardStatus(it?.status),
        Number(it?.amount ?? it?.approved_amount ?? 0),
        String(it?.payment_currency ?? Currency.TRY),
        it?.token,
      );

      return ok(payment);
    } catch (e: any) {
      return err(e);
    }
  }

  async getBalance(): AsyncResult<any> {
    const params = { shop_key: this.cfg.shopKey };
    const headers = {
      'Content-Type': 'application/json',
      'Api-sign': this.signature.buildApiSign(this.cfg.secret, params),
    };

    const url = this.cfg.baseUrl + '/rest/paymentgate/balance/';
    const qs = new URLSearchParams(params).toString();
    const { data } = await firstValueFrom(this.http.get(`${url}?${qs}`, { headers }));
    return data;
  }

  async verifyWebhook({
    headers,
    rawBody,
  }: WebhookVerifyInput): AsyncResult<{ event: string; data: any }> {
    const ts = (headers['x-timestamp'] as string) || '';
    const sig = (headers['x-signature'] as string) || '';

    if (!ts || !sig) {
      return err(new SimpleException(ERRORS.WEBHOOK_NOT_FOUND));
    }

    const calcRes = this.hmac.signWithTs(rawBody, ts, this.cfg.secret);

    if (calcRes.isErr()) {
      return err(new SimpleException(ERRORS.WEBHOOK_INVALID));
    }

    const calc = calcRes.ok();

    if (!safeEqualUtil(sig, calc)) {
      return err(new SimpleException(ERRORS.WEBHOOK_INVALID));
    }

    return ok({ event: 'unknown', data: {} });
  }
}
