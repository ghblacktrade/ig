import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { HmacService } from '@src/hmacService/hmac.service';
import { safeEqualUtil } from '@src/hmacService/utils/safeEqual.util';
import { err } from '@src/common/wrappers/response.wrapper';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly hmac: HmacService) {}

  @Post('decard')
  decard(@Req() req: Request) {
    const raw = req.body as Buffer;
    const sigHeader = process.env.APP_SIGN_HEADER || 'X-Signature';
    const tsHeader = process.env.APP_TS_HEADER || 'X-Timestamp';

    const sig = (req.header(sigHeader) || '').toString();
    const ts = (req.header(tsHeader) || '').toString();

    const secret = process.env.DECARD_API_SECRET || '';
    const calc = this.hmac.signWithTs(raw, ts, secret);

    if (calc.isErr()) {
      return err(calc.err());
    }

    if (!sig || !ts || !safeEqualUtil(sig, calc.ok())) {
      return { ok: false, error: 'WEBHOOK_SIGNATURE_INVALID' };
    }
    // TODO: распарсить event/data и обработать
    return { ok: true };
  }
}
