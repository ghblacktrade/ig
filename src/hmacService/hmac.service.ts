import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HmacService {
  private readonly algo: string;
  constructor(private readonly config: ConfigService) {
    this.algo = this.config.get<string>('app.hmacAlgo', 'sha256');
  }

  signRaw(raw: Buffer | string, secret: string): string {
    return createHmac(this.algo, secret).update(raw).digest('hex');
  }

  signWithTs(raw: Buffer | string, ts: string, secret: string): string {
    const payload = typeof raw === 'string' ? raw : raw.toString('utf8');
    return createHmac(this.algo, secret).update(`${ts}.${payload}`).digest('hex');
  }
}
