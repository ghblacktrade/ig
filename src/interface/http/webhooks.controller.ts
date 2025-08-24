import { Controller, Inject, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { HmacService } from '@src/hmacService/hmac.service';
import { safeEqualUtil } from '@src/hmacService/utils/safeEqual.util';
import { err } from '@src/common/wrappers/response.wrapper';
import { HOUR_TTL } from '@src/common/constants/ttl';
import { ERRORS } from '@src/interface/constants/errors';
import { IdempotencyPort } from '@src/common/idempotency/idempotency.port';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly hmac: HmacService,
    @Inject(IdempotencyPort)
    private readonly idempotency: IdempotencyPort,
  ) {}

  @Post('decard')
  async decard(@Req() req: Request) {
    const raw = req.body;
    const sigHeader = process.env.APP_SIGN_HEADER || 'X-Signature';
    const tsHeader = process.env.APP_TS_HEADER || 'X-Timestamp';

    const sig = (req.header(sigHeader) || '').toString();
    const ts = (req.header(tsHeader) || '').toString();

    const secret = process.env.DECARD_API_SECRET || '';
    const calcRes = this.hmac.signWithTs(raw, ts, secret);

    if (calcRes.isErr()) {
      return { ok: false, error: ERRORS.HMAC_FAILED };
    }

    const calc = calcRes.ok();

    if (!sig || !ts || !safeEqualUtil(sig, calc)) {
      return { ok: false, error: ERRORS.WEBHOOK_INVALID };
    }

    let body;
    try {
      body = JSON.parse(raw.toString('utf8'));
    } catch {
      return { ok: false, error: ERRORS.INVALID_JSON };
    }

    const eventId: string = body?.eventId || body?.id || body?.data?.id || '';

    if (!eventId) {
      return { ok: false, error: ERRORS.MISSING_EVENT_ID };
    }

    const fresh = await this.idempotency.saveIfNotExists(`webhook:decard:${eventId}`, HOUR_TTL);
    if (!fresh) {
      return { ok: true, duplicate: true };
    }

    // TODO: распарсить event/data и обработать
    return { ok: true };
  }
}
