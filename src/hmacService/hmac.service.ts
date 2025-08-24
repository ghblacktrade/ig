import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ok, Result } from '@src/common/wrappers/response.wrapper';
import { HmacServiceUseCase } from '@src/hmacService/ports/in/hmacService.useCase';

@Injectable()
export class HmacService implements HmacServiceUseCase {
  private readonly algo: string;

  constructor(private readonly config: ConfigService) {
    this.algo = this.config.get<string>('APP_HMAC_ALGO') ?? 'sha256';
  }

  public signRaw(raw: Buffer | string, secret: string): Result<string> {
    return ok(createHmac(this.algo, secret).update(raw).digest('hex'));
  }

  public signWithTs(raw: Buffer | string, ts: string, secret: string): Result<string> {
    const payload = typeof raw === 'string' ? raw : raw.toString('utf8');
    return ok(createHmac(this.algo, secret).update(`${ts}.${payload}`).digest('hex'));
  }
}
